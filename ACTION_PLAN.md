# 🎯 Vanitya Backend - Action Plan

## 📊 Current Status

✅ **Completed**:
- NestJS migration (100%)
- All API endpoints working
- Database setup complete
- Comprehensive test suite (42 tests passing)
- Authentication system
- Basic AI service integration

⚠️ **Needs Implementation**:
- AI service fallback logic
- RL algorithm implementation
- Background job queue
- Production migrations

---

## 🚀 Immediate Action Items (This Week)

### 1. **Complete AI Service Fallback** (Priority: HIGH) 🔴

**Location**: `src/modules/ai/ai.service.ts` (Lines 181-209)

**Current State**: Returns placeholder data

**What to Implement**:

```typescript
// Option 1: Try AI4Bharat API
private async fallbackGenerateExercises(params: GenerateExercisesParams): Promise<any[]> {
  try {
    // Try AI4Bharat
    const response = await this.ai4bharatClient.post('/exercises/generate', {
      source_language: params.sourceLanguage,
      target_language: params.targetLanguage,
      difficulty: params.difficulty,
      exercise_type: params.exerciseType,
      count: params.count
    });
    
    await this.recordUsage('ai4bharat', '/exercises/generate', 1, params, 200);
    return this.parseExerciseResponse(response.data);
  } catch (error) {
    await this.recordUsage('ai4bharat', '/exercises/generate', 1, params, 
      error.response?.status || 500, error.message);
    
    // Option 2: Use local seed data
    return this.getLocalSeedExercises(params);
  }
}

// Helper method to get local seed exercises
private async getLocalSeedExercises(params: GenerateExercisesParams): Promise<any[]> {
  // Query database for existing exercises matching criteria
  // Or use hardcoded templates
  return [{
    original_question: `Translate from ${params.sourceLanguage} to ${params.targetLanguage}`,
    answer_options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
    correct_answer: 'Option 1',
    hint: 'Think about common phrases',
    explanation: 'This is a template exercise'
  }];
}
```

**Steps**:
1. [ ] Implement AI4Bharat client calls
2. [ ] Add local seed data fallback
3. [ ] Test all fallback scenarios
4. [ ] Update tests if needed

**Estimated Time**: 2-3 hours

---

### 2. **Implement RL Algorithm** (Priority: MEDIUM) 🟡

**Location**: `src/modules/recommender/entities/rl-state.entity.ts` (Line 25)

**Current State**: Returns `null`

**What to Implement**:

```typescript
selectArm(): string | null {
  // Epsilon-greedy algorithm
  const epsilon = this.modelState.epsilon || 0.1;
  const armWeights = this.modelState.armWeights || {};
  const armCounts = this.modelState.armCounts || {};
  
  // Exploration: random arm
  if (Math.random() < epsilon) {
    const arms = Object.keys(armWeights);
    return arms[Math.floor(Math.random() * arms.length)] || null;
  }
  
  // Exploitation: best arm
  let bestArm = null;
  let bestValue = -Infinity;
  
  for (const [arm, weight] of Object.entries(armWeights)) {
    const count = armCounts[arm] || 0;
    // UCB1-like value: weight + exploration bonus
    const value = weight + Math.sqrt(2 * Math.log(this.modelState.totalPulls || 1) / (count + 1));
    if (value > bestValue) {
      bestValue = value;
      bestArm = arm;
    }
  }
  
  return bestArm;
}

updateArm(arm: string, reward: number): void {
  const armWeights = this.modelState.armWeights || {};
  const armCounts = this.modelState.armCounts || {};
  const rewards = this.modelState.rewards || {};
  
  // Update counts
  armCounts[arm] = (armCounts[arm] || 0) + 1;
  this.modelState.armCounts = armCounts;
  
  // Update rewards
  rewards[arm] = (rewards[arm] || 0) + reward;
  this.modelState.rewards = rewards;
  
  // Update weights (average reward)
  armWeights[arm] = rewards[arm] / armCounts[arm];
  this.modelState.armWeights = armWeights;
  
  // Update total pulls
  this.modelState.totalPulls = (this.modelState.totalPulls || 0) + 1;
  
  this.lastUpdated = new Date();
}
```

**Steps**:
1. [ ] Implement `selectArm()` method
2. [ ] Implement `updateArm()` method
3. [ ] Initialize model state in RecommenderService
4. [ ] Test RL algorithm with sample data
5. [ ] Tune hyperparameters

**Estimated Time**: 4-6 hours

---

### 3. **Set Up Background Job Queue** (Priority: MEDIUM) 🟡

