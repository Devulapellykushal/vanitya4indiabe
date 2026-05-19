import { BaseEntity } from '../../../common/entities/base.entity';
import { Exercise } from './exercise.entity';
export declare class Transliteration extends BaseEntity {
    exerciseId: string;
    sourceScript: string;
    targetScript: string;
    transliteratedQuestion: string;
    transliteratedOptions: string[];
    provider: string;
    confidence: number;
    exercise: Exercise;
}
