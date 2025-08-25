import { Request, Response } from 'express';
import { DataQualityController } from '../controllers/dataQualityController';
import { DataQualityService } from '../services/dataQualityService';
import { DataQualityCheck, DataQualityMetrics, AnomalyDetectionResult, DataQualityReport } from '../types/dataProcessing';

// Mock DataQualityService
const mockDataQualityService = {
  validateDataQuality: jest.fn(),
  calculateQualityMetrics: jest.fn(),
  detectAnomalies: jest.fn(),
  generateQualityReport: jest.fn(),
  getQualityRules: jest.fn(),
  addQualityRule: jest.fn(),
  removeQualityRule: jest.fn(),
  getAlerts: jest.fn(),
  resolveAlert: jest.fn(),
  createAlert: jest.fn(),
} as unknown as DataQualityService;

describe('DataQualityController', () => {
  let controller: DataQualityController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    controller = new DataQualityController(mockDataQualityService);
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('validateDataQuality', () => {
    it('should validate data quality successfully', async () => {
      const mockQualityCheck: DataQualityCheck = {
        isValid: true,
        errors: [],
        warnings: [],
        dataSource: 'google-analytics',
        timestamp: new Date()
      };

      (mockDataQualityService.validateDataQuality as jest.Mock).mockResolvedValue(mockQualityCheck);

      mockRequest.body = {
        source: 'google-analytics',
        businessEntityId: 'test-business-id',
        timestamp: '2024-01-01T00:00:00.000Z',
        data: { propertyId: 'GA4_PROPERTY_ID' },
        metadata: {}
      };

      await controller.validateDataQuality(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Data quality validation passed',
        qualityCheck: mockQualityCheck
      });
    });

    it('should return 400 for missing required fields', async () => {
      mockRequest.body = {
        source: 'google-analytics',
        // Missing businessEntityId, timestamp, and data
        metadata: {}
      };

      await controller.validateDataQuality(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing required fields: source, businessEntityId, timestamp, and data are required',
        qualityCheck: null
      });
    });

    it('should return 400 for invalid timestamp format', async () => {
      mockRequest.body = {
        source: 'google-analytics',
        businessEntityId: 'test-business-id',
        timestamp: 'invalid-timestamp',
        data: { propertyId: 'GA4_PROPERTY_ID' },
        metadata: {}
      };

      await controller.validateDataQuality(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid timestamp format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)',
        qualityCheck: null
      });
    });

    it('should handle service errors gracefully', async () => {
      (mockDataQualityService.validateDataQuality as jest.Mock).mockRejectedValue(new Error('Service error'));

      mockRequest.body = {
        source: 'google-analytics',
        businessEntityId: 'test-business-id',
        timestamp: '2024-01-01T00:00:00.000Z',
        data: { propertyId: 'GA4_PROPERTY_ID' },
        metadata: {}
      };

      await controller.validateDataQuality(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error during data quality validation',
        qualityCheck: null
      });
    });
  });

  describe('getQualityMetrics', () => {
    it('should return quality metrics successfully', async () => {
      const mockMetrics: DataQualityMetrics = {
        totalRecords: 100,
        validRecords: 95,
        invalidRecords: 5,
        qualityScore: 95,
        errorRate: 5,
        warningRate: 0,
        completenessScore: 98,
        accuracyScore: 95,
        consistencyScore: 92,
        timelinessScore: 95
      };

      (mockDataQualityService.calculateQualityMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      mockRequest.params = { businessEntityId: 'test-business-id' };
      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await controller.getQualityMetrics(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Data quality metrics retrieved successfully',
        metrics: mockMetrics
      });
    });

    it('should return 400 for missing business entity ID', async () => {
      mockRequest.params = {};
      mockRequest.query = {};

      await controller.getQualityMetrics(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Business entity ID is required',
        metrics: null
      });
    });

    it('should return 400 for invalid date format', async () => {
      mockRequest.params = { businessEntityId: 'test-business-id' };
      mockRequest.query = {
        startDate: 'invalid-date',
        endDate: '2024-01-31'
      };

      await controller.getQualityMetrics(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)',
        metrics: null
      });
    });

    it('should use default dates when not provided', async () => {
      const mockMetrics: DataQualityMetrics = {
        totalRecords: 100,
        validRecords: 95,
        invalidRecords: 5,
        qualityScore: 95,
        errorRate: 5,
        warningRate: 0,
        completenessScore: 98,
        accuracyScore: 95,
        consistencyScore: 92,
        timelinessScore: 95
      };

      (mockDataQualityService.calculateQualityMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      mockRequest.params = { businessEntityId: 'test-business-id' };
      mockRequest.query = {};

      await controller.getQualityMetrics(mockRequest as Request, mockResponse as Response);

      expect(mockDataQualityService.calculateQualityMetrics).toHaveBeenCalledWith(
        'test-business-id',
        expect.any(Date), // Default start date (30 days ago)
        expect.any(Date), // Default end date (now)
        undefined
      );
    });
  });

  describe('detectAnomalies', () => {
    it('should detect anomalies successfully', async () => {
      const mockAnomalies: AnomalyDetectionResult = {
        hasAnomalies: true,
        anomalies: [
          {
            type: 'outlier',
            metric: 'sessions',
            value: 200,
            expectedRange: [80, 120],
            severity: 'high',
            description: 'Value 200 is 3.2 standard deviations from mean',
            timestamp: new Date()
          }
        ],
        confidence: 0.8,
        recommendations: ['Review anomalous data points for data quality issues']
      };

      (mockDataQualityService.detectAnomalies as jest.Mock).mockResolvedValue(mockAnomalies);

      mockRequest.params = { businessEntityId: 'test-business-id' };
      mockRequest.query = {
        metricType: 'sessions',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await controller.detectAnomalies(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Anomaly detection completed successfully',
        anomalies: mockAnomalies
      });
    });

    it('should return 400 for missing business entity ID', async () => {
      mockRequest.params = {};
      mockRequest.query = { metricType: 'sessions' };

      await controller.detectAnomalies(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Business entity ID and metric type are required',
        anomalies: null
      });
    });

    it('should return 400 for missing metric type', async () => {
      mockRequest.params = { businessEntityId: 'test-business-id' };
      mockRequest.query = {};

      await controller.detectAnomalies(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Business entity ID and metric type are required',
        anomalies: null
      });
    });
  });

  describe('generateQualityReport', () => {
    it('should generate quality report successfully', async () => {
      const mockReport: DataQualityReport = {
        businessEntityId: 'test-business-id',
        timestamp: new Date(),
        source: 'all',
        totalRecords: 100,
        validRecords: 95,
        invalidRecords: 5,
        qualityScore: 95,
        ruleViolations: {},
        recommendations: ['Implement additional data validation rules']
      };

      (mockDataQualityService.generateQualityReport as jest.Mock).mockResolvedValue(mockReport);

      mockRequest.params = { businessEntityId: 'test-business-id' };
      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await controller.generateQualityReport(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Data quality report generated successfully',
        report: mockReport
      });
    });

    it('should return 400 for missing business entity ID', async () => {
      mockRequest.params = {};
      mockRequest.query = {};

      await controller.generateQualityReport(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Business entity ID is required',
        report: null
      });
    });
  });

  describe('getQualityRules', () => {
    it('should return quality rules successfully', async () => {
      const mockRules = [
        {
          id: 'rule1',
          name: 'Test Rule 1',
          description: 'Test description 1',
          field: 'testField1',
          ruleType: 'required' as const,
          validation: jest.fn(),
          errorMessage: 'Test error 1',
          severity: 'error' as const
        }
      ];

      (mockDataQualityService.getQualityRules as jest.Mock).mockReturnValue(mockRules);

      await controller.getQualityRules(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Data quality rules retrieved successfully',
        rules: mockRules
      });
    });
  });

  describe('addQualityRule', () => {
    it('should add quality rule successfully', async () => {
      const ruleData = {
        name: 'Test Rule',
        description: 'Test description',
        field: 'testField',
        ruleType: 'custom' as const,
        validation: jest.fn(),
        errorMessage: 'Test error',
        severity: 'warning' as const
      };

      mockRequest.body = ruleData;

      await controller.addQualityRule(mockRequest as Request, mockResponse as Response);

      expect(mockDataQualityService.addQualityRule).toHaveBeenCalledWith(ruleData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Data quality rule added successfully',
        rule: ruleData
      });
    });

    it('should return 400 for missing required fields', async () => {
      mockRequest.body = {
        name: 'Test Rule',
        // Missing other required fields
      };

      await controller.addQualityRule(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing required fields: name, field, ruleType, validation, and errorMessage are required',
        rule: null
      });
    });

    it('should return 400 for invalid rule type', async () => {
      mockRequest.body = {
        name: 'Test Rule',
        description: 'Test description',
        field: 'testField',
        ruleType: 'invalid_type',
        validation: jest.fn(),
        errorMessage: 'Test error',
        severity: 'error'
      };

      await controller.addQualityRule(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid rule type. Must be one of: required, format, range, custom',
        rule: null
      });
    });

    it('should return 400 for invalid severity', async () => {
      mockRequest.body = {
        name: 'Test Rule',
        description: 'Test description',
        field: 'testField',
        ruleType: 'custom',
        validation: jest.fn(),
        errorMessage: 'Test error',
        severity: 'invalid_severity'
      };

      await controller.addQualityRule(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid severity. Must be one of: error, warning',
        rule: null
      });
    });
  });

  describe('removeQualityRule', () => {
    it('should remove quality rule successfully', async () => {
      (mockDataQualityService.removeQualityRule as jest.Mock).mockReturnValue(true);

      mockRequest.params = { ruleId: 'rule1' };

      await controller.removeQualityRule(mockRequest as Request, mockResponse as Response);

      expect(mockDataQualityService.removeQualityRule).toHaveBeenCalledWith('rule1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Data quality rule removed successfully',
        removed: true
      });
    });

    it('should return 404 for non-existent rule', async () => {
      (mockDataQualityService.removeQualityRule as jest.Mock).mockReturnValue(false);

      mockRequest.params = { ruleId: 'non_existent_rule' };

      await controller.removeQualityRule(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Data quality rule not found',
        removed: false
      });
    });

    it('should return 400 for missing rule ID', async () => {
      mockRequest.params = {};

      await controller.removeQualityRule(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Rule ID is required',
        removed: false
      });
    });
  });

  describe('getAlerts', () => {
    it('should return alerts successfully', async () => {
      const mockAlerts = [
        {
          id: 'alert1',
          businessEntityId: 'test-business-id',
          alertType: 'quality_threshold' as const,
          severity: 'high' as const,
          message: 'Quality score below threshold',
          details: {},
          timestamp: new Date(),
          isResolved: false
        }
      ];

      (mockDataQualityService.getAlerts as jest.Mock).mockResolvedValue(mockAlerts);

      mockRequest.params = { businessEntityId: 'test-business-id' };
      mockRequest.query = { limit: '10', offset: '0', resolved: 'false' };

      await controller.getAlerts(mockRequest as Request, mockResponse as Response);

      expect(mockDataQualityService.getAlerts).toHaveBeenCalledWith('test-business-id', 10, 0, false);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Data quality alerts retrieved successfully',
        alerts: mockAlerts
      });
    });

    it('should return 400 for missing business entity ID', async () => {
      mockRequest.params = {};
      mockRequest.query = {};

      await controller.getAlerts(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Business entity ID is required',
        alerts: null
      });
    });
  });

  describe('resolveAlert', () => {
    it('should resolve alert successfully', async () => {
      (mockDataQualityService.resolveAlert as jest.Mock).mockResolvedValue(true);

      mockRequest.params = { alertId: 'alert1' };
      mockRequest.body = { resolvedBy: 'test-user' };

      await controller.resolveAlert(mockRequest as Request, mockResponse as Response);

      expect(mockDataQualityService.resolveAlert).toHaveBeenCalledWith('alert1', 'test-user');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Data quality alert resolved successfully',
        resolved: true
      });
    });

    it('should return 400 for missing alert ID', async () => {
      mockRequest.params = {};
      mockRequest.body = { resolvedBy: 'test-user' };

      await controller.resolveAlert(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Alert ID and resolvedBy are required',
        resolved: false
      });
    });

    it('should return 400 for missing resolvedBy', async () => {
      mockRequest.params = { alertId: 'alert1' };
      mockRequest.body = {};

      await controller.resolveAlert(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Alert ID and resolvedBy are required',
        resolved: false
      });
    });

    it('should return 404 for non-existent alert', async () => {
      (mockDataQualityService.resolveAlert as jest.Mock).mockResolvedValue(false);

      mockRequest.params = { alertId: 'non_existent_alert' };
      mockRequest.body = { resolvedBy: 'test-user' };

      await controller.resolveAlert(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Data quality alert not found',
        resolved: false
      });
    });
  });

  describe('createAlert', () => {
    it('should create alert successfully', async () => {
      const alertData = {
        businessEntityId: 'test-business-id',
        alertType: 'quality_threshold' as const,
        severity: 'high' as const,
        message: 'Quality score below threshold',
        details: { threshold: 80, currentScore: 75 }
      };

      const mockCreatedAlert = {
        ...alertData,
        id: 'alert_123',
        timestamp: new Date(),
        isResolved: false
      };

      (mockDataQualityService.createAlert as jest.Mock).mockResolvedValue(mockCreatedAlert);

      mockRequest.body = alertData;

      await controller.createAlert(mockRequest as Request, mockResponse as Response);

      expect(mockDataQualityService.createAlert).toHaveBeenCalledWith({
        ...alertData,
        isResolved: false
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Data quality alert created successfully',
        alert: mockCreatedAlert
      });
    });

    it('should return 400 for missing required fields', async () => {
      mockRequest.body = {
        businessEntityId: 'test-business-id',
        // Missing other required fields
      };

      await controller.createAlert(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing required fields: businessEntityId, alertType, severity, and message are required',
        alert: null
      });
    });

    it('should return 400 for invalid alert type', async () => {
      mockRequest.body = {
        businessEntityId: 'test-business-id',
        alertType: 'invalid_type',
        severity: 'high',
        message: 'Test message'
      };

      await controller.createAlert(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid alert type. Must be one of: quality_threshold, anomaly_detected, validation_failure, data_drift',
        alert: null
      });
    });

    it('should return 400 for invalid severity', async () => {
      mockRequest.body = {
        businessEntityId: 'test-business-id',
        alertType: 'quality_threshold',
        severity: 'invalid_severity',
        message: 'Test message'
      };

      await controller.createAlert(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid severity. Must be one of: low, medium, high, critical',
        alert: null
      });
    });
  });
});
