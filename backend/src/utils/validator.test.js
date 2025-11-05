const validate = require('./validator');

describe('Validator - User Data Validation', () => {
  describe('Happy Path - Valid Data', () => {
    it('should validate user data with all required fields and valid values', () => {
      const validData = {
        firstName: 'John',
        emailId: 'john@example.com',
        password: 'SecurePass123!'
      };

      expect(() => validate(validData)).not.toThrow();
    });

    it('should validate data with additional optional fields', () => {
      const validData = {
        firstName: 'Jane',
        emailId: 'jane@example.com',
        password: 'SecurePass123!',
        lastName: 'Doe',
        age: 25
      };

      expect(() => validate(validData)).not.toThrow();
    });
  });

  describe('Input Verification - Missing Fields', () => {
    it('should throw error when firstName is missing', () => {
      const invalidData = {
        emailId: 'john@example.com',
        password: 'SecurePass123!'
      };

      expect(() => validate(invalidData)).toThrow('Some Field Missing');
    });

    it('should throw error when emailId is missing', () => {
      const invalidData = {
        firstName: 'John',
        password: 'SecurePass123!'
      };

      expect(() => validate(invalidData)).toThrow('Some Field Missing');
    });

    it('should throw error when password is missing', () => {
      const invalidData = {
        firstName: 'John',
        emailId: 'john@example.com'
      };

      expect(() => validate(invalidData)).toThrow('Some Field Missing');
    });

    it('should throw error when all mandatory fields are missing', () => {
      const invalidData = {};

      expect(() => validate(invalidData)).toThrow('Some Field Missing');
    });
  });

  describe('Input Verification - Email Validation', () => {
    it('should throw error for invalid email format', () => {
      const invalidData = {
        firstName: 'John',
        emailId: 'invalid-email',
        password: 'SecurePass123!'
      };

      expect(() => validate(invalidData)).toThrow('Invalid Email');
    });

    it('should throw error for email without domain', () => {
      const invalidData = {
        firstName: 'John',
        emailId: 'john@',
        password: 'SecurePass123!'
      };

      expect(() => validate(invalidData)).toThrow('Invalid Email');
    });

    it('should throw error for email without @', () => {
      const invalidData = {
        firstName: 'John',
        emailId: 'johnexample.com',
        password: 'SecurePass123!'
      };

      expect(() => validate(invalidData)).toThrow('Invalid Email');
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'john.doe@company.co.uk',
        'test+tag@domain.com'
      ];

      validEmails.forEach(email => {
        const data = {
          firstName: 'John',
          emailId: email,
          password: 'SecurePass123!'
        };
        expect(() => validate(data)).not.toThrow();
      });
    });
  });

  describe('Input Verification - Password Strength', () => {
    it('should throw error for weak password (too short)', () => {
      const invalidData = {
        firstName: 'John',
        emailId: 'john@example.com',
        password: 'weak'
      };

      expect(() => validate(invalidData)).toThrow('Week Password');
    });

    it('should throw error for password without uppercase letter', () => {
      const invalidData = {
        firstName: 'John',
        emailId: 'john@example.com',
        password: 'weakpass123!'
      };

      expect(() => validate(invalidData)).toThrow('Week Password');
    });

    it('should throw error for password without special character', () => {
      const invalidData = {
        firstName: 'John',
        emailId: 'john@example.com',
        password: 'Weakpass123'
      };

      expect(() => validate(invalidData)).toThrow('Week Password');
    });

    it('should throw error for password without number', () => {
      const invalidData = {
        firstName: 'John',
        emailId: 'john@example.com',
        password: 'WeakPass!'
      };

      expect(() => validate(invalidData)).toThrow('Week Password');
    });

    it('should accept strong passwords', () => {
      const strongPasswords = [
        'SecurePass123!',
        'MySecure@Pass2024',
        'Test@Secure#1'
      ];

      strongPasswords.forEach(password => {
        const data = {
          firstName: 'John',
          emailId: 'john@example.com',
          password: password
        };
        expect(() => validate(data)).not.toThrow();
      });
    });
  });

  describe('Exception Handling - Edge Cases', () => {
    it('should throw error for null data object', () => {
      expect(() => validate(null)).toThrow();
    });

    it('should throw error for undefined data', () => {
      expect(() => validate(undefined)).toThrow();
    });

    it('should handle data with empty string values', () => {
      const invalidData = {
        firstName: '',
        emailId: 'john@example.com',
        password: 'SecurePass123!'
      };

      expect(() => validate(invalidData)).toThrow();
    });

    it('should be case insensitive for email validation', () => {
      const data = {
        firstName: 'John',
        emailId: 'JOHN@EXAMPLE.COM',
        password: 'SecurePass123!'
      };

      expect(() => validate(data)).not.toThrow();
    });
  });
});