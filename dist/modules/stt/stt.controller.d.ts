import { SttService } from './stt.service';
import { SubmitAudioDto } from './dto/submit-audio.dto';
export declare class SttController {
    private readonly sttService;
    constructor(sttService: SttService);
    submitAudio(file: Express.Multer.File, dto: SubmitAudioDto, user: any): Promise<any>;
    getSupportedLanguages(): {
        languages: {
            code: string;
            name: string;
        }[];
    };
}
