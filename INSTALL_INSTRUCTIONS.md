# 📦 Installation Instructions

## Quick Install

```bash
# 1. Install all dependencies (including Joi)
bun install

# 2. Run the application
bun run start:dev
```

## What Gets Installed

The `bun install` command will install:

### NestJS Core
- @nestjs/common, @nestjs/core
- @nestjs/platform-express
- @nestjs/config, @nestjs/typeorm
- @nestjs/jwt, @nestjs/passport
- @nestjs/throttler, @nestjs/swagger

### Database & ORM
- typeorm, pg (PostgreSQL driver)

### Validation & Security
- class-validator, class-transformer
- joi (for environment validation)
- helmet, bcryptjs

### Other Dependencies
- passport, passport-jwt
- axios, redis
- multer, form-data

## If Joi Installation Fails

If you see errors about Joi, install it manually:

```bash
bun add joi @types/joi
```

## Verify Installation

After installation, check:

```bash
# Check if dependencies are installed
bun pm ls

# Try to build
bun run build

# Start dev server
bun run start:dev
```

## Common Issues

### Issue: "Cannot find module 'joi'"
**Solution**: `bun add joi @types/joi`

### Issue: "Cannot find module '@nestjs/...'"
**Solution**: `bun install` (should install all NestJS packages)

### Issue: TypeScript errors
**Solution**: 
1. Make sure all dependencies are installed: `bun install`
2. Check tsconfig.json is correct
3. Try: `bun run build`

---

**After installation, all TypeScript errors should be resolved!** ✅

