import { ConfigService } from '@nestjs/config';
export declare class AppService {
    private readonly configService;
    constructor(configService: ConfigService);
    getHealth(): {
        status: string;
        timestamp: string;
        environment: any;
        version: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
    };
}
