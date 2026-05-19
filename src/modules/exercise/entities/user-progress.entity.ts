import {
    Column,
    Entity,
    Index,
    ManyToOne,
    Unique
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Exercise } from './exercise.entity';

@Entity('user_progress')
@Unique(['userId', 'exerciseId'])
@Index(['userId'])
@Index(['exerciseId'])
export class UserProgress extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'exercise_id' })
  exerciseId: string;

  @Column({ default: 0 })
  attempts: number;

  @Column({ default: false })
  correct: boolean;

  @Column({ name: 'last_answer', type: 'text', nullable: true })
  lastAnswer: string;

  @Column({ name: 'response_time_ms', nullable: true })
  responseTimeMs: number;

  @Column({ name: 'needs_retry', default: false })
  needsRetry: boolean;

  @Column({ name: 'hint_used', default: false })
  hintUsed: boolean;

  @Column({ name: 'audio_played', default: false })
  audioPlayed: boolean;

  @Column({ name: 'is_voice', default: false })
  isVoice: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @ManyToOne(() => User, (user) => user.progress)
  user: User;

  @ManyToOne(() => Exercise, (exercise) => exercise.userProgress)
  exercise: Exercise;
}

