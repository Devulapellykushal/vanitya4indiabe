import { Controller, Get, VERSION_NEUTRAL, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('root')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService
  ) {}

  @Get()
  @Version([VERSION_NEUTRAL, '1'])
  @ApiOperation({ summary: 'Get API information' })
  @ApiResponse({ status: 200, description: 'API information' })
  getRoot() {
    return {
      success: true,
      message: 'Vanitya Backend API',
      version: '1.0.0',
      environment: this.configService.get('NODE_ENV', 'development'),
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/api/v1/health',
        api: '/api/v1',
        docs: '/api/docs',
        metrics: '/api/v1/metrics'
      },
      note: 'This endpoint works at both /api and /api/v1'
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth() {
    return this.appService.getHealth();
  }
}

