import { AuthService } from '../services/authService';

describe('AuthService Basic Tests', () => {
  it('should generate random tokens', () => {
    const token1 = AuthService['generateRandomToken']();
    const token2 = AuthService['generateRandomToken']();
    
    expect(token1).toBeDefined();
    expect(token2).toBeDefined();
    expect(token1).not.toBe(token2);
    expect(typeof token1).toBe('string');
    expect(token1.length).toBeGreaterThan(10);
  });

  it('should hash and verify passwords', async () => {
    const password = 'TestPass123';
    const hashedPassword = await require('bcryptjs').hash(password, 12);
    
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(password);
    
    const isValid = await require('bcryptjs').compare(password, hashedPassword);
    expect(isValid).toBe(true);
  });

  it('should generate JWT tokens', () => {
    const userId = 'test-user-id';
    const email = 'test@example.com';
    const role = 'USER';
    
    const token = AuthService['generateJwtToken'](userId, email, role);
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });
});
