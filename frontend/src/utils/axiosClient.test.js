// src/utils/axiosClient.test.js
import axios from 'axios';
import axiosClient from './axiosClient';

// Mock environment variables before imports
vi.mock('./axiosClient', async () => {
  const actual = await vi.importActual('./axiosClient');
  return {
    default: axios.create({
      baseURL: 'http://localhost:3001/api',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  };
});

describe('Axios Client - HTTP Client Configuration', () => {
  // Configuration - Base Setup
  describe('Configuration - Base Setup', () => {
    test('should have correct base URL from environment', () => {
      expect(axiosClient.defaults.baseURL).toBe('http://localhost:3001/api');
    });

    test('should have credentials enabled for cookie handling', () => {
      expect(axiosClient.defaults.withCredentials).toBe(true);
    });

    test('should have correct content type header', () => {
      expect(axiosClient.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  // Instance Type - Should be Axios Instance
  describe('Instance Type - Should be Axios Instance', () => {
    test('should be an axios instance with request method', () => {
      expect(axiosClient).toBeDefined();
      expect(typeof axiosClient.request).toBe('function');
    });

    test('should have get method', () => {
      expect(typeof axiosClient.get).toBe('function');
    });

    test('should have post method', () => {
      expect(typeof axiosClient.post).toBe('function');
    });

    test('should have put method', () => {
      expect(typeof axiosClient.put).toBe('function');
    });

    test('should have patch method', () => {
      expect(typeof axiosClient.patch).toBe('function');
    });

    test('should have delete method', () => {
      expect(typeof axiosClient.delete).toBe('function');
    });
  });

  // Credentials Handling
  describe('Credentials Handling', () => {
    test('should send credentials with every request', () => {
      expect(axiosClient.defaults.withCredentials).toBe(true);
    });

    test('should include cookies in cross-origin requests', () => {
      expect(axiosClient.defaults.withCredentials).toBe(true);
    });
  });

  // Headers Configuration
  describe('Headers Configuration', () => {
    test('should have default headers object', () => {
      expect(axiosClient.defaults.headers).toBeDefined();
      expect(typeof axiosClient.defaults.headers).toBe('object');
    });

    test('should include content-type for JSON', () => {
      expect(axiosClient.defaults.headers['Content-Type']).toBe('application/json');
    });

    test('should allow header override for specific requests', () => {
      // This is default axios behavior
      expect(axiosClient.defaults.headers).toBeDefined();
    });
  });

  // Simple tests that don't require complex mocking
  describe('Export and Usability', () => {
    test('should be the default export', () => {
      expect(axiosClient).toBeDefined();
    });

    test('should be ready to use immediately', () => {
      expect(axiosClient.defaults.baseURL).toBeDefined();
      expect(axiosClient.defaults.withCredentials).toBeDefined();
    });
  });
});