import { ExerciseService } from './exercise.service';
import { FetchExercisesDto } from './dto/fetch-exercises.dto';
import { SubmitExerciseDto } from './dto/submit-exercise.dto';
import { GenerateExerciseDto } from './dto/generate-exercise.dto';
import { GenerateAudioDto } from './dto/generate-audio.dto';
export declare class ExerciseController {
    private readonly exerciseService;
    constructor(exerciseService: ExerciseService);
    fetchExercises(dto: FetchExercisesDto, user: any): Promise<{
        exercises: import("./entities/exercise.entity").Exercise[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    submitExercise(dto: SubmitExerciseDto, user: any): Promise<any>;
    generateExercises(dto: GenerateExerciseDto, user: any): Promise<{
        message: string;
        exercises: any[];
        processingStatus: string;
    }>;
    generateAudio(id: string, dto: GenerateAudioDto, user: any): Promise<{
        message: string;
        audio: {
            url: string;
            duration: number;
            codec: string;
        };
    }>;
    getExercise(id: string, user: any): Promise<{
        exercise: import("./entities/exercise.entity").Exercise;
    }>;
}
