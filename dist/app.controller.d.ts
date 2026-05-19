import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
export declare class AppController {
    private readonly appService;
    private readonly configService;
    constructor(appService: AppService, configService: ConfigService);
    getRoot(): {
        success: boolean;
        message: string;
        version: string;
        environment: any;
        timestamp: string;
        endpoints: {
            health: string;
            api: string;
            docs: string;
            metrics: string;
        };
        note: string;
    };
    getHealth(): {
        status: string;
        timestamp: string;
        environment: any;
        version: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
    };
}
