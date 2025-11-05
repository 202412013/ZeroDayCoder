import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  registerUser,
  loginUser,
  checkAuth,
  logoutUser
} from './authSlice';
import * as axiosClient from './utils/axiosClient';

vi.mock('./utils/axiosClient');

describe('Auth Slice - Redux Authentication State Management', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer
      }
    });
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('registerUser Thunk - User Registration', () => {
    describe('Happy Path - Successful Registration', () => {
      it('should handle successful user registration', async () => {
        const userData = {
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

        axiosClient.default.post.mockResolvedValueOnce({
          data: { user: mockUser }
        });

        await store.dispatch(registerUser(userData));

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockUser);
        expect(state.error).toBeNull();
        expect(state.loading).toBe(false);
      });

      it('should set loading state during registration', async () => {
        const userData = {
          firstName: 'Jane',
          emailId: 'jane@example.com',
          password: 'SecurePass123!'
        };

        const mockUser = {
          _id: '456',
          firstName: 'Jane',
          emailId: 'jane@example.com',
          role: 'user'
        };

        axiosClient.default.post.mockResolvedValueOnce({
          data: { user: mockUser }
        });

        // Check pending state before action completes
        const pendingAction = store.dispatch(registerUser(userData));

        expect(store.getState().auth.loading).toBe(true);
        expect(store.getState().auth.error).toBeNull();

        await pendingAction;
      });
    });

    describe('Exception Handling - Registration Errors', () => {
      it('should handle registration failure', async () => {
        const userData = {
          firstName: 'John',
          emailId: 'duplicate@example.com',
          password: 'SecurePass123!'
        };

        const error = new Error('User already exists');
        axiosClient.default.post.mockRejectedValueOnce(error);

        await store.dispatch(registerUser(userData));

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.error).toBeDefined();
        expect(state.loading).toBe(false);
      });

      it('should handle network error during registration', async () => {
        const userData = {
          firstName: 'John',
          emailId: 'john@example.com',
          password: 'SecurePass123!'
        };

        const error = new Error('Network error');
        axiosClient.default.post.mockRejectedValueOnce(error);

        await store.dispatch(registerUser(userData));

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
        expect(state.error).toBeDefined();
      });

      it('should handle invalid response from server', async () => {
        const userData = {
          firstName: 'John',
          emailId: 'john@example.com',
          password: 'SecurePass123!'
        };

        axiosClient.default.post.mockResolvedValueOnce({
          data: { user: null }
        });

        await store.dispatch(registerUser(userData));

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
      });
    });
  });

  describe('loginUser Thunk - User Login', () => {
    describe('Happy Path - Successful Login', () => {
      it('should handle successful user login', async () => {
        const credentials = {
          emailId: 'john@example.com',
          password: 'SecurePass123!'
        };

        const mockUser = {
          _id: '123',
          firstName: 'John',
          emailId: 'john@example.com',
          role: 'user'
        };

        axiosClient.default.post.mockResolvedValueOnce({
          data: { user: mockUser }
        });

        await store.dispatch(loginUser(credentials));

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockUser);
        expect(state.error).toBeNull();
        expect(state.loading).toBe(false);
      });

      it('should include login credentials in API call', async () => {
        const credentials = {
          emailId: 'test@example.com',
          password: 'TestPass123!'
        };

        const mockUser = {
          _id: '789',
          firstName: 'Test',
          emailId: 'test@example.com',
          role: 'user'
        };

        axiosClient.default.post.mockResolvedValueOnce({
          data: { user: mockUser }
        });

        await store.dispatch(loginUser(credentials));

        expect(axiosClient.default.post).toHaveBeenCalledWith(
          '/user/login',
          credentials
        );
      });
    });

    describe('Input Verification - Invalid Credentials', () => {
      it('should handle login with invalid credentials', async () => {
        const credentials = {
          emailId: 'john@example.com',
          password: 'WrongPassword123!'
        };

        const error = new Error('Invalid credentials');
        axiosClient.default.post.mockRejectedValueOnce(error);

        await store.dispatch(loginUser(credentials));

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.error).toBeDefined();
      });

      it('should handle non-existent user login', async () => {
        const credentials = {
          emailId: 'nonexistent@example.com',
          password: 'SecurePass123!'
        };

        const error = new Error('User not found');
        axiosClient.default.post.mockRejectedValueOnce(error);

        await store.dispatch(loginUser(credentials));

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
      });
    });

    describe('Exception Handling - Login Errors', () => {
      it('should handle network error during login', async () => {
        const credentials = {
          emailId: 'john@example.com',
          password: 'SecurePass123!'
        };

        axiosClient.default.post.mockRejectedValueOnce(
          new Error('Network timeout')
        );

        await store.dispatch(loginUser(credentials));

        const state = store.getState().auth;
        expect(state.error).toBeDefined();
        expect(state.isAuthenticated).toBe(false);
      });
    });
  });

  describe('checkAuth Thunk - Session Verification', () => {
    describe('Happy Path - Active Session', () => {
      it('should verify active user session', async () => {
        const mockUser = {
          _id: '123',
          firstName: 'John',
          emailId: 'john@example.com',
          role: 'user'
        };

        axiosClient.default.get.mockResolvedValueOnce({
          data: { user: mockUser }
        });

        await store.dispatch(checkAuth());

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockUser);
        expect(state.error).toBeNull();
        expect(state.loading).toBe(false);
      });

      it('should make correct API call to check auth', async () => {
        const mockUser = {
          _id: '456',
          firstName: 'Jane',
          emailId: 'jane@example.com'
        };

        axiosClient.default.get.mockResolvedValueOnce({
          data: { user: mockUser }
        });

        await store.dispatch(checkAuth());

        expect(axiosClient.default.get).toHaveBeenCalledWith('/user/check');
      });
    });

    describe('Exception Handling - No Active Session', () => {
      it('should handle 401 error as no session (not authenticated)', async () => {
        const error = {
          response: { status: 401 }
        };

        axiosClient.default.get.mockRejectedValueOnce(error);

        await store.dispatch(checkAuth());

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
      });

      it('should handle other errors as actual errors', async () => {
        const error = new Error('Server error');
        error.response = { status: 500 };

        axiosClient.default.get.mockRejectedValueOnce(error);

        await store.dispatch(checkAuth());

        const state = store.getState().auth;
        expect(state.error).toBeDefined();
      });

      it('should handle network error during auth check', async () => {
        axiosClient.default.get.mockRejectedValueOnce(
          new Error('Network error')
        );

        await store.dispatch(checkAuth());

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
        expect(state.error).toBeDefined();
      });
    });
  });

  describe('logoutUser Thunk - User Logout', () => {
    describe('Happy Path - Successful Logout', () => {
      it('should clear user state on logout', async () => {
        // First login a user
        const mockUser = {
          _id: '123',
          firstName: 'John',
          emailId: 'john@example.com'
        };

        axiosClient.default.post.mockResolvedValueOnce({
          data: { user: mockUser }
        });

        await store.dispatch(loginUser({
          emailId: 'john@example.com',
          password: 'SecurePass123!'
        }));

        // Verify user is logged in
        expect(store.getState().auth.isAuthenticated).toBe(true);

        // Now logout
        axiosClient.default.post.mockResolvedValueOnce({});

        await store.dispatch(logoutUser());

        const state = store.getState().auth;
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.error).toBeNull();
        expect(state.loading).toBe(false);
      });

      it('should make logout API call', async () => {
        axiosClient.default.post.mockResolvedValueOnce({});

        await store.dispatch(logoutUser());

        expect(axiosClient.default.post).toHaveBeenCalledWith('/user/logout');
      });
    });

    describe('Exception Handling - Logout Errors', () => {
      it('should handle logout API error', async () => {
        // First login
        const mockUser = {
          _id: '123',
          firstName: 'John',
          emailId: 'john@example.com'
        };

        axiosClient.default.post.mockResolvedValueOnce({
          data: { user: mockUser }
        });

        await store.dispatch(loginUser({
          emailId: 'john@example.com',
          password: 'SecurePass123!'
        }));

        // Logout with error
        axiosClient.default.post.mockRejectedValueOnce(
          new Error('Logout failed')
        );

        await store.dispatch(logoutUser());

        const state = store.getState().auth;
        expect(state.error).toBeDefined();
        expect(state.isAuthenticated).toBe(false);
      });

      it('should handle network error during logout', async () => {
        axiosClient.default.post.mockRejectedValueOnce(
          new Error('Network error')
        );

        await store.dispatch(logoutUser());

        const state = store.getState().auth;
        expect(state.error).toBeDefined();
      });
    });
  });

  describe('State Transitions', () => {
    it('should transition from pending to fulfilled state', async () => {
      const mockUser = {
        _id: '123',
        firstName: 'John',
        emailId: 'john@example.com'
      };

      axiosClient.default.post.mockResolvedValueOnce({
        data: { user: mockUser }
      });

      const action = store.dispatch(loginUser({
        emailId: 'john@example.com',
        password: 'SecurePass123!'
      }));

      // Check loading is true during dispatch
      expect(store.getState().auth.loading).toBe(true);

      await action;

      // Check loading is false after completion
      expect(store.getState().auth.loading).toBe(false);
      expect(store.getState().auth.isAuthenticated).toBe(true);
    });

    it('should clear error on new action', async () => {
      // Create initial error state
      axiosClient.default.post.mockRejectedValueOnce(
        new Error('Initial error')
      );

      await store.dispatch(registerUser({
        firstName: 'Test',
        emailId: 'test@example.com',
        password: 'TestPass123!'
      }));

      expect(store.getState().auth.error).toBeDefined();

      // Dispatch new action
      const mockUser = {
        _id: '456',
        firstName: 'Jane',
        emailId: 'jane@example.com'
      };

      axiosClient.default.post.mockResolvedValueOnce({
        data: { user: mockUser }
      });

      await store.dispatch(loginUser({
        emailId: 'jane@example.com',
        password: 'SecurePass123!'
      }));

      // Error should be cleared
      expect(store.getState().auth.error).toBeNull();
      expect(store.getState().auth.isAuthenticated).toBe(true);
    });
  });

  describe('Branching - Conditional State Updates', () => {
    it('should set isAuthenticated based on payload presence', async () => {
      // With user payload
      axiosClient.default.post.mockResolvedValueOnce({
        data: { user: { _id: '123', firstName: 'John' } }
      });

      await store.dispatch(loginUser({
        emailId: 'john@example.com',
        password: 'pass'
      }));

      expect(store.getState().auth.isAuthenticated).toBe(true);

      // Without user payload
      axiosClient.default.post.mockResolvedValueOnce({
        data: { user: null }
      });

      await store.dispatch(registerUser({
        firstName: 'Jane',
        emailId: 'jane@example.com',
        password: 'pass'
      }));

      expect(store.getState().auth.isAuthenticated).toBe(false);
    });

    it('should handle null error message gracefully', async () => {
      axiosClient.default.post.mockRejectedValueOnce({});

      await store.dispatch(loginUser({
        emailId: 'john@example.com',
        password: 'pass'
      }));

      const state = store.getState().auth;
      expect(state.error).toBeDefined();
    });
  });
});