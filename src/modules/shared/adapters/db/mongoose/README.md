# Mongoose Model Management

This directory contains utilities and best practices for managing mongoose models and preventing duplicate schema issues.

## Files

- `models.ts` - Centralized model registration and exports
- `model-validator.ts` - Utility for validating model registration
- `README.md` - This file with best practices

## Best Practices

### 1. Model Registration

Always register models through the centralized `models.ts` file:

```typescript
// ✅ Good - Use centralized registration
import { UserModel } from "@/src/modules/shared/adapters/db/mongoose/models";

// ❌ Bad - Direct import from model file
import { UserModel } from "@/src/modules/user/adapters/db/mongoose/user-model";
```

### 2. Model Naming

- Use PascalCase for model names (e.g., `User`, `ProductCategory`)
- Ensure unique names across the entire application
- Avoid generic names that might conflict

### 3. Schema Definition

- Define schemas with proper validation
- Use unique indexes where appropriate
- Include proper error messages for validation

### 4. Preventing Duplicate Schema Issues

The system automatically validates model registration and detects:
- Missing models
- Extra/unexpected models
- Duplicate model names
- Improper model registration

### 5. Development Workflow

1. Create your model file in the appropriate module
2. Add the model export to `models.ts`
3. Add the model name to `EXPECTED_MODELS` array
4. Run the application to validate registration

### 6. Troubleshooting

If you encounter duplicate schema issues:

1. Check the console output for validation warnings
2. Ensure model names are unique
3. Verify all models are properly exported from `models.ts`
4. Check for circular dependencies in imports

## Validation Output

The system will log:
- Number of registered models
- List of all registered models
- Any validation warnings
- Any duplicate schema issues

Example output:
```
📊 Registered Models: 10
  - User
  - Session
  - Organization
  - OrganizationInvitation
  - OrganizationMember
  - Product
  - ProductCategory
  - ProductType
  - Price
  - Currency
✅ All mongoose models registered successfully
```

## Common Issues

### Issue: "OverwriteModelError: Cannot overwrite model once compiled"

**Cause**: Model is being registered multiple times
**Solution**: Use centralized model registration and ensure models are only imported once

### Issue: "Missing models" warning

**Cause**: Model not added to `EXPECTED_MODELS` array
**Solution**: Add the model name to the array in `models.ts`

### Issue: "Duplicate model names" warning

**Cause**: Two models with the same name (case-insensitive)
**Solution**: Ensure all model names are unique 