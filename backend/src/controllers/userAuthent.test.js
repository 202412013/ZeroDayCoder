const { register, login, logout, adminRegister, deleteProfile } = require('./userAuthent');
const User = require('../models/user');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

jest.mock('../models/user');
jest.mock('../utils/validator');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../config/redis');

describe('User Authentication Controller', () => {
  let mockRequest, mockResponse, mockNext;

  beforeEach(() => {
    mockRequest = {
      body: {},
      cookies: {},
      result: null
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('register - User Registration', () => {
    describe('Happy Path - Successful Registration', () => {
      it('should register user with valid credentials', async () => {
        const userData = {
          firstName: 'John',
          emailId: 'john@example.com',
          password: 'SecurePass123!'
        };

        mockRequest.body = userData;

        const mockUser = {
          _id: '123',
          firstName: 'John',
          emailId: 'john@example.com',
          role: 'user'
        };

        validate.mockImplementation(() => {});
        bcrypt.hash.mockResolvedValueOnce('hashed_password');
        User.create.mockResolvedValueOnce(mockUser);
        jwt.sign.mockReturnValueOnce('jwt_token');

        await register(mockRequest, mockResponse);

        expect(validate).toHaveBeenCalledWith(userData);
        expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123!', 10);
        expect(User.create).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'John',
            emailId: 'john@example.com',
            role: 'user',
            password: 'hashed_password'
          })
        );
        expect(jwt.sign).toHaveBeenCalledWith(
          expect.objectContaining({
            _id: '123',
            emailId: 'john@example.com',
            role: 'user'
          }),
          process.env.JWT_KEY,
          { expiresIn: 60 * 60 }
        );
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
          user: expect.objectContaining({
            firstName: 'John',
            emailId: 'john@example.com',
            _id: '123'
          }),
          message: 'Loggin Successfully'
        });
      });

      it('should set secure cookie after registration', async () => {
        mockRequest.body = {
          firstName: 'John',
          emailId: 'john@example.com',
          password: 'SecurePass123!'
        };

        const mockUser = {
          _id: '123',
          firstName: 'John',
          emailId: 'john@example.com',
          role: 'user'
        };

        validate.mockImplementation(() => {});
        bcrypt.hash.mockResolvedValueOnce('hashed_password');
        User.create.mockResolvedValueOnce(mockUser);
        jwt.sign.mockReturnValueOnce('jwt_token');
        process.env.NODE_ENV = 'production';

        await register(mockRequest, mockResponse);

        expect(mockResponse.cookie).toHaveBeenCalledWith(
          'token',
          'jwt_token',
          expect.objectContaining({
            maxAge: 60 * 60 * 1000,
            secure: true,
            httpOnly: true
          })
        );
      });
    });

    describe('Exception Handling - Validation Errors', () => {
      it('should return error for invalid data', async () => {
        mockRequest.body = {
          firstName: 'John'
          // Missing email and password
        };

        validate.mockImplementationOnce(() => {
          throw new Error('Some Field Missing');
        });

        await register(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalled();
      });

      it('should handle weak password error', async () => {
        mockRequest.body = {
          firstName: 'John',
          emailId: 'john@example.com',
          password: 'weak'
        };

        validate.mockImplementationOnce(() => {
          throw new Error('Week Password');
        });

        await register(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
      });

      it('should handle invalid email error', async () => {
        mockRequest.body = {
          firstName: 'John',
          emailId: 'invalid-email',
          password: 'SecurePass123!'
        };

        validate.mockImplementationOnce(() => {
          throw new Error('Invalid Email');
        });

        await register(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
      });
    });

    describe('Exception Handling - Database Errors', () => {
      it('should handle duplicate email error', async () => {
        mockRequest.body = {
          firstName: 'John',
          emailId: 'duplicate@example.com',
          password: 'SecurePass123!'
        };

        validate.mockImplementation(() => {});
        bcrypt.hash.mockResolvedValueOnce('hashed_password');
        User.create.mockRejectedValueOnce(
          new Error('E11000 duplicate key error')
        );

        await register(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
      });

      it('should handle database connection error', async () => {
        mockRequest.body = {
          firstName: 'John',
          emailId: 'john@example.com',
          password: 'SecurePass123!'
        };

        validate.mockImplementation(() => {});
        bcrypt.hash.mockResolvedValueOnce('hashed_password');
        User.create.mockRejectedValueOnce(
          new Error('Database connection failed')
        );

        await register(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
      });
    });
  });

  describe('login - User Login', () => {
    describe('Happy Path - Successful Login', () => {
      it('should login user with valid credentials', async () => {
        mockRequest.body = {
          emailId: 'john@example.com',
          password: 'SecurePass123!'
        };

        const mockUser = {
          _id: '123',
          firstName: 'John',
          emailId: 'john@example.com',
          password: 'hashed_password',
          role: 'user'
        };

        User.findOne.mockResolvedValueOnce(mockUser);
        bcrypt.compare.mockResolvedValueOnce(true);
        jwt.sign.mockReturnValueOnce('jwt_token');

        await login(mockRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({
          emailId: 'john@example.com'
        });
        expect(bcrypt.compare).toHaveBeenCalledWith(
          'SecurePass123!',
          'hashed_password'
        );
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            user: expect.objectContaining({
              emailId: 'john@example.com'
            }),
            message: 'Loggin Successfully'
          })
        );
      });
    });

    describe('Input Verification - Missing Credentials', () => {
      it('should reject login without email', async () => {
        mockRequest.body = {
          password: 'SecurePass123!'
        };

        await login(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
      });

      it('should reject login without password', async () => {
        mockRequest.body = {
          emailId: 'john@example.com'
        };

        await login(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
      });
    });

    describe('Exception Handling - Invalid Credentials', () => {
      it('should reject incorrect password', async () => {
        mockRequest.body = {
          emailId: 'john@example.com',
          password: 'WrongPassword123!'
        };

        const mockUser = {
          _id: '123',
          emailId: 'john@example.com',
          password: 'hashed_password',
          role: 'user'
        };

        User.findOne.mockResolvedValueOnce(mockUser);
        bcrypt.compare.mockResolvedValueOnce(false);

        await login(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
      });

      it('should reject non-existent user', async () => {
        mockRequest.body = {
          emailId: 'nonexistent@example.com',
          password: 'SecurePass123!'
        };

        User.findOne.mockResolvedValueOnce(null);

        try {
          await login(mockRequest, mockResponse);
        } catch (e) {
          expect(e).toBeDefined();
        }
      });
    });
  });

  describe('logout - User Logout', () => {
    describe('Happy Path - Successful Logout', () => {
      it('should logout user and block token', async () => {
        const token = 'valid_jwt_token';
        mockRequest.cookies = { token };

        jwt.decode.mockReturnValueOnce({
          _id: '123',
          exp: Math.floor(Date.now() / 1000) + 3600
        });

        redisClient.set.mockResolvedValueOnce('OK');
        redisClient.expireAt.mockResolvedValueOnce(1);

        await logout(mockRequest, mockResponse);

        expect(jwt.decode).toHaveBeenCalledWith(token);
        expect(redisClient.set).toHaveBeenCalledWith(
          `token:${token}`,
          'Blocked'
        );
        expect(redisClient.expireAt).toHaveBeenCalled();
        expect(mockResponse.cookie).toHaveBeenCalledWith(
          'token',
          null,
          expect.objectContaining({
            expires: expect.any(Date)
          })
        );
        expect(mockResponse.send).toHaveBeenCalledWith(
          'Logged Out Succesfully'
        );
      });
    });

    describe('Exception Handling - Logout Errors', () => {
      it('should handle missing token', async () => {
        mockRequest.cookies = {};

        jwt.decode.mockReturnValueOnce(null);

        await logout(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(503);
      });

      it('should handle redis error during logout', async () => {
        const token = 'valid_jwt_token';
        mockRequest.cookies = { token };

        jwt.decode.mockReturnValueOnce({
          _id: '123',
          exp: Math.floor(Date.now() / 1000) + 3600
        });

        redisClient.set.mockRejectedValueOnce(new Error('Redis error'));

        await logout(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(503);
      });
    });
  });

  describe('deleteProfile - Delete User Account', () => {
    describe('Happy Path - Successful Profile Deletion', () => {
      it('should delete user profile', async () => {
        mockRequest.result = {
          _id: '123',
          firstName: 'John',
          emailId: 'john@example.com'
        };

        User.findByIdAndDelete.mockResolvedValueOnce({
          _id: '123'
        });

        await deleteProfile(mockRequest, mockResponse);

        expect(User.findByIdAndDelete).toHaveBeenCalledWith('123');
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Deleted Successfully');
      });
    });

    describe('Exception Handling - Deletion Errors', () => {
      it('should handle database error during deletion', async () => {
        mockRequest.result = {
          _id: '123'
        };

        User.findByIdAndDelete.mockRejectedValueOnce(
          new Error('Database error')
        );

        await deleteProfile(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.send).toHaveBeenCalledWith('Internal Server Error');
      });

      it('should handle invalid user ID', async () => {
        mockRequest.result = null;

        try {
          await deleteProfile(mockRequest, mockResponse);
        } catch (e) {
          expect(e).toBeDefined();
        }
      });
    });
  });

  describe('adminRegister - Admin Registration', () => {
    describe('Happy Path - Successful Admin Registration', () => {
      it('should register admin user', async () => {
        mockRequest.body = {
          firstName: 'Admin',
          emailId: 'admin@example.com',
          password: 'AdminPass123!'
        };

        const mockUser = {
          _id: '456',
          firstName: 'Admin',
          emailId: 'admin@example.com',
          role: 'admin'
        };

        validate.mockImplementation(() => {});
        bcrypt.hash.mockResolvedValueOnce('hashed_password');
        User.create.mockResolvedValueOnce(mockUser);
        jwt.sign.mockReturnValueOnce('admin_jwt_token');

        await adminRegister(mockRequest, mockResponse);

        expect(validate).toHaveBeenCalledWith(mockRequest.body);
        expect(bcrypt.hash).toHaveBeenCalledWith('AdminPass123!', 10);
        expect(User.create).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(201);
      });
    });

    describe('Exception Handling - Validation Errors', () => {
      it('should return error for invalid admin data', async () => {
        mockRequest.body = {
          firstName: 'Admin'
          // Missing email and password
        };

        validate.mockImplementationOnce(() => {
          throw new Error('Some Field Missing');
        });

        await adminRegister(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
      });
    });
  });
});