**Location**: `src/modules/exercise/exercise.service.ts` (Line 203)

**Current State**: TODO comment

**What to Implement**:

```bash
# Install BullMQ
bun add @nestjs/bullmq bullmq
```

```typescript
// exercise.module.ts
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'exercise-processing',
    }),
    // ...
  ],
  // ...
})

// exercise.service.ts
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

constructor(
  // ...
  @InjectQueue('exercise-processing') private exerciseQueue: Queue,
) {}

// In generateExercises method:
await this.exerciseQueue.add('process-exercise', {
  exerciseId: savedExercise.id,
  sourceLanguage,
  targetLanguage,
  exerciseType,
  difficulty
});

// Create processor: exercise.processor.ts
@Processor('exercise-processing')
export class ExerciseProcessor {
  @Process('process-exercise')
  async handleExerciseProcessing(job: Job) {
    const { exerciseId, sourceLanguage, targetLanguage } = job.data;
    
    // 1. Generate translations
    // 2. Generate transliterations
    // 3. Generate TTS audio
    // 4. Update exercise status to 'processed'
  }
}
```

**Steps**:
1. [ ] Install BullMQ
2. [ ] Configure Redis connection for BullMQ
3. [ ] Create exercise processing queue
4. [ ] Implement exercise processor
5. [ ] Add retry logic
6. [ ] Test queue processing

**Estimated Time**: 3-4 hours

---

## 📅 Short-Term Goals (Next 2 Weeks)

### Week 1:
- [ ] Complete AI service fallback
- [ ] Implement RL algorithm
- [ ] Add more unit tests (Auth, Exercise, User services)
- [ ] Set up job queue

### Week 2:
- [ ] Create production migrations
- [ ] Add Redis caching
- [ ] Implement rate limiting per user
- [ ] Add monitoring and logging

---

## 🎯 Long-Term Goals (Next Month)

1. **Performance Optimization**
   - [ ] Add Redis caching layer
   - [ ] Optimize database queries
   - [ ] Implement connection pooling
   - [ ] Add response compression

2. **Security Enhancements**
   - [ ] Implement CSRF protection
   - [ ] Add input sanitization
   - [ ] Set up API key rotation
   - [ ] Add security monitoring

3. **Monitoring & Observability**
   - [ ] Set up application monitoring
   - [ ] Implement structured logging
   - [ ] Add error tracking (Sentry)
   - [ ] Set up performance monitoring

4. **Documentation**
   - [ ] Complete API documentation
   - [ ] Add deployment guides
   - [ ] Create developer onboarding docs
   - [ ] Document architecture decisions

---

## 🛠️ Development Workflow

### Daily Routine:

1. **Morning**:
   ```bash
   # Start dev server
   bun run start:dev
   
   # Run tests
   bun test
   ```

2. **Before Committing**:
   ```bash
   # Run linter
   bun run lint
   
   # Run tests
   bun test
   
   # Check API
   ./test-api.sh
   ```

3. **Feature Development**:
   ```bash
   # Create feature branch
   git checkout -b feature/your-feature-name
   
   # Make changes
   # Write tests
   # Commit
   git commit -m "feat: your feature description"
   ```

---

## 📚 Learning Resources

### NestJS
- Official Docs: https://docs.nestjs.com/
- TypeORM: https://typeorm.io/
- Testing: https://docs.nestjs.com/fundamentals/testing

### Reinforcement Learning
- Epsilon-Greedy: https://en.wikipedia.org/wiki/Multi-armed_bandit
- UCB1 Algorithm: Research paper references

### Background Jobs
- BullMQ: https://docs.bullmq.io/
- Redis: https://redis.io/docs/

---

## 🐛 Common Issues & Quick Fixes

### Database Connection Issues
```bash
# Check PostgreSQL
pg_isready

# Check connection
psql -h localhost -U postgres -d vanitya
```

### Port Already in Use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill
```

### Test Failures
```bash
# Clear cache and reinstall
rm -rf node_modules
bun install
bun test
```

---

## ✅ Success Criteria

Your project will be production-ready when:

- [ ] All TODO items completed
- [ ] Test coverage > 80%
- [ ] All endpoints tested
- [ ] Production migrations created
- [ ] Environment variables configured
- [ ] Monitoring set up
- [ ] Documentation complete
- [ ] Security audit passed

---

## 🎉 You're Ready!

Start with **Task 1: Complete AI Service Fallback** - it's the most critical and will make your app production-ready quickly!

**Good luck! 🚀**

