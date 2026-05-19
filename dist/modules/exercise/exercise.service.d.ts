import { Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
import { User } from '../user/entities/user.entity';
import { FetchExercisesDto } from './dto/fetch-exercises.dto';
import { GenerateAudioDto } from './dto/generate-audio.dto';
import { GenerateExerciseDto } from './dto/generate-exercise.dto';
import { SubmitExerciseDto } from './dto/submit-exercise.dto';
import { Exercise } from './entities/exercise.entity';
import { TTSEntry } from './entities/tts-entry.entity';
import { UserProgress } from './entities/user-progress.entity';
export declare class ExerciseService {
    private exerciseRepository;
    private userProgressRepository;
    private userRepository;
    private ttsEntryRepository;
    private aiService;
    constructor(exerciseRepository: Repository<Exercise>, userProgressRepository: Repository<UserProgress>, userRepository: Repository<User>, ttsEntryRepository: Repository<TTSEntry>, aiService: AiService);
    fetchExercises(userId: string, dto: FetchExercisesDto): Promise<{
        exercises: Exercise[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    submitExercise(userId: string, dto: SubmitExerciseDto): Promise<any>;
    generateExercises(userId: string, dto: GenerateExerciseDto): Promise<{
        message: string;
        exercises: any[];
        processingStatus: string;
    }>;
    generateAudio(exerciseId: string, dto: GenerateAudioDto): Promise<{
        message: string;
        audio: {
            url: string;
            duration: number;
            codec: string;
        };
    }>;
    getExercise(exerciseId: string, userId: string): Promise<{
        exercise: Exercise;
    }>;
}
