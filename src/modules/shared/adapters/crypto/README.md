# Crypto Adapters

This directory contains separate implementations for password hashing and JWT token management following clean architecture principles.

## Clean Architecture Approach

**Separated responsibilities** - Each adapter handles one specific concern:
- **PasswordHasher**: Password hashing and verification
- **TokenManager**: JWT token generation and verification

## Files

- `bcrypt-password-hasher.ts` - bcrypt implementation for password hashing
- `jwt-token-manager.ts` - JWT implementation for token management
- `crypto-config.ts` - Configuration management for both services
- `crypto-factory.ts` - Factory functions for easy instantiation
- `index.ts` - Exports

## Setup

### Environment Variables

Add these to your `.env` file:

```env
JWT_SECRET=your_super_secret_jwt_key_here
JWT_DEFAULT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=12
```

### Installation

Required packages are already installed:

```bash
# Already installed
npm install jsonwebtoken bcrypt
npm install -D @types/jsonwebtoken @types/bcrypt
```

## Usage

### Simple Usage with Factories

```typescript
import { createPasswordHasher, createTokenManager } from "@/src/modules/shared/adapters/crypto";
import type { PasswordHasher } from "@/src/modules/shared/ports/outbound/password-hasher";
import type { TokenManager } from "@/src/modules/shared/ports/outbound/token-manager";

const passwordHasher: PasswordHasher = createPasswordHasher();
const tokenManager: TokenManager = createTokenManager();

// Password operations
const hashedPassword = await passwordHasher.hash("myPassword123");
const isValid = await passwordHasher.compare("myPassword123", hashedPassword);

// JWT operations
const token = await tokenManager.generateToken({
  userId: "user-123",
  email: "user@example.com"
}, "24h");

const payload = await tokenManager.verifyToken(token);
console.log(payload.userId); // "user-123"
```

### Manual Configuration

```typescript
import { BcryptPasswordHasher, JwtTokenManager, createBcryptConfig, createJwtConfig } from "@/src/modules/shared/adapters/crypto";

const bcryptConfig = createBcryptConfig();
const jwtConfig = createJwtConfig();

const passwordHasher = new BcryptPasswordHasher(bcryptConfig);
const tokenManager = new JwtTokenManager(jwtConfig);
```

## Integration with Use Cases

### Register User Use Case

```typescript
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher, // Only what you need
    private readonly emailService: EmailService,
    private readonly templateService: UserTemplateService,
  ) {}

  async execute(params: RegisterUserParams) {
    // Hash password using dedicated service
    const hashedPassword = await this.passwordHasher.hash(params.password);
    
    const user = User.Entity.create({
      ...params,
      password: hashedPassword,
    });
    
    // ... rest of the logic
  }
}
```

### Authenticate User Service

```typescript
export class AuthenticateUser {
  constructor(
    private readonly tokenManager: TokenManager, // Only what you need
    private readonly sessionRepo: SessionRepository,
  ) {}

  async execute(params: AuthenticateUserParams) {
    // Generate tokens using dedicated service
    const accessToken = await this.tokenManager.generateToken({
      sub: user.id,
      email: user.email,
      type: "access"
    }, "15m");

    const refreshToken = await this.tokenManager.generateToken({
      sub: user.id,
      type: "refresh"
    }, "7d");

    // ... rest of the logic
  }
}
```

## Benefits of Separation

### ✅ **Single Responsibility**
- PasswordHasher only handles password operations
- TokenManager only handles JWT operations

### ✅ **Independent Testing**
```typescript
// Test password hashing independently
const mockPasswordHasher: PasswordHasher = {
  hash: jest.fn().mockResolvedValue("hashedPassword"),
  compare: jest.fn().mockResolvedValue(true)
};

// Test token management independently
const mockTokenManager: TokenManager = {
  generateToken: jest.fn().mockResolvedValue("mock.jwt.token"),
  verifyToken: jest.fn().mockResolvedValue({ userId: "test-user" })
};
```

### ✅ **Flexible Dependencies**
```typescript
// Inject only what you need
constructor(
  private passwordHasher: PasswordHasher,  // For password operations
  private tokenManager: TokenManager,      // For token operations
) {}
```

### ✅ **Easy Replacement**
- Switch from bcrypt to Argon2 for passwords
- Switch from JWT to PASETO for tokens
- Replace implementations independently

## Features

### 🔐 **PasswordHasher (bcrypt)**
- **Secure hashing** with configurable salt rounds
- **Password verification** with timing attack protection
- **Industry standard** bcrypt implementation

### 🎫 **TokenManager (JWT)**
- **Token generation** with configurable expiration
- **Token verification** with proper error handling
- **Flexible payload** support

### ⚙️ **Configuration**
- **Environment-based** configuration
- **Secure defaults** for production
- **Validation** of required settings

## What's NOT in these adapters

❌ **Business Logic**
- Password validation rules (handled by value objects)
- Token payload structure decisions (handled by domain)
- Authentication flow logic (handled by use cases)

❌ **Domain Concerns**
- User authentication logic
- Session management
- Authorization rules

## Key Principles

1. **Single Responsibility** - Each adapter has one job
2. **Dependency Injection** - Inject only what you need
3. **Testability** - Easy to mock and test independently
4. **Replaceability** - Easy to switch implementations
5. **No Business Logic** - Pure infrastructure concerns 