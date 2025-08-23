import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Webhook-specific rate limiting
 * More permissive than general API rate limiting for webhook reliability
 */
export const webhookRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Allow up to 1000 webhooks per 15 minutes per IP
  message: {
    error: 'Too many webhook requests from this IP, please try again later.',
    retryAfter: 15 // minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests for webhook monitoring
  keyGenerator: (req) => {
    // Use IP address for rate limiting
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

/**
 * Webhook Authentication Middleware
 * Validates webhook tokens for n8n integration
 */
export const webhookAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers['x-webhook-token'] || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ error: 'Webhook token required' });
      return;
    }
    
    // Find integration by token
    const integration = await prisma.n8nIntegration.findFirst({
      where: { 
        webhookToken: token as string,
        isActive: true
      }
    });
    
    if (!integration) {
      res.status(401).json({ error: 'Invalid webhook token' });
      return;
    }
    
    // Attach integration to request for later use
    (req as any).n8nIntegration = integration;
    next();
  } catch (error) {
    console.error('Webhook authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * IP validation middleware
 * Optional: Restrict webhooks to specific IP ranges
 */
export const webhookIpValidation = (allowedIps?: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip IP validation if no IPs are configured or if all IPs are empty strings
    if (!allowedIps || allowedIps.length === 0 || allowedIps.every(ip => !ip.trim())) {
      // No IP restrictions configured
      return next();
    }
    
    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    if (!clientIp) {
      return res.status(400).json({
        error: 'IP validation failed',
        message: 'Unable to determine client IP address'
      });
    }
    
    // Check if client IP is in allowed list
    const isAllowed = allowedIps.some(allowedIp => {
      // Support CIDR notation (e.g., "192.168.1.0/24")
      if (allowedIp.includes('/')) {
        return isIpInCidr(clientIp, allowedIp);
      }
      // Exact IP match
      return clientIp === allowedIp;
    });
    
    if (!isAllowed) {
      console.warn(`Webhook rejected from unauthorized IP: ${clientIp}`);
      return res.status(403).json({
        error: 'IP not authorized',
        message: 'Webhook requests from this IP address are not allowed'
      });
    }
    
    next();
  };
};

/**
 * Webhook Payload Validation Middleware
 * Validates webhook payload size and format
 */
export const webhookPayloadValidation = (maxSize: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSizeBytes = parseSize(maxSize);
    
    if (contentLength > maxSizeBytes) {
      res.status(413).json({ 
        error: 'Payload too large',
        maxSize,
        actualSize: `${contentLength} bytes`
      });
      return;
    }
    
    next();
  };
};

/**
 * Webhook Signature Validation Middleware
 * Validates webhook signatures for enhanced security
 */
export const webhookSignatureValidation = (req: Request, res: Response, next: NextFunction) => {
  const signatureSecret = process.env.WEBHOOK_SIGNATURE_SECRET;
  
  // Skip signature validation if not configured or if it's a placeholder value
  if (!signatureSecret || signatureSecret === 'your-webhook-signature-secret') {
    // Skip signature validation if not configured
    return next();
  }
  
  const signature = req.headers['x-webhook-signature'];
  if (!signature) {
    return res.status(401).json({ error: 'Webhook signature required' });
  }
  
  // Basic signature validation (can be enhanced with crypto)
  const expectedSignature = `sha256=${Buffer.from(signatureSecret).toString('hex')}`;
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }
  
  next();
};

/**
 * Helper function to check if IP is in CIDR range
 */
function isIpInCidr(ip: string, cidr: string): boolean {
  try {
    const [network, bits] = cidr.split('/');
    const mask = ~((1 << (32 - parseInt(bits))) - 1);
    
    const ipNum = ipToNumber(ip);
    const networkNum = ipToNumber(network);
    
    return (ipNum & mask) === (networkNum & mask);
  } catch {
    return false;
  }
}

/**
 * Helper function to convert IP string to number
 */
function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

/**
 * Helper function to parse size string (e.g., "1mb" -> 1048576)
 */
function parseSize(size: string): number {
  const units: { [key: string]: number } = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };
  
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
  if (!match) {
    return 1024 * 1024; // Default to 1MB
  }
  
  const value = parseFloat(match[1]);
  const unit = match[2];
  
  return Math.floor(value * units[unit]);
}

/**
 * Webhook Monitoring Middleware
 * Logs webhook requests and responses for debugging and analytics
 */
export const webhookMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalEnd = res.end;
  
  // Override res.end to capture response data
  res.end = function(chunk?: any, encoding?: any): Response {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Log webhook request/response
    console.log(`Webhook ${req.method} ${req.path} - Status: ${statusCode}, Duration: ${duration}ms`);
    
    // Call original end function
    originalEnd.call(this, chunk, encoding);
    
    return this;
  };
  
  next();
};
