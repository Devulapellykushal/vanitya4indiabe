# GitHub Copilot Instructions for Vanitya

This file provides comprehensive guidance to GitHub Copilot when working with the Vanitya language learning platform.

## Project Overview

Vanitya is a comprehensive language learning platform focused on Indic languages, comprising:
- **Backend API** (Node.js/Express with Clean Architecture)
- **ML Microservice** (Python/FastAPI for AI operations)
- **Frontend Mobile App** (React Native with TypeScript)

## Multi-Branch Worktree Architecture

**CRITICAL**: This project uses Git worktrees for parallel development across multiple branches:

```
F:\Vanitya\Vanitya              # Main repo (vanitya-be branch)
F:\Vanitya\worktrees\vanitya-fe # Frontend worktree (React Native)
F:\Vanitya\worktrees\vanitya-ml # ML service worktree (Python)
```

### Branch-Specific Context
Always identify which branch you're working in:
- **vanitya-be**: Backend API, database, business logic
- **vanitya-fe**: React Native mobile app, UI/UX
- **vanitya-ml**: Python ML service, AI operations

## Core Technologies & Patterns

### Backend (vanitya-be)
- **Framework**: Express.js with Clean Architecture
- **Database**: PostgreSQL with Sequelize ORM
- **Cache**: Redis for sessions and API rate limiting
- **AI Integration**: Multi-provider fallback system (Sarvam AI → AI4Bharat → Local)
- **Authentication**: JWT with social login support
- **API**: RESTful with structured error handling

### Frontend (vanitya-fe)
- **Framework**: React Native 0.81.0 with TypeScript
- **Navigation**: React Navigation v7 (Stack + Tab navigators)
- **State**: Custom hooks-based state management
- **Theme**: Custom dark/light theme with AsyncStorage persistence
- **Audio**: React Native Sound + STT integration
- **Languages**: Focus on Indic languages (Hindi, Telugu, Tamil, etc.)

### ML Service (vanitya-ml)
- **Framework**: FastAPI with async/await
- **AI Providers**: Sarvam AI (primary), AI4Bharat (fallback)
- **Capabilities**: Translation, transliteration, TTS, STT, exercise generation
- **Processing**: Multi-provider fallback chains with confidence scoring
- **Scripts**: Aksharamukha for Indic script conversion

## Development Patterns

### Code Style
- **TypeScript**: Strict mode with comprehensive type definitions
- **Python**: Type hints, Black formatting, comprehensive error handling
- **JavaScript/Node.js**: ES6+, async/await, functional patterns
- **Error Handling**: Custom exceptions with structured responses

### Architecture Principles
- **Clean Architecture**: Clear separation of concerns
- **Provider Pattern**: Multi-provider fallbacks for AI services
- **Hook Pattern**: Custom React hooks for complex state management
- **Service Layer**: Abstracted external API integrations

### API Design
- RESTful endpoints with consistent naming
- Comprehensive request/response validation
- Structured error responses with request IDs
- Health check endpoints for all services

## Language Learning Domain

### Exercise System
- **Types**: multiple_choice, translation, transliteration, listening, speaking
- **Difficulty**: beginner, intermediate, advanced
- **Hearts System**: Lives/attempts tracking (typically 5 hearts)
- **Retry Logic**: Failed questions queued for retry
- **Progress**: XP, streaks, achievements

### Indic Languages Support
Primary focus on:
- Hindi (hi), Telugu (te), Tamil (ta), Kannada (kn)
- Malayalam (ml), Gujarati (gu), Bengali (bn), Marathi (mr)
- Punjabi (pa), Odia (or), Assamese (as), Urdu (ur)

### AI Operations
- **Translation**: Context-aware with confidence scoring
- **Transliteration**: Script conversion between Indic scripts
- **Exercise Generation**: AI-powered question/option generation
- **Audio**: TTS for pronunciation, STT for speech exercises

## Common Development Tasks

### Adding New Features
1. **Cross-service features**: Plan API contracts first in backend
2. **UI features**: Start with TypeScript interfaces and navigation
3. **ML features**: Implement with provider fallback chains
4. **Database changes**: Use Sequelize migrations with rollback support

### Testing Strategy
- **Backend**: Jest with supertest for API testing
- **Frontend**: Jest + React Native Testing Library
- **ML Service**: pytest with comprehensive mocking
- **Integration**: Test provider fallback scenarios

### Error Handling Patterns
```javascript
// Backend pattern
try {
  const result = await service.operation();
  return { success: true, data: result };
} catch (error) {
  logger.error(`Operation failed: ${error.message}`);
  throw new CustomException(error.message, 'OPERATION_FAILED');
}
```

```python
# ML service pattern
async def operation_with_fallback():
    for provider in get_providers():
        try:
            return await provider.operation()
        except Exception as e:
            logger.warning(f"{provider} failed: {e}")
            continue
    raise Exception("All providers failed")
```

## Development Commands

### Backend (vanitya-be)
```bash
npm run dev                      # Development server
npm run db:migrate              # Run migrations
npm run db:seed                 # Seed database
npm run db:reset                # Reset database
make up                         # Docker compose
make test-backend               # Run tests
```

### Frontend (vanitya-fe)
```bash
npm start                       # Metro bundler
npm run android                 # Android development
npm run ios                     # iOS development
npm run lint                    # ESLint
npm test                        # Jest tests
bundle exec pod install        # iOS dependencies
```

### ML Service (vanitya-ml)
```bash
cd vanitya-ml
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
pytest tests/ -v               # Run tests
black src/ tests/              # Format code
mypy src/                      # Type checking
```

## Important Configuration

### Environment Variables
- **API Keys**: SARVAM_API_KEY, AI4BHARAT_API_KEY
- **Database**: DATABASE_URL, DB_HOST, DB_PORT
- **Cache**: REDIS_URL, REDIS_HOST
- **Security**: JWT_SECRET
- **ML Service**: ML_SERVICE_URL

### File Structure Conventions
- **Backend**: Clean Architecture with layers (api, application, infrastructure)
- **Frontend**: Feature-based organization with shared components
- **ML**: Service-oriented with provider abstraction

## Multi-Agent Coordination

When working across branches:
1. **API Contracts**: Define in backend first, implement in frontend/ML
2. **Data Models**: Keep consistent across all services
3. **Error Handling**: Use consistent error codes and messages
4. **Documentation**: Update WARP.md files in each branch

## Best Practices

### Code Generation
- Generate complete TypeScript interfaces for API responses
- Create comprehensive error handling for all external API calls
- Implement proper loading states and user feedback
- Add proper validation for all user inputs

### AI Integration
- Always implement provider fallbacks
- Log provider performance and fallback triggers
- Cache expensive operations (translations, TTS)
- Implement confidence thresholds for quality control

### Mobile Development
- Use responsive design with theme system
- Implement proper accessibility features
- Handle offline scenarios gracefully
- Test on both iOS and Android

### Performance
- Implement proper caching strategies
- Use pagination for large data sets
- Optimize image and audio assets
- Monitor API response times and fallback triggers

## Security Considerations
- Never hardcode API keys or secrets
- Implement proper input validation and sanitization
- Use rate limiting for all external API calls
- Encrypt sensitive data in storage
- Implement proper authentication and authorization

## Testing Guidelines
- Mock external API calls in tests
- Test provider fallback scenarios
- Include edge cases and error conditions
- Maintain high test coverage for critical paths
- Use proper test data that represents real usage