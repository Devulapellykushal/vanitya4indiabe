import {
  Entity,
  Column,
  Index,
  OneToMany
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserProgress } from './user-progress.entity';
import { Translation } from './translation.entity';
import { Transliteration } from './transliteration.entity';
import { TTSEntry } from './tts-entry.entity';

@Entity('exercises')
@Index(['unitId'])
@Index(['sourceLanguage', 'targetLanguage'])
@Index(['difficulty'])
@Index(['status'])
@Index(['exerciseType'])
export class Exercise extends BaseEntity {
  @Column({ name: 'unit_id', length: 50 })
  unitId: string;

  @Column({ name: 'source_language', length: 10 })
  sourceLanguage: string;

  @Column({ name: 'target_language', length: 10 })
  targetLanguage: string;

  @Column({ length: 20 })
  difficulty: string;

  @Column({ name: 'exercise_type', length: 30 })
  exerciseType: string;

  @Column({ name: 'original_question', type: 'text' })
  originalQuestion: string;

  @Column({ name: 'original_options', type: 'jsonb' })
  originalOptions: string[];

  @Column({ name: 'correct_answer', type: 'text' })
  correctAnswer: string;

  @Column({ type: 'text', nullable: true })
  hint: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ name: 'sarvam_generated_json', type: 'jsonb', nullable: true })
  sarvamGeneratedJson: Record<string, any>;

  @Column({ default: 'pending', length: 20 })
  status: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @OneToMany(() => UserProgress, (progress) => progress.exercise)
  userProgress: UserProgress[];

  @OneToMany(() => Translation, (translation) => translation.exercise)
  translations: Translation[];

  @OneToMany(() => Transliteration, (transliteration) => transliteration.exercise)
  transliterations: Transliteration[];

  @OneToMany(() => TTSEntry, (ttsEntry) => ttsEntry.exercise)
  ttsEntries: TTSEntry[];

  markAsProcessed() {
    this.status = 'processed';
  }

  markAsError(error: Error) {
    this.status = 'error';
    this.metadata = {
      ...this.metadata,
      error: error.message,
      errorTimestamp: new Date().toISOString()
    };
  }

  updateMetadata(updates: Record<string, any>) {
    this.metadata = {
      ...this.metadata,
      ...updates
    };
  }
}

