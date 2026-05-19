import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const environment = configService.get<string>('NODE_ENV', 'development');

  // Trust proxy - Configure via Express adapter for rate limiting behind proxy
  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter && httpAdapter.getInstance) {
    const expressApp = httpAdapter.getInstance();
    if (expressApp && typeof expressApp.set === 'function') {
      expressApp.set('trust proxy', true);
    }
  }

  // Security - Configure helmet based on environment
  const helmetOptions: any = {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    }
  };

  if (environment === 'production') {
    // Production: Full security headers
    helmetOptions.hsts = {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    };
  } else {
    // Development: Disable headers that require trustworthy origins
    helmetOptions.hsts = false;
    helmetOptions.crossOriginOpenerPolicy = false;
    helmetOptions.crossOriginEmbedderPolicy = false;
  }

  app.use(helmet(helmetOptions));

  // Compression
  app.use(compression());

  // CORS
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID']
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  // Global filters - inject ConfigService (reuse existing configService)
  app.useGlobalFilters(new AllExceptionsFilter(configService));

  // Global interceptors
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new LoggingInterceptor()
  );

  // Swagger documentation
  if (environment !== 'production') {
    // Use localhost for Swagger (browsers trust localhost, not 0.0.0.0)
    const swaggerHost = 'localhost';
    const config = new DocumentBuilder()
      .setTitle('Vanitya API')
      .setDescription('Language Learning Platform for Indic Languages')
      .setVersion('1.0')
      .addServer(`http://${swaggerHost}:${port}`, 'Development server (localhost)')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('exercises', 'Exercise management')
      .addTag('stt', 'Speech-to-text')
      .addTag('recommender', 'Exercise recommendations')
      .addTag('admin', 'Admin operations')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);
  
  const host = configService.get<string>('HOST', '0.0.0.0');
  console.log(`🚀 Vanitya Backend API server running:`);
  console.log(`   URL: http://${host}:${port}`);
  console.log(`   Environment: ${environment}`);
  console.log(`   Health Check: http://localhost:${port}/api/v1/health`);
  if (environment !== 'production') {
    console.log(`   API Docs: http://localhost:${port}/api/docs (use localhost, not 0.0.0.0)`);
  }
  console.log(`   Process ID: ${process.pid}`);
  console.log(`   Node.js Version: ${process.version}`);
}

bootstrap();

