import { Repository } from 'typeorm';
import { Exercise } from '../exercise/entities/exercise.entity';
import { AiService } from '../ai/ai.service';
export declare class SttService {
    private exerciseRepository;
    private aiService;
    constructor(exerciseRepository: Repository<Exercise>, aiService: AiService);
    processAudio(file: Express.Multer.File, language: string, exerciseId?: string): Promise<any>;
    getSupportedLanguages(): {
        languages: {
            code: string;
            name: string;
        }[];
    };
}
