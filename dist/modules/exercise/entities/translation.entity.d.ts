import { BaseEntity } from '../../../common/entities/base.entity';
import { Exercise } from './exercise.entity';
export declare class Translation extends BaseEntity {
    exerciseId: string;
    locale: string;
    translatedQuestion: string;
    translatedOptions: string[];
    provider: string;
    confidence: number;
    exercise: Exercise;
}
