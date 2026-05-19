import {
  Entity,
  Column,
  ManyToOne
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Exercise } from './exercise.entity';

@Entity('transliterations')
export class Transliteration extends BaseEntity {
  @Column({ name: 'exercise_id' })
  exerciseId: string;

  @Column({ name: 'source_script', length: 20 })
  sourceScript: string;

  @Column({ name: 'target_script', length: 20 })
  targetScript: string;

  @Column({ name: 'transliterated_question', type: 'text' })
  transliteratedQuestion: string;

  @Column({ name: 'transliterated_options', type: 'jsonb' })
  transliteratedOptions: string[];

  @Column({ length: 50 })
  provider: string;

  @Column({ type: 'float', nullable: true })
  confidence: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.transliterations)
  exercise: Exercise;
}

