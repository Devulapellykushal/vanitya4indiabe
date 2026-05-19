# Vanitya

> Language Learning Platform for Indic Languages

Vanitya is an enterprise-grade language learning platform designed specifically for Indic languages. It provides an intelligent, gamified learning experience with AI-powered exercise generation, speech recognition, and personalized recommendations.

## 🎯 Overview

Vanitya helps users learn Indic languages (Hindi, Telugu, Tamil, Kannada, Malayalam, and more) through interactive exercises, audio-based learning, and adaptive difficulty progression. The platform uses advanced AI models to generate contextual exercises and provides real-time feedback to enhance the learning experience.

## ✨ Features

### Core Learning Features
- **Multiple Exercise Types**: Translation, transliteration, listening, speaking, and matching exercises
- **Adaptive Difficulty**: Beginner, intermediate, and advanced levels with personalized progression
- **Gamification**: Hearts/lives system, streaks, XP tracking, and achievements
- **Audio Support**: Text-to-speech (TTS) and speech-to-text (STT) for pronunciation practice
- **Multi-Language Support**: Support for 10+ Indic languages with script transliteration

### Technical Features
- **AI-Powered Generation**: Automatic exercise generation using Sarvam AI and AI4Bharat
- **Intelligent Fallback**: Automatic provider failover when primary AI services are unavailable
- **Real-Time Progress Tracking**: Comprehensive analytics and progress monitoring
- **Reinforcement Learning**: Personalized recommendations based on user performance
- **Rate Limiting & Security**: Enterprise-grade security with JWT authentication and rate limiting
- **Scalable Architecture**: Microservices architecture with Docker and Kubernetes support

## 🏗️ Architecture

### System Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Mobile    │──────│   Backend    │──────│  ML Service │
│   App (RN)  │      │   API (BE)   │      │  (Python)   │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
              ┌─────▼─────┐   ┌────▼─────┐
              │ PostgreSQL │   │  Redis   │
              │  Database  │   │   Cache  │
              └───────────┘   └──────────┘
```

### Tech Stack

**Backend API (This Repository)**
- **Runtime**: Node.js 16+
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL 15 with Sequelize ORM
- **Cache**: Redis 7
- **Authentication**: JWT with social login support
- **AI Integration**: Sarvam AI, AI4Bharat, Aksharamukha

**ML Service**
- **Runtime**: Python 3.9+
- **Framework**: FastAPI
- **ML Libraries**: PyTorch, Transformers, scikit-learn
- **NLP**: Indic NLP Library, Aksharamukha

**Frontend** (Separate worktree)
- **Framework**: React Native 0.81
- **Language**: TypeScript
- **Navigation**: React Navigation v7

### Clean Architecture

The backend follows Clean Architecture principles:

```
src/
├── api/                    # API layer (routes, middleware)
│   └── v1/                # API version 1
│       ├── controllers/   # Request handlers
│       └── routes/        # Route definitions
├── application/           # Application services
│   └── use-cases/        # Business logic
├── core/                 # Core configuration
│   ├── config/          # Configuration management
│   ├── exceptions/      # Custom error types
│   └── middleware/      # Shared middleware
├── infrastructure/       # External services
│   ├── database/        # Sequelize models
│   └── clients/        # External API clients
└── services/            # Business services
    ├── ai_clients/      # AI provider clients
    └── providers/      # Provider implementations
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16.0.0 or higher
- **PostgreSQL** 15 or higher
- **Redis** 7 or higher
- **Docker** and **Docker Compose** (optional, for containerized setup)
- **Git** with worktree support (for multi-branch development)

### Installation

1. **Install Bun** (if not already installed)
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Vanitya
   ```

3. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment**
   ```bash
   cp config/env.sample .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Create database
   createdb vanitya
   
   # Run migrations
   bun run migration:run
   
   # Seed sample data (optional)
   bun run seed
   ```

5. **Start services**
   ```bash
   # Using Docker Compose (recommended)
   make up
   
   # Or manually
   # Start PostgreSQL and Redis
   # Then start backend
   bun run start:dev
   ```

### Docker Setup (Recommended)

```bash
# Build and start all services
make build
make up

# Start with development tools (includes Adminer)
make up-dev

# View logs
make logs-f

# Stop services
make down
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/vanitya
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vanitya
DB_USER=postgres
DB_PASSWORD=password

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=24h

# AI Provider Configuration
SARVAM_API_KEY=your_sarvam_api_key
SARVAM_API_URL=https://api.sarvam.ai/v1
SARVAM_CREDITS_THRESHOLD=50

AI4BHARAT_API_KEY=your_ai4bharat_api_key
AI4BHARAT_API_URL=https://api.ai4bharat.org

# ML Service Configuration
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_TIMEOUT=60000

# Application Settings
DEFAULT_SOURCE_LANGUAGE=hi
DEFAULT_TARGET_LANGUAGE=te
SUPPORTED_LANGUAGES=hi,te,kn,ta,ml,en
GAME_HEARTS_INITIAL=5
QUESTIONS_PER_UNIT=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### YAML Configuration

Provider settings are configured in `config/vanitya-config.yml`:

