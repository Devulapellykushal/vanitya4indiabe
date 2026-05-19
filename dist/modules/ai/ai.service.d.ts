import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ApiUsage } from './entities/api-usage.entity';
export interface GenerateExercisesParams {
    sourceLanguage: string;
    targetLanguage: string;
    difficulty: string;
    exerciseType: string;
    unitId: string;
    count: number;
}
export interface GenerateTTSParams {
    text: string;
    language: string;
}
export interface SpeechToTextParams {
    audioFile: Express.Multer.File;
    language: string;
}
export declare class AiService {
    private apiUsageRepository;
    private configService;
    private sarvamClient;
    private ai4bharatClient;
    private openaiClient;
    constructor(apiUsageRepository: Repository<ApiUsage>, configService: ConfigService);
    generateExercises(params: GenerateExercisesParams): Promise<any[]>;
    generateTTS(params: GenerateTTSParams): Promise<any>;
    speechToText(params: SpeechToTextParams): Promise<any>;
    private buildExercisePrompt;
    private parseExerciseResponse;
    private getVoiceForLanguage;
    private fallbackGenerateExercises;
    private normalizeExercise;
    private getLocalSeedExercises;
    private fallbackGenerateTTS;
    private fallbackSpeechToText;
    private mapLanguageToOpenAI;
    private recordUsage;
}
