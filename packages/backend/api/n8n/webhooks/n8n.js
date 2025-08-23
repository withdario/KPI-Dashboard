export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    
    // Log the incoming webhook
    console.log('n8n webhook received:', payload);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Webhook received successfully',
      eventId: `webhook-${Date.now()}`,
      payload: payload,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process webhook'
    });
  }
}