```yaml
providers:
  sarvam:
    base_url: "https://api.sarvam.ai/v1"
    api_key: "__REPLACE__"
    endpoints:
      llm: "/generate"
      tts: "/tts"
      stt: "/stt"
    credit_costs:
      generate_questions: 1
      tts: 1
      stt: 1

credits_threshold: 10
fallback_order: ["ai4bharat", "local_seed"]
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/reset` - Reset password
- `GET /api/v1/auth/profile` - Get user profile (protected)
- `PUT /api/v1/auth/profile` - Update profile (protected)

#### Exercises

- `GET /api/v1/exercises/fetch` - Fetch exercises for user (protected)
- `POST /api/v1/exercises/submit` - Submit exercise answer (protected)
- `POST /api/v1/exercises/generate` - Generate new exercises (protected, rate limited)
- `POST /api/v1/exercises/:id/audio` - Generate audio for exercise (protected)
- `GET /api/v1/exercises/:id` - Get exercise details (protected)

#### Speech-to-Text

- `POST /api/v1/stt/submit` - Transcribe audio (protected, rate limited)

#### Recommender

- `GET /api/v1/recommender/next` - Get next recommended exercise (protected)

#### Admin

- `POST /api/v1/admin/config/update` - Update system configuration (admin only)

### Example Request

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Fetch exercises
curl -X GET http://localhost:3000/api/v1/exercises/fetch \
  -H "Authorization: Bearer <token>"
```

## 🗄️ Database Management

### Migrations

```bash
# Run all pending migrations
bun run migration:run

# Generate new migration
bun run migration:generate -- -n MigrationName

# Revert last migration
bun run migration:revert
```

### Seeding

```bash
# Seed sample data (create seeder script)
bun run seed
```

### Database Models

- **User**: User accounts, preferences, progress tracking
- **Exercise**: Learning exercises with multiple types
- **UserProgress**: Individual progress tracking per exercise
- **Translation**: Exercise translations
- **Transliteration**: Script conversions
- **TTSEntry**: Text-to-speech audio entries
- **APIUsage**: API usage and credit tracking
- **RLState**: Reinforcement learning state

See [Database Documentation](src/database/README.md) for detailed schema information.

## 🧪 Testing

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run with coverage
bun test --coverage

# Run specific test file
bun test path/to/test.ts
```

## 🛠️ Development

### Development Workflow

1. **Start development server**
   ```bash
   bun run start:dev
   ```

2. **Run database migrations**
   ```bash
   bun run migration:run
   ```

3. **Access services**
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health
   - API Docs: http://localhost:3000/api/v1
   - Adminer (Docker): http://localhost:8080

### Code Quality

```bash
# Lint code
bun run lint

# Format code
bun run format
```

### Docker Development

```bash
# Start all services
make up-dev

# View logs
make logs-f

# Access container shell
make shell-backend
make shell-ml

# Database shell
make db-shell

# Redis CLI
make redis-cli
```

## 🚢 Deployment

### Docker Deployment

```bash
# Build production images
docker compose -f deployment/docker/docker-compose.yml build

# Start production services
docker compose -f deployment/docker/docker-compose.yml up -d
```

### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
make k8s-apply

# Check deployment status
make k8s-status

# View logs
make k8s-logs-backend
```

Kubernetes manifests are located in `k8s/` directory.

### Environment-Specific Configuration

Configuration files for different environments:
- `config/environments/development.env`
- `config/environments/production.env`
- `config/environments/testing.env`

## 📖 Project Structure

```
Vanitya/
├── config/                 # Configuration files
│   ├── environments/      # Environment-specific configs
│   └── vanitya-config.yml # Provider configuration
├── database/              # Database schema and migrations
│   ├── migrations/        # Sequelize migrations
│   └── seeders/          # Database seeders
├── deployment/           # Deployment configurations
│   ├── docker/          # Docker configurations
│   └── k8s/            # Kubernetes manifests
├── src/                 # Source code
│   ├── api/            # API layer
│   ├── application/    # Application services
│   ├── core/          # Core utilities
│   ├── infrastructure/ # External integrations
│   └── services/      # Business services
├── vanitya-ml/        # ML service (Python)
├── docker-compose.yml # Docker Compose configuration
├── Makefile          # Development commands
└── package.json      # Node.js dependencies
```

## 🔐 Security

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Per-user and per-endpoint rate limiting
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Sequelize ORM with parameterized queries
- **CORS Configuration**: Configurable CORS policies
- **Helmet.js**: Security headers middleware
- **Environment Variables**: Sensitive data in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Clean Architecture principles
- Write comprehensive tests
- Update documentation
- Follow existing code style
- Add JSDoc comments for complex functions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- **Frontend**: React Native mobile app (separate worktree)
- **ML Service**: Python FastAPI service for AI operations (separate worktree)

## 📞 Support

For issues, questions, or contributions:
- Check existing documentation in `src/database/README.md`, `src/services/README.md`
- Review [WARP.md](WARP.md) for development context
- Open an issue on GitHub

## 🙏 Acknowledgments

- Sarvam AI for language processing APIs
- AI4Bharat for Indic language support
- Aksharamukha for script transliteration

---

**Built with ❤️ for Indic language learners**
