# NestJS Migration Guide

This document outlines the migration from Express.js to NestJS for the Vanitya backend.

## 📋 Migration Status

### ✅ Completed
- [x] Core NestJS setup (main.ts, app.module.ts)
- [x] Configuration module with environment validation
- [x] Common layer (guards, filters, interceptors, decorators, DTOs)
- [x] Base entities and all database entities
- [x] Auth module (complete with JWT strategy)
- [x] User module (basic structure)

### 🚧 In Progress / TODO
- [ ] Exercise module (controller, service, DTOs)
- [ ] STT module (speech-to-text)
- [ ] Recommender module (RL-based recommendations)
- [ ] Admin module
- [ ] AI service clients (Sarvam, AI4Bharat)
- [ ] TypeORM migrations from Sequelize
- [ ] Testing setup
- [ ] Documentation updates

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Install all dependencies using Bun (much faster!)
bun install

# Or use the provided package-nestjs.json:
cp package-nestjs.json package.json
bun install
```

Bun automatically installs all dependencies from package.json, including dev dependencies.

### 2. Update Environment Variables

Ensure your `.env` file has all required variables (see `src/config/env.validation.ts`).

### 3. Run the Application

```bash
# Development
bun run start:dev

# Or directly with Bun (faster!)
bun src/main.ts

# Production build
bun run build
bun run start:prod
```

## 📁 Project Structure

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module
├── app.controller.ts                # Root controller
├── app.service.ts                   # Root service
│
├── config/                          # Configuration files
│   ├── database.config.ts           # Database configuration
│   └── env.validation.ts            # Environment validation
│
├── common/                           # Shared/common code
│   ├── entities/
│   │   └── base.entity.ts          # Base entity with timestamps
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   ├── dto/
│   │   ├── pagination.dto.ts
│   │   └── response.dto.ts
│   ├── filters/
│   │   └── all-exceptions.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── interceptors/
│       ├── logging.interceptor.ts
│       └── response.interceptor.ts
│
└── modules/                         # Feature modules
    ├── auth/                        # ✅ Complete
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── dto/
    │   └── strategies/
    │       └── jwt.strategy.ts
    ├── user/                        # ✅ Basic structure
    ├── exercise/                    # 🚧 TODO
    ├── stt/                         # 🚧 TODO
    ├── recommender/                 # 🚧 TODO
    ├── admin/                       # 🚧 TODO
    └── ai/                          # 🚧 TODO
```

## 🔄 Migration Patterns

### Express → NestJS Conversions

#### 1. Controllers

**Express:**
```javascript
const register = asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  // ... logic
  res.status(201).json({ message: 'Success', user, token });
});
```

**NestJS:**
```typescript
@Post('register')
@HttpCode(HttpStatus.CREATED)
async register(@Body() registerDto: RegisterDto) {
  return this.authService.register(registerDto);
}
```

#### 2. Middleware → Guards

**Express:**
```javascript
router.use(authenticate);
```

**NestJS:**
```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: any) { }
```

#### 3. Error Handling

**Express:**
```javascript
app.use(errorHandler);
```

**NestJS:**
```typescript
app.useGlobalFilters(new AllExceptionsFilter());
```

#### 4. Validation

**Express:**
```javascript
const { error, value } = schema.validate(req.body);
```

**NestJS:**
```typescript
@Post()
@UsePipes(new ValidationPipe())
async create(@Body() dto: CreateDto) { }
```

#### 5. Services

**Express:**
```javascript
const user = await User.findOne({ where: { email } });
```

**NestJS:**
```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}
  
  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
}
```

## 🔧 Key Differences

### 1. Dependency Injection
- NestJS uses constructor injection
- Services are marked with `@Injectable()`
- Modules define what to inject

### 2. TypeORM vs Sequelize
- TypeORM uses decorators for entities
- Repository pattern instead of models
- Migrations handled differently

### 3. Validation
- Uses `class-validator` decorators
- DTOs define validation rules
- Automatic validation via `ValidationPipe`

### 4. Authentication
- Passport strategies in NestJS
- JWT strategy with proper payload mapping
- Guards for route protection

## 📝 Next Steps

1. **Complete Exercise Module**
   - Migrate exercise controller logic
   - Create exercise DTOs
   - Implement exercise service methods

2. **Migrate AI Services**
   - Convert Sarvam client to NestJS service
   - Convert AI4Bharat client
   - Implement provider fallback logic

3. **TypeORM Migrations**
   - Convert Sequelize migrations to TypeORM
   - Test migrations
   - Update seeders

4. **Testing**
   - Set up Jest configuration
   - Write unit tests
   - Write E2E tests

5. **Documentation**
   - Update API documentation
   - Update README
   - Add Swagger annotations

## ⚠️ Important Notes

1. **JWT Payload Mapping**: The JWT strategy maps `sub` to `id` for controllers. This is critical for authentication to work.

2. **Database**: TypeORM is configured but you may need to adjust entity relationships and migrations.

3. **Configuration**: The config system supports YAML + env variables. You may need to migrate your YAML config loader.

4. **Rate Limiting**: Uses `@nestjs/throttler` instead of `express-rate-limit`.

5. **ML Service**: Keep separate (Python/FastAPI) - no changes needed.

6. **Frontend**: Keep separate (React Native) - no changes needed.

## 🐛 Troubleshooting

### Common Issues

1. **"Cannot find module" errors**
   - Run `bun install`
   - Check `tsconfig.json` paths

2. **Database connection errors**
   - Verify `.env` configuration
   - Check database is running
   - Verify TypeORM configuration

3. **JWT authentication not working**
   - Check JWT_SECRET is set
   - Verify JWT strategy payload mapping
   - Check token format in requests

4. **Validation errors**
   - Ensure DTOs have proper decorators
   - Check ValidationPipe is global
   - Verify request body matches DTO

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [NestJS Best Practices](https://github.com/nestjs/nest/tree/master/sample)

## 🤝 Contributing

When adding new features:
1. Follow the existing module structure
2. Use DTOs for validation
3. Add Swagger annotations
4. Write tests
5. Update this guide

