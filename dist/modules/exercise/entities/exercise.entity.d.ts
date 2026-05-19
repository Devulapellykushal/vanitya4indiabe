import { BaseEntity } from '../../../common/entities/base.entity';
import { UserProgress } from './user-progress.entity';
import { Translation } from './translation.entity';
import { Transliteration } from './transliteration.entity';
import { TTSEntry } from './tts-entry.entity';
export declare class Exercise extends BaseEntity {
    unitId: string;
    sourceLanguage: string;
    targetLanguage: string;
    difficulty: string;
    exerciseType: string;
    originalQuestion: string;
    originalOptions: string[];
    correctAnswer: string;
    hint: string;
    explanation: string;
    sarvamGeneratedJson: Record<string, any>;
    status: string;
    metadata: Record<string, any>;
    userProgress: UserProgress[];
    translations: Translation[];
    transliterations: Transliteration[];
    ttsEntries: TTSEntry[];
    markAsProcessed(): void;
    markAsError(error: Error): void;
    updateMetadata(updates: Record<string, any>): void;
}
