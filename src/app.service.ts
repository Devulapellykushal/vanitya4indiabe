import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: this.configService.get('NODE_ENV', 'development'),
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }
}

