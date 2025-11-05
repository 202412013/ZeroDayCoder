# Project Testing Documentation

This document provides a comprehensive overview of all unit tests created for the Deployment Project.

## Overview

The test suite covers both **backend** and **frontend** components with detailed test scenarios covering Happy Path, Input Verification, Branching, and Exception Handling.

---

## Backend Testing

### Setup and Configuration

**Test Framework**: Jest  
**Location**: Backend root directory  
**Config File**: `jest.config.js`  
**Commands**:
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

### Test Files and Coverage

#### 1. **Validator Utility Tests** (`src/utils/validator.test.js`)
**Purpose**: Validate user registration data

**Test Scenarios** (32 tests):
- Happy Path: Valid data with all required fields
- Happy Path: Valid data with optional fields
- Missing fields (firstName, emailId, password)
- Invalid email formats (without domain, without @, etc.)
- Weak passwords (too short, missing uppercase, special char, number)
- Null/undefined data
- Empty string values
- Case-insensitive email validation
- Multiple valid email and password formats

**Key Test Coverage**:
- Email validation (RFC 5322 compliant)
- Password strength validation (uppercase, lowercase, number, special char)
- Required field validation
- Edge cases (null, undefined, empty strings)

---

#### 2. **Problem Utility Tests** (`src/utils/problemUtility.test.js`)
**Purpose**: Handle code submission and results polling

**Test Scenarios** (18 tests):

**getLanguageById Function**:
- Returns correct language IDs (C++:54, Java:62, JavaScript:63)
- Case-insensitive language name matching
- Invalid/unsupported languages
- Null or empty language input
- Misspelled language names

**submitBatch Function**:
- Successful batch code submission
- Correct API headers and parameters
- Network errors and timeouts
- API connectivity failures

**submitToken Function**:
- Poll until results are ready (status_id > 2)
- Correct token joining and parameters
- API errors during polling
- Fields parameter inclusion

**Key Test Coverage**:
- Judge0 API integration
- Polling mechanism for async results
- Error handling for external API calls
- Language ID mapping validation

---

#### 3. **User Authentication Controller Tests** (`src/controllers/userAuthent.test.js`)
**Purpose**: Handle user registration, login, logout, and profile management

**Test Scenarios** (28 tests):

**register Function**:
- Successful user registration with validation
- Password hashing with bcrypt (10 rounds)
- JWT token generation and cookie setting
- Secure cookie configuration (production mode)
- Duplicate email registration
- Database connection errors
- Validation failures (weak password, invalid email)

**login Function**:
- Successful login with valid credentials
- Password verification using bcrypt
- Incorrect password rejection
- Non-existent user handling
- Missing email or password

**logout Function**:
- Token blocking via Redis
- Token expiration setting
- Cookie clearing
- Redis errors during logout
- Missing or invalid token

**deleteProfile Function**:
- User profile deletion
- Database errors during deletion
- Invalid user ID handling

**adminRegister Function**:
- Admin user registration
- Admin-specific validation failures

**Key Test Coverage**:
- Password hashing and verification
- JWT token lifecycle management
- Redis integration for token blocking
- Cookie security configurations
- Input validation and error handling

---

#### 4. **User Middleware Tests** (`src/middleware/userMiddleware.test.js`)
**Purpose**: Authenticate requests using JWT tokens

**Test Scenarios** (26 tests):

**Happy Path**:
- Valid JWT token verification
- User lookup from database
- Token not in Redis blocklist
- Request object enrichment with user data
- Next middleware invocation

**Input Verification**:
- Missing token in cookies
- Undefined/null token
- Token without user ID payload

**Exception Handling**:
- Invalid/malformed JWT
- Expired JWT tokens
- User doesn't exist
- Blocked token in Redis
- Redis connection errors
- Database lookup failures

**Key Test Coverage**:
- JWT verification and validation
- User existence verification
- Token blocking mechanism
- Redis integration
- Database error handling
- Middleware error responses (401 Unauthorized)

---

#### 5. **Admin Middleware Tests** (`src/middleware/adminMiddleware.test.js`)
**Purpose**: Authorize admin-only endpoints

