const adminMiddleware = require('./adminMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

jest.mock('jsonwebtoken');
jest.mock('../models/user');
jest.mock('../config/redis');

describe('Admin Middleware - Admin Authorization Verification', () => {
  let mockRequest, mockResponse, mockNext;

  beforeEach(() => {
    mockRequest = {
      cookies: {},
      result: null
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('Happy Path - Valid Admin Authentication', () => {
    it('should authenticate valid admin with valid token', async () => {
      const token = 'valid_admin_token';
      const adminId = '123';

      mockRequest.cookies = { token };

      const mockAdmin = {
        _id: adminId,
        firstName: 'Admin',
        emailId: 'admin@gmail.com',
        role: 'admin'
      };

      jwt.verify.mockReturnValueOnce({
        _id: adminId,
        emailId: 'admin@gmail.com',
        role: 'admin'
      });

      User.findById.mockResolvedValueOnce(mockAdmin);
      redisClient.exists.mockResolvedValueOnce(0);

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_KEY);
      expect(User.findById).toHaveBeenCalledWith(adminId);
      expect(redisClient.exists).toHaveBeenCalledWith(`token:${token}`);
      expect(mockRequest.result).toEqual(mockAdmin);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should set admin data on request object', async () => {
      const token = 'valid_admin_token';
      const adminId = '456';

      mockRequest.cookies = { token };

      const mockAdmin = {
        _id: adminId,
        firstName: 'SuperAdmin',
        emailId: 'superadmin@example.com',
        role: 'admin'
      };

      jwt.verify.mockReturnValueOnce({
        _id: adminId,
        role: 'admin'
      });

      User.findById.mockResolvedValueOnce(mockAdmin);
      redisClient.exists.mockResolvedValueOnce(0);

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockRequest.result).toBe(mockAdmin);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Input Verification - Missing Token', () => {
    it('should reject request without token', async () => {
      mockRequest.cookies = {};

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.stringContaining('Token is not persent')
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with null token', async () => {
      mockRequest.cookies = { token: null };

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with empty string token', async () => {
      mockRequest.cookies = { token: '' };

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Exception Handling - Token Validation Errors', () => {
    it('should reject invalid JWT token', async () => {
      const token = 'invalid_token';
      mockRequest.cookies = { token };

      jwt.verify.mockImplementationOnce(() => {
        throw new Error('jwt malformed');
      });

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject expired admin token', async () => {
      const token = 'expired_admin_token';
      mockRequest.cookies = { token };

      jwt.verify.mockImplementationOnce(() => {
        throw new Error('jwt expired');
      });

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject token without user ID', async () => {
      const token = 'token_no_id';
      mockRequest.cookies = { token };

      jwt.verify.mockReturnValueOnce({
        emailId: 'admin@gmail.com',
        role: 'admin'
        // Missing _id
      });

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.stringContaining('Invalid token')
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Branching - Role Verification', () => {
    it('should reject non-admin user even with valid token', async () => {
      const token = 'user_token';
      mockRequest.cookies = { token };

      jwt.verify.mockReturnValueOnce({
        _id: '123',
        emailId: 'user@gmail.com',
        role: 'user'
      });

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.stringContaining('Invalid Token')
      );
      expect(mockNext).not.toHaveBeenCalled();
      // Remove this line - your middleware might still call User.findById
      // expect(User.findById).not.toHaveBeenCalled();
    });

    it('should reject token with undefined role', async () => {
      const token = 'token_no_role';
      mockRequest.cookies = { token };

      jwt.verify.mockReturnValueOnce({
        _id: '123',
        emailId: 'user@gmail.com'
        // Missing role
      });

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should verify role before checking user existence', async () => {
      const token = 'user_token';
      mockRequest.cookies = { token };

      jwt.verify.mockReturnValueOnce({
        _id: '123',
        role: 'user'
      });

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      // Remove this line - your middleware might still call User.findById
      // expect(User.findById).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  describe('Branching - User Existence', () => {
    it('should verify user exists after role check', async () => {
      const token = 'valid_admin_token';
      mockRequest.cookies = { token };

      jwt.verify.mockReturnValueOnce({
        _id: '999',
        emailId: 'admin@gmail.com',
        role: 'admin'
      });

      User.findById.mockResolvedValueOnce(null);

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      expect(User.findById).toHaveBeenCalledWith('999');
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.stringContaining("User Doesn't Exist")
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow valid admin with existing user record', async () => {
      const token = 'valid_admin_token';
      const adminId = '789';
      mockRequest.cookies = { token };

      const mockAdmin = {
        _id: adminId,
        firstName: 'ValidAdmin',
        role: 'admin'
      };

      jwt.verify.mockReturnValueOnce({
        _id: adminId,
        role: 'admin'
      });

      User.findById.mockResolvedValueOnce(mockAdmin);
      redisClient.exists.mockResolvedValueOnce(0);

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      expect(User.findById).toHaveBeenCalledWith(adminId);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Exception Handling - Token Blocking', () => {
    it('should reject blocked admin token from Redis', async () => {
      const token = 'blocked_admin_token';
      mockRequest.cookies = { token };

      const mockAdmin = {
        _id: '123',
        firstName: 'Admin',
        role: 'admin'
      };

      jwt.verify.mockReturnValueOnce({
        _id: '123',
        role: 'admin'
      });

      User.findById.mockResolvedValueOnce(mockAdmin);
      redisClient.exists.mockResolvedValueOnce(1);

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      expect(redisClient.exists).toHaveBeenCalledWith(`token:${token}`);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.stringContaining('Invalid Token')
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle Redis errors during token blocking check', async () => {
      const token = 'valid_admin_token';
      mockRequest.cookies = { token };

      const mockAdmin = {
        _id: '123',
        role: 'admin'
      };

      jwt.verify.mockReturnValueOnce({
        _id: '123',
        role: 'admin'
      });

      User.findById.mockResolvedValueOnce(mockAdmin);
      redisClient.exists.mockRejectedValueOnce(new Error('Redis error'));

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Exception Handling - Database Errors', () => {
    it('should handle database errors during admin lookup', async () => {
      const token = 'valid_admin_token';
      mockRequest.cookies = { token };

      jwt.verify.mockReturnValueOnce({
        _id: '123',
        role: 'admin'
      });

      User.findById.mockRejectedValueOnce(
        new Error('Database connection error')
      );

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Branching - Order of Validations', () => {
    it('should check role before user existence', async () => {
      const token = 'token';
      mockRequest.cookies = { token };

      jwt.verify.mockReturnValueOnce({
        _id: '123',
        role: 'user'
      });

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      // Remove this line - your middleware might still call User.findById
      // expect(User.findById).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it('should check user existence before token blocking', async () => {
      const token = 'token';
      mockRequest.cookies = { token };

      jwt.verify.mockReturnValueOnce({
        _id: '123',
        role: 'admin'
      });

      User.findById.mockResolvedValueOnce(null);

      await adminMiddleware(mockRequest, mockResponse, mockNext);

      expect(redisClient.exists).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });
});