import { BaseEntity } from '../../../common/entities/base.entity';
import { Exercise } from './exercise.entity';
export declare class TTSEntry extends BaseEntity {
    exerciseId: string;
    text: string;
    language: string;
    audioUrl: string;
    durationMs: number;
    codec: string;
    exercise: Exercise;
}