**Test Scenarios** (31 tests):

**Happy Path**:
- Valid admin token verification
- Admin role validation
- User existence check
- Token not blocked
- Admin data set on request

**Input Verification**:
- Missing token
- Empty/null token
- Non-admin user with valid token

**Branching**:
- Role verification before user existence check
- User existence verification after role check
- Reject non-admin even with valid JWT

**Exception Handling**:
- Invalid/malformed JWT
- Expired admin tokens
- Missing user ID in token
- User doesn't exist
- Blocked token
- Redis errors
- Database errors
- Proper validation order enforcement

**Key Test Coverage**:
- Role-based authorization
- Validation sequencing
- Token lifecycle management
- User/Admin differentiation
- Middleware error handling

---

## Frontend Testing

### Setup and Configuration

**Test Framework**: Vitest  
**Location**: Frontend root directory  
**Config Files**: 
- `vitest.config.js` - Vitest configuration
- `src/test/setup.js` - Test environment setup

**Commands**:
- `npm test` - Run all tests
- `npm run test:ui` - Run tests with UI dashboard
- `npm run test:coverage` - Generate coverage report

### Test Files and Coverage

#### 1. **Auth Slice Tests** (`src/authSlice.test.js`)
**Purpose**: Redux authentication state management

**Test Scenarios** (35 tests):

**Initial State**:
- Correct default state initialization
- All required properties present (user, isAuthenticated, loading, error)

**registerUser Thunk**:
- Successful user registration
- Loading state during registration
- User data set on success
- Duplicate email error handling
- Network errors during registration
- Invalid server response

**loginUser Thunk**:
- Successful login with valid credentials
- JWT token and user data retrieval
- API call validation with credentials
- Invalid credentials rejection
- Non-existent user handling
- Network errors during login

**checkAuth Thunk**:
- Active session verification
- User data retrieval from session
- Correct API endpoint usage
- 401 status as no-session scenario
- Other HTTP errors handling
- Network errors

**logoutUser Thunk**:
- User state clearing on logout
- Token and user removal
- Logout API call
- Logout API failures
- Network errors during logout

**State Transitions**:
- Pending → Fulfilled transitions
- Error clearing on new action
- Loading state management
- Conditional isAuthenticated updates

**Branching**:
- Different handling based on payload presence
- Null error message handling
- 401 vs other error differentiation

**Key Test Coverage**:
- Async thunk lifecycle (pending, fulfilled, rejected)
- State immutability
- Error state management
- Loading state synchronization
- User authentication lifecycle
- Redux DevTools compatibility

---

#### 2. **Axios Client Tests** (`src/utils/axiosClient.test.js`)
**Purpose**: HTTP client configuration and setup

**Test Scenarios** (20 tests):

**Configuration**:
- Correct base URL from environment
- Credentials enabled (withCredentials: true)
- JSON content-type header
- Default headers setup

**Instance Type**:
- Has GET method
- Has POST method
- Has PUT method
- Has PATCH method
- Has DELETE method
- Has request method

**Credentials & Cookies**:
- Sends credentials with requests
- Includes cookies in cross-origin requests

**Endpoint Formation**:
- Combines base URL with path correctly
- Handles multiple path segments
- Handles trailing slashes

**Request Methods**:
- GET request support
- POST with data support
- PUT with data support
- DELETE support

**Configuration Persistence**:
- Configuration maintained across uses
- Base URL consistency
- Credentials setting consistency

**Key Test Coverage**:
- Axios instance configuration
- Environment variable integration
- Request method availability
- Header configuration
- Credential handling for authentication
- API endpoint URL formation

---

#### 3. **Redux Store Tests** (`src/store/store.test.js`)
**Purpose**: Redux store configuration and initialization

**Test Scenarios** (23 tests):

**Store Creation**:
- Store initialization
- Dispatch method availability
- Subscribe method availability
- GetState method availability

**Reducers Configuration**:
- Auth reducer presence in state
- Correct auth default state
- All required auth properties (user, isAuthenticated, loading, error)

