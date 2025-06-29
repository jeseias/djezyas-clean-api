# JWT Crypto Repository Adapter

This directory contains the JWT implementation for the CryptoRepository interface following clean architecture principles.

## Clean Architecture Approach

**Infrastructure concerns only** - This adapter handles:
- Password hashing with bcrypt
- JWT token generation and verification
- Configuration management
- No business logic or domain rules

## Files

- `jwt-crypto-repository.ts` - Main JWT crypto repository implementation
- `jwt-config.ts` - Configuration management
- `jwt-factory.ts` - Factory function for easy instantiation
- `index.ts` - Exports

## Setup

### Environment Variables

Add these to your `.env` file:

```env
JWT_SECRET=your_super_secret_jwt_key_here
JWT_DEFAULT_EXPIRES_IN=1h
```

### Installation

Required packages are already installed:

```bash
# Already installed
npm install jsonwebtoken bcrypt
npm install -D @types/jsonwebtoken @types/bcrypt
```

## Usage

### Simple Usage with Factory

```typescript
import { createJwtCryptoRepository } from "@/src/modules/shared/adapters/jwt";
import type { CryptoRepository } from "@/src/modules/shared/ports/outbound/crypto-repository";

const cryptoRepository: CryptoRepository = createJwtCryptoRepository();

// Hash a password
const hashedPassword = await cryptoRepository.hash("myPassword123");

// Compare password with hash
const isValid = await cryptoRepository.compare("myPassword123", hashedPassword);

// Generate JWT token
const token = await cryptoRepository.generateToken({
  userId: "user-123",
  email: "user@example.com"
}, "24h");

// Verify JWT token
const payload = await cryptoRepository.verifyToken(token);
console.log(payload.userId); // "user-123"
```

### Manual Configuration

```typescript
import { JwtCryptoRepository, createJwtConfig } from "@/src/modules/shared/adapters/jwt";

const config = createJwtConfig();
const cryptoRepository = new JwtCryptoRepository(config);

// Or with custom config
const customConfig = {
  secret: "my-custom-secret",
  defaultExpiresIn: "30m"
};

const customCryptoRepository = new JwtCryptoRepository(customConfig);
```

### Password Hashing

```typescript
// Hash password for storage
const password = "securePassword123!";
const hashedPassword = await cryptoRepository.hash(password);

// Store hashedPassword in database
await userRepository.create({
  ...userData,
  password: hashedPassword
});
```

### Password Verification

```typescript
// Verify password during login
const user = await userRepository.findByEmail(email);
const isValidPassword = await cryptoRepository.compare(
  plainTextPassword, 
  user.password
);

if (isValidPassword) {
  // Generate session token
  const token = await cryptoRepository.generateToken({
    userId: user.id,
    email: user.email
  });
}
```

### JWT Token Management

```typescript
// Generate access token
const accessToken = await cryptoRepository.generateToken({
  userId: user.id,
  type: "access"
}, "15m");

// Generate refresh token
const refreshToken = await cryptoRepository.generateToken({
  userId: user.id,
  type: "refresh"
}, "7d");

// Verify token
try {
  const payload = await cryptoRepository.verifyToken(accessToken);
  // Token is valid, use payload
} catch (error) {
  // Token is invalid or expired
  console.error("Token verification failed:", error.message);
}
```

## Features

### ✅ **Security**
- **bcrypt hashing** with 12 salt rounds
- **JWT tokens** with configurable expiration
- **Secure defaults** for production use

### ✅ **Clean Interface**
- Implements CryptoRepository interface
- Type-safe parameters
- Consistent error handling

### ✅ **Configuration**
- Environment-based configuration
- Default values
- Validation of required settings

### ✅ **Error Handling**
- Specific error messages for different failure types
- Token expiration handling
- Invalid token detection

## What's NOT in this adapter

❌ **Business Logic**
- Password validation rules
- Token payload structure decisions
- Authentication flow logic

❌ **Domain Concerns**
- User authentication logic
- Session management
- Authorization rules

## Integration with Domain

```typescript
// In your use cases or services
import { createJwtCryptoRepository } from "@/src/modules/shared/adapters/jwt";

const cryptoRepository = createJwtCryptoRepository();

// In login use case
export class LoginUseCase {
  async execute(params: LoginParams) {
    const user = await this.userRepository.findByEmail(params.email);
    
    // Verify password using infrastructure service
    const isValidPassword = await cryptoRepository.compare(
      params.password, 
      user.password
    );
    
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }
    
    // Generate tokens using infrastructure service
    const accessToken = await cryptoRepository.generateToken({
      userId: user.id,
      email: user.email
    }, "15m");
    
    return { user, accessToken };
  }
}
```

## Testing

```typescript
// Mock the CryptoRepository interface for testing
const mockCryptoRepository: CryptoRepository = {
  hash: jest.fn().mockResolvedValue("hashedPassword"),
  compare: jest.fn().mockResolvedValue(true),
  generateToken: jest.fn().mockResolvedValue("mock.jwt.token"),
  verifyToken: jest.fn().mockResolvedValue({ userId: "test-user" })
};
```

## Security Best Practices

1. **Strong JWT Secret**: Use a long, random secret key
2. **Environment Variables**: Never hardcode secrets
3. **Token Expiration**: Set appropriate expiration times
4. **HTTPS Only**: Always use HTTPS in production
5. **Regular Rotation**: Rotate JWT secrets periodically

## Key Principles

1. **Infrastructure is replaceable** - Easy to switch to other crypto libraries
2. **Configuration externalized** - No hardcoded secrets
3. **Error handling consistent** - Always returns expected interface
4. **No business logic** - Pure infrastructure concerns 