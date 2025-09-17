# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Vanitya is a language learning platform for Indic Languages built with:
- **Backend**: Node.js/Express API with Clean Architecture principles  
- **ML Service**: Python/FastAPI microservice for language processing
- **Database**: PostgreSQL with Sequelize ORM
- **Cache**: Redis for session/data caching
- **AI Providers**: Sarvam AI (primary), AI4Bharat (fallback), local seed data

## Development Commands

### Local Development
```bash
# Setup development environment
make dev-setup                    # Copy config files and show setup instructions

# Start services
npm run dev                       # Start backend in development mode
make up                          # Start all services with Docker Compose
make up-dev                      # Start with development tools (includes Adminer)

# Database operations
npm run db:migrate               # Run database migrations
npm run db:seed                  # Seed database with sample data
npm run db:reset                 # Drop, create, migrate and seed database
make db-migrate                  # Migrate database in Docker
make db-reset                    # Reset database in Docker
```

### Testing
```bash
npm test                         # Run Jest test suite
npm run test:watch               # Run tests in watch mode
npm run test:coverage            # Run tests with coverage report
make test-backend                # Run backend tests in Docker
make test-ml                     # Run ML service tests in Docker
```

### Code Quality
```bash
npm run lint                     # Lint code with ESLint
npm run format                   # Format code with Prettier
```

### Docker Operations
```bash
make build                       # Build all Docker images
make logs                        # View logs from all services
make logs-f                      # Follow logs from all services
make ps                         # List running containers
make clean                       # Remove containers, volumes, and images
```

### Service Access
```bash
make shell-backend               # Shell into backend container
make shell-ml                    # Shell into ML service container
make db-shell                    # PostgreSQL shell
make redis-cli                   # Redis CLI
```

### Kubernetes (Local Testing)
```bash
make k8s-apply                   # Apply all Kubernetes manifests
make k8s-delete                  # Delete Kubernetes resources
make k8s-status                  # Show deployment status
make k8s-logs-backend           # Follow backend logs
make k8s-logs-ml                # Follow ML service logs
```

### Single Test Execution
```bash
# Run specific test file
npm test -- path/to/test.js

# Run test with specific pattern
npm test -- --testNamePattern="specific test name"

# Run tests for specific module
npm test -- controllers/authController.test.js
```

## Architecture Overview

### Clean Architecture Structure
The codebase follows Clean Architecture with clear separation of concerns:

```
src/
├── api/                         # API layer (Express routes, middleware)
├── application/                 # Application services & use cases
│   └── use-cases/              # Business logic implementations
├── core/                       # Core configuration & shared utilities
│   ├── config/                 # Configuration management
│   ├── exceptions/             # Custom error types
│   └── middleware/             # Shared middleware
├── infrastructure/             # External services & data access
│   └── database/               # Sequelize models & database layer
├── controllers/                # Request handlers
└── services/                   # External service integrations
```

### Service Architecture
- **Backend API**: Express.js server handling HTTP requests, authentication, and business logic
- **ML Service**: FastAPI microservice for AI/ML operations (language processing, TTS/STT)
- **Database Layer**: PostgreSQL with Sequelize ORM for data persistence
- **Caching Layer**: Redis for API rate limiting, session management, and response caching
- **AI Integration**: Multi-provider system with automatic failover (Sarvam AI → AI4Bharat → Local)

### Key Data Models
- **Users**: Authentication, language preferences, progress tracking, hearts/streak system
- **Exercises**: Language learning content with multiple types (translation, transliteration, listening, speaking)  
- **UserProgress**: Individual progress tracking per exercise
- **APIUsage**: Provider API usage tracking and credit management

### AI Provider System
The platform uses a sophisticated fallback system:
1. **Primary**: Sarvam AI for question generation, TTS, STT
2. **Secondary**: AI4Bharat as fallback provider
3. **Tertiary**: Local seed data for development/testing

Credit management automatically switches providers when:
- API credits are exhausted (below configurable threshold)
- Provider returns errors (429, 500, etc.)
- Network timeouts occur
- Invalid responses are received

### Configuration Management
- **YAML Config**: `config/vanitya-config.yml` for provider settings and AI configuration
- **Environment Variables**: Override YAML settings via `.env` file
- **Multi-Environment**: Development, production, and test configurations
- **Secrets**: API keys and sensitive data managed through environment variables

## Development Guidelines

### Adding New Exercises
1. Define exercise schema in `src/infrastructure/database/exercise.js`
2. Add validation in exercise controller
3. Update AI prompts in `src/services/sarvamClient.js`
4. Test with multiple language pairs (Hindi ↔ Telugu primary)

### Working with AI Providers
- All AI operations go through `src/services/sarvamClient.js`
- Automatic failover is handled transparently
- Credit usage is tracked in `api_usage` table
- Configure providers in `config/vanitya-config.yml`

### Database Migrations
- Use Sequelize CLI for schema changes: `npx sequelize-cli migration:generate --name migration-name`
- Models are in `src/infrastructure/database/` 
- Always test migrations with both `db:migrate` and `db:reset`

### Testing Strategy
- Unit tests for services and utilities
- Integration tests for API endpoints
- Database tests use separate test database
- Mock external API calls in tests
- Coverage reports generated in `coverage/` directory

### Error Handling
- Custom exceptions in `src/core/exceptions/`
- Global error handler in middleware stack
- Structured error responses with request IDs
- API usage tracking includes error logging

### Authentication & Authorization
- JWT-based authentication
- Social login support (Google, Facebook, GitHub)
- User roles system with admin capabilities
- Rate limiting per user and endpoint

## Environment Variables

Critical environment variables to set:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/dbname
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=vanitya

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# AI Providers
SARVAM_API_KEY=your_sarvam_api_key
SARVAM_CREDITS_THRESHOLD=50
FIREBASE_API_KEY=your_firebase_api_key

# Security
JWT_SECRET=your-jwt-secret-change-in-production

# Application
NODE_ENV=development
PORT=5000
ML_SERVICE_URL=http://localhost:8000
```

## Port Configuration

Default ports used by services:
- **Backend API**: 5000
- **ML Service**: 8000  
- **PostgreSQL**: 5432
- **Redis**: 6379
- **Adminer** (dev only): 8080

## Service Dependencies

### Backend Service Dependencies
- PostgreSQL database must be running and accessible
- Redis cache must be running for rate limiting and sessions
- ML Service should be available for AI operations
- External AI provider APIs (Sarvam AI, AI4Bharat) for production

### ML Service Dependencies  
- PostgreSQL for data access
- Redis for caching ML results
- Python packages listed in `vanitya-ml/requirements.txt`
- Language models and processing libraries (transformers, torch, etc.)

## Troubleshooting

### Database Issues
```bash
# Reset database completely
make db-reset
# Or manually:
npm run db:reset
```

### AI Provider Failures
- Check provider API keys in configuration
- Review credit balance with `SARVAM_CREDITS_THRESHOLD`
- Verify fallback order in `config/vanitya-config.yml`
- Use local seed data for development: set `FALLBACK_ORDER=local_seed`

### Docker Issues
```bash
# Clean Docker state
make clean
# Rebuild everything
make build && make up
```

### Container Logs
```bash
# View all service logs
make logs-f
# Or specific service:
docker compose logs -f backend
docker compose logs -f ml-service
```