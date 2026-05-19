import {
  Entity,
  Column,
  ManyToOne
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Exercise } from './exercise.entity';

@Entity('tts_entries')
export class TTSEntry extends BaseEntity {
  @Column({ name: 'exercise_id' })
  exerciseId: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ length: 10 })
  language: string;

  @Column({ name: 'audio_url', nullable: true })
  audioUrl: string;

  @Column({ name: 'duration_ms', nullable: true })
  durationMs: number;

  @Column({ length: 20, nullable: true })
  codec: string;

  @ManyToOne(() => Exercise, (exercise) => exercise.ttsEntries)
  exercise: Exercise;
}

