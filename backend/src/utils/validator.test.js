beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => { });
});

afterAll(() => {
  console.log.mockRestore();
});

const validate = require('./validator');

describe('Validator - User Data Validation', () => {
  describe('Happy Path - Valid Data', () => {
    it('should validate user data with all required fields and valid values', () => {
      const validData = {
        firstName: 'Yash',
        emailId: 'yash@gmail.com',
        password: 'Yash@123'
      };

      expect(() => validate(validData)).not.toThrow();
    });

    // it('should validate data with additional optional fields', () => {
    //   const validData = {
    //     firstName: 'Jane',
    //     emailId: 'jane@example.com',
    //     password: 'Yash@123',
    //     lastName: 'Doe',
    //     age: 25
    //   };

    //   expect(() => validate(validData)).not.toThrow();
    // });
  });

  describe('Input Verification - Missing Fields', () => {
    it('should throw error when firstName is missing', () => {
      const invalidData = {
        emailId: 'yash@gmail.com',
        password: 'Yash@123'
      };

      expect(() => validate(invalidData)).toThrow('Some Field Missing');
    });

    it('should throw error when emailId is missing', () => {
      const invalidData = {
        firstName: 'Yash',
        password: 'Yash@123'
      };

      expect(() => validate(invalidData)).toThrow('Some Field Missing');
    });

    it('should throw error when password is missing', () => {
      const invalidData = {
        firstName: 'Yash',
        emailId: 'yash@gmail.com'
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
        firstName: 'Yash',
        emailId: 'invalid-email',
        password: 'Yash@123'
      };

      expect(() => validate(invalidData)).toThrow('Invalid Email');
    });

    it('should throw error for email without domain', () => {
      const invalidData = {
        firstName: 'Yash',
        emailId: 'Yash@',
        password: 'Yash@123'
      };

      expect(() => validate(invalidData)).toThrow('Invalid Email');
    });

    it('should throw error for email without @', () => {
      const invalidData = {
        firstName: 'Yash',
        emailId: 'Yashexample.com',
        password: 'Yash@123'
      };

      expect(() => validate(invalidData)).toThrow('Invalid Email');
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'Yash.doe@company.co.uk',
        'test+tag@domain.com'
      ];

      validEmails.forEach(email => {
        const data = {
          firstName: 'Yash',
          emailId: email,
          password: 'Yash@123'
        };
        expect(() => validate(data)).not.toThrow();
      });
    });
  });

  describe('Input Verification - Password Strength', () => {
    it('should throw error for weak password (too short)', () => {
      const invalidData = {
        firstName: 'Yash',
        emailId: 'yash@gmail.com',
        password: 'weak'
      };

      expect(() => validate(invalidData)).toThrow('Week Password');
    });

    it('should throw error for password without uppercase letter', () => {
      const invalidData = {
        firstName: 'Yash',
        emailId: 'yash@gmail.com',
        password: 'weakpass123!'
      };

      expect(() => validate(invalidData)).toThrow('Week Password');
    });

    it('should throw error for password without special character', () => {
      const invalidData = {
        firstName: 'Yash',
        emailId: 'yash@gmail.com',
        password: 'Weakpass123'
      };

      expect(() => validate(invalidData)).toThrow('Week Password');
    });

    it('should throw error for password without number', () => {
      const invalidData = {
        firstName: 'Yash',
        emailId: 'yash@gmail.com',
        password: 'WeakPass!'
      };

      expect(() => validate(invalidData)).toThrow('Week Password');
    });

    it('should accept strong passwords', () => {
      const strongPasswords = [
        'Yash@123',
        'MySecure@Pass2024',
        'Test@Secure#1'
      ];

      strongPasswords.forEach(password => {
        const data = {
          firstName: 'Yash',
          emailId: 'yash@gmail.com',
          password: password
        };
        expect(() => validate(data)).not.toThrow();
      });
    });
  });

  describe('Exception Handling - Edge Cases', () => {
    it('should handle data with empty string values', () => {
      const invalidData = {
        firstName: 'Yash',
        emailId: '', // Empty email
        password: 'Yash@1'
      };

      // Check that it throws any error, not necessarily a specific one
      expect(() => validate(invalidData)).toThrow();
    });
  });
});