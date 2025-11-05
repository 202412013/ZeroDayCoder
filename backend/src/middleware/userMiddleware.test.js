const userMiddleware = require('./userMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

jest.mock('jsonwebtoken');
jest.mock('../models/user');
jest.mock('../config/redis');

describe('User Middleware - Authentication Verification', () => {
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

  describe('Happy Path - Valid Authentication', () => {
    it('should authenticate valid user with valid token', async () => {
      const token = 'valid_jwt_token';
      const userId = '123';

      mockRequest.cookies = { token };

      const mockUser = {
        _id: userId,
        firstName: 'Yash',
        emailId: 'yash@gmail.com',
        role: 'user'
      };

      jwt.verify.mockReturnValueOnce({
        _id: userId,
        emailId: 'yash@gmail.com',
        role: 'user'
      });

      User.findById.mockResolvedValueOnce(mockUser);
      redisClient.exists.mockResolvedValueOnce(0);

      await userMiddleware(mockRequest, mockResponse, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_KEY);
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(redisClient.exists).toHaveBeenCalledWith(`token:${token}`);
      expect(mockRequest.result).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should set user data on request object', async () => {
      const token = 'valid_jwt_token';
      const userId = '456';

      mockRequest.cookies = { token };

      const mockUser = {
        _id: userId,
        firstName: 'Yash',
        emailId: 'yash@gmail.com',
        role: 'user',
        problemSolved: []
      };

      jwt.verify.mockReturnValueOnce({
        _id: userId
      });

      User.findById.mockResolvedValueOnce(mockUser);
      redisClient.exists.mockResolvedValueOnce(0);

      await userMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockRequest.result).toBe(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Input Verification - Missing Token', () => {
    it('should reject request without token', async () => {
      mockRequest.cookies = {};

      await userMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.stringContaining('Token is not persent')
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with undefined token', async () => {
      mockRequest.cookies = { token: undefined };

      await userMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with null token', async () => {
      mockRequest.cookies = { token: null };

      await userMiddleware(mockRequest, mockResponse, mockNext);

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

      await userMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject expired token', async () => {
      const token = 'expired_token';
      mockRequest.cookies = { token };

      jwt.verify.mockImplementationOnce(() => {
        throw new Error('jwt expired');
      });

      await userMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject token without user ID', async () => {
      const token = 'token_no_id';
      mockRequest.cookies = { token };

      jwt.verify.mockReturnValueOnce({
        emailId: 'yash@gmail.com'
        // Missing _id
      });

      await userMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.stringContaining('Invalid token')
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Branching - User Existence', () => {
    it('should reject token for non-existent user', async () => {
      const token = 'valid_token';
      mockRequest.cookies = { token };

      jwt.verify.mockReturnValueOnce({
        _id: '999',
        emailId: 'yash@gmail.com'
      });

      User.findById.mockResolvedValueOnce(null);

      await userMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.stringContaining("User Doesn't Exist")
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should find user by ID from token', async () => {
      const token = 'valid_token';
      const userId = '789';
      mockRequest.cookies = { token };

      const mockUser = {
        _id: userId,
        firstName: 'Bob'
      };

      jwt.verify.mockReturnValueOnce({ _id: userId });
      User.findById.mockResolvedValueOnce(mockUser);
      redisClient.exists.mockResolvedValueOnce(0);

      await userMiddleware(mockRequest, mockResponse, mockNext);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Exception Handling - Token Blocking', () => {
    it('should reject blocked token from Redis', async () => {
      const token = 'blocked_token';
      mockRequest.cookies = { token };

      const mockUser = {
        _id: '123',
        firstName: 'Yash'
      };

      jwt.verify.mockReturnValueOnce({
        _id: '123'
      });

      User.findById.mockResolvedValueOnce(mockUser);
      redisClient.exists.mockResolvedValueOnce(1);

      await userMiddleware(mockRequest, mockResponse, mockNext);

      expect(redisClient.exists).toHaveBeenCalledWith(`token:${token}`);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.stringContaining('Invalid Token')
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      const token = 'valid_token';
      mockRequest.cookies = { token };

      const mockUser = {
        _id: '123'
      };

      jwt.verify.mockReturnValueOnce({
        _id: '123'
      });

      User.findById.mockResolvedValueOnce(mockUser);
      redisClient.exists.mockRejectedValueOnce(new Error('Redis unavailable'));

      await userMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Exception Handling - Database Errors', () => {
    it('should handle database errors during user lookup', async () => {
      const token = 'valid_token';
      mockRequest.cookies = { token };

      jwt.verify.mockReturnValueOnce({
        _id: '123'
      });

      User.findById.mockRejectedValueOnce(
        new Error('Database connection error')
      );

      await userMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});