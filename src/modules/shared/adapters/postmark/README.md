# Postmark Email Service Adapter

This directory contains the Postmark implementation for the EmailService interface following clean architecture principles.

## Clean Architecture Approach

**Infrastructure concerns only** - This adapter handles:
- Email delivery via Postmark API
- Configuration management
- Error handling and status mapping
- No business logic or email content generation

## Files

- `postmark-client.ts` - Main Postmark email service implementation
- `postmark-config.ts` - Configuration management
- `postmark-factory.ts` - Factory function for easy instantiation
- `index.ts` - Exports

## Setup

### Environment Variables

Add these to your `.env` file:

```env
POSTMARK_API_TOKEN=your_postmark_api_token
POSTMARK_FROM_EMAIL=noreply@yourdomain.com
POSTMARK_REPLY_TO_EMAIL=support@yourdomain.com
```

### Installation

Postmark is already installed in your project:

```bash
# Already in package.json
npm install postmark
```

## Usage

### Simple Usage with Factory

```typescript
import { createPostmarkEmailService } from "@/src/modules/shared/adapters/postmark";
import type { EmailService } from "@/src/modules/shared/ports/outbound/email-service";

const emailService: EmailService = createPostmarkEmailService();

// Send email
const result = await emailService.sendEmail({
  to: { email: "user@example.com", name: "John Doe" },
  template: {
    subject: "Welcome!",
    html: "<h1>Welcome to our platform</h1>",
    text: "Welcome to our platform"
  }
});

console.log(result.status); // "sent" | "queued" | "failed"
```

### Manual Configuration

```typescript
import { PostmarkEmailService, createPostmarkConfig } from "@/src/modules/shared/adapters/postmark";

const config = createPostmarkConfig();
const emailService = new PostmarkEmailService(config);

// Or with custom config
const customConfig = {
  apiToken: "your-token",
  defaultFromEmail: "custom@domain.com",
  defaultReplyTo: "support@domain.com"
};

const customEmailService = new PostmarkEmailService(customConfig);
```

### Multiple Recipients

```typescript
await emailService.sendEmail({
  to: [
    { email: "user1@example.com", name: "User One" },
    { email: "user2@example.com", name: "User Two" }
  ],
  template: {
    subject: "Important Update",
    html: "<p>Important information...</p>",
    text: "Important information..."
  },
  options: {
    priority: "high",
    replyTo: "support@domain.com"
  }
});
```

## Features

### ✅ **Infrastructure Only**
- Email delivery via Postmark API
- Configuration management
- Error handling
- Status mapping

### ✅ **Clean Interface**
- Implements EmailService interface
- Type-safe parameters
- Consistent error handling

### ✅ **Configuration**
- Environment-based configuration
- Default values
- Validation of required settings

### ✅ **Error Handling**
- Graceful failure handling
- Consistent status responses
- Error logging

## What's NOT in this adapter

❌ **Business Logic**
- Email template generation
- Content creation
- Business rules

❌ **Domain Concerns**
- Email validation (handled by value objects)
- Template rendering (handled by template services)

## Integration with Domain

```typescript
// In your use cases or services
import { createPostmarkEmailService } from "@/src/modules/shared/adapters/postmark";
import { UserTemplateService } from "@/src/modules/user/core/app/services/template-service";

const emailService = createPostmarkEmailService();
const templateService = new UserTemplateService();

// Generate template using domain service
const template = await templateService.generateEmailVerificationTemplate(user);

// Send using infrastructure service
await emailService.sendEmail({
  to: { email: user.email, name: user.name },
  template
});
```

## Testing

```typescript
// Mock the EmailService interface for testing
const mockEmailService: EmailService = {
  sendEmail: jest.fn().mockResolvedValue({
    messageId: "test-id",
    status: "sent"
  })
};
```

## Key Principles

1. **Infrastructure is replaceable** - Easy to switch to SendGrid, AWS SES, etc.
2. **Configuration externalized** - No hardcoded values
3. **Error handling consistent** - Always returns expected interface
4. **No business logic** - Pure infrastructure concerns 