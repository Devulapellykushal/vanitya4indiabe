import {
  Entity,
  Column,
  ManyToOne
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Exercise } from './exercise.entity';

@Entity('translations')
export class Translation extends BaseEntity {
  @Column({ name: 'exercise_id' })
  exerciseId: string;

  @Column({ length: 10 })
  locale: string;

  @Column({ name: 'translated_question', type: 'text' })
  translatedQuestion: string;

  @Column({ name: 'translated_options', type: 'jsonb' })
  translatedOptions: string[];

  @Column({ length: 50 })
  provider: string;

  @Column({ type: 'float', nullable: true })
  confidence: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.translations)
  exercise: Exercise;
}