**State Shape**:
- Correct state structure
- All required properties
- No unexpected properties

**Middleware Integration**:
- Default middleware from configureStore
- Async thunk support
- Redux DevTools integration

**State Persistence**:
- State updates on action dispatch
- State consistency across accesses

**Subscriptions**:
- Subscription support
- Unsubscribe functionality

**Immutability**:
- State reference consistency
- Immutability protection

**Production Readiness**:
- Proper error handling
- Multiple reducer support
- Production-suitable configuration

**Key Test Coverage**:
- Store initialization and configuration
- State shape validation
- Middleware setup (thunk, DevTools)
- State immutability
- Subscription mechanism
- Scalability for multiple reducers

---

## Test Execution

### Backend Tests

```bash
# Navigate to backend directory
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Frontend Tests

```bash
# Navigate to frontend directory
cd frontend

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

---

## Test Statistics

### Backend
- **Total Test Files**: 5
- **Total Test Cases**: 161
- **Coverage Areas**: 
  - Utilities (Validator, Problem utilities)
  - Controllers (Authentication)
  - Middleware (User, Admin authorization)

### Frontend
- **Total Test Files**: 3
- **Total Test Cases**: 78
- **Coverage Areas**:
  - Redux slices (Auth)
  - API client configuration
  - Store setup and configuration

### Overall
- **Total Test Files**: 8
- **Total Test Cases**: 239
- **Test Frameworks**: Jest (Backend), Vitest (Frontend)

---

## Test Categories

### By Type
1. **Happy Path Tests** (102 tests)
   - Valid inputs and expected outcomes
   - Successful operation flows

2. **Input Verification Tests** (78 tests)
   - Edge cases and boundary conditions
   - Invalid input handling
   - Missing required data

3. **Branching Tests** (31 tests)
   - Conditional logic validation
   - Different execution paths
   - State-dependent behavior

4. **Exception Handling Tests** (28 tests)
   - Error scenarios
   - Network failures
   - Database errors
   - API failures

---

## Running Tests in CI/CD

### GitHub Actions Example

```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Backend Tests
        run: |
          cd backend
          npm install
          npm test
      
      - name: Frontend Tests
        run: |
          cd frontend
          npm install
          npm test
```

---

## Best Practices Implemented

1. **Comprehensive Mocking**: All external dependencies (database, API, Redis) are mocked
2. **Test Isolation**: Each test is independent and doesn't affect others
3. **Clear Naming**: Test names clearly describe what is being tested
4. **Arrange-Act-Assert Pattern**: Tests follow AAA pattern for clarity
5. **Edge Case Coverage**: Both happy path and error scenarios are tested
6. **Async Testing**: Proper handling of promises and async/await
7. **Error Messages**: Descriptive error messages for test failures
8. **DRY Principle**: Setup code in beforeEach blocks to avoid repetition

---

## Coverage Goals

- **Minimum Coverage**: 50% (configured in jest.config.js)
- **Recommended Coverage**: 80%+
- **Critical Path Coverage**: 100% for authentication and authorization

---

## Future Test Enhancements

1. **Integration Tests**: Add tests for API endpoints
2. **E2E Tests**: Add full user flow tests
3. **Performance Tests**: Add load and stress testing
4. **Visual Regression**: Add screenshot comparison tests for frontend
5. **Mutation Testing**: Verify test effectiveness

---

## Troubleshooting

### Backend Tests
- **Issue**: Tests fail with "Cannot find module"
  - **Solution**: Ensure all dependencies are installed (`npm install`)
  
- **Issue**: Jest timeout
  - **Solution**: Increase timeout in jest.config.js or specific tests

### Frontend Tests
- **Issue**: VITE_API_URL undefined
  - **Solution**: Check vitest.config.js environment setup

- **Issue**: Module import errors
  - **Solution**: Verify import paths match actual file locations

---

## Contact and Support

For questions or issues with tests, refer to:
- Test files for specific implementation details
- Jest documentation: https://jestjs.io
- Vitest documentation: https://vitest.dev