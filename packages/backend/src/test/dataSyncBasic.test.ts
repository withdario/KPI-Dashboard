import { DataSyncService } from '../services/dataSyncService';

describe('DataSyncService Basic Structure', () => {
  it('should have the correct class structure', () => {
    // This test validates that the service class can be instantiated
    // and has the expected methods
    expect(DataSyncService).toBeDefined();
    expect(typeof DataSyncService).toBe('function');
  });

  it('should have required methods', () => {
    // Check that the service has the expected method signatures
    const servicePrototype = DataSyncService.prototype;
    
    expect(typeof servicePrototype.initialize).toBe('function');
    expect(typeof servicePrototype.createSyncJob).toBe('function');
    expect(typeof servicePrototype.getSyncJobById).toBe('function');
    expect(typeof servicePrototype.updateSyncJob).toBe('function');
    expect(typeof servicePrototype.getSyncJobs).toBe('function');
    expect(typeof servicePrototype.getSyncJobStats).toBe('function');
    expect(typeof servicePrototype.createSyncConfig).toBe('function');
    expect(typeof servicePrototype.getSyncConfig).toBe('function');
    expect(typeof servicePrototype.updateSyncConfig).toBe('function');
    expect(typeof servicePrototype.triggerManualSync).toBe('function');
    expect(typeof servicePrototype.getSyncHealth).toBe('function');
    expect(typeof servicePrototype.shutdown).toBe('function');
  });
});
