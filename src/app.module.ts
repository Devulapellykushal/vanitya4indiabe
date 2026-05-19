import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Configuration
import { databaseConfig } from './config/database.config';
import { envValidation } from './config/env.validation';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ExerciseModule } from './modules/exercise/exercise.module';
import { SttModule } from './modules/stt/stt.module';
import { RecommenderModule } from './modules/recommender/recommender.module';
import { AdminModule } from './modules/admin/admin.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      ...(envValidation && { validationSchema: envValidation }),
      envFilePath: [
        `config/environments/${process.env.NODE_ENV || 'development'}.env`,
        '.env'
      ]
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_NAME', 'vanitya'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        logging: configService.get<string>('NODE_ENV') === 'development',
        ssl: configService.get<string>('DB_SSL') === 'true',
        extra: {
          max: configService.get<number>('DB_POOL_MAX', 10),
          min: configService.get<number>('DB_POOL_MIN', 0),
          acquire: configService.get<number>('DB_POOL_ACQUIRE', 30000),
          idle: configService.get<number>('DB_POOL_IDLE', 10000)
        }
      }),
      inject: [ConfigService]
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // ThrottlerModuleOptions expects an array of ThrottlerOptions
        return [
          {
            ttl: Math.floor(configService.get<number>('RATE_LIMIT_WINDOW_MS', 900000) / 1000), // Convert to seconds
            limit: configService.get<number>('RATE_LIMIT_MAX_REQUESTS', 100)
          }
        ];
      },
      inject: [ConfigService]
    }),

    // Task Scheduling
    ScheduleModule.forRoot(),

    // Feature Modules
    AuthModule,
    UserModule,
    ExerciseModule,
    SttModule,
    RecommenderModule,
    AdminModule,
    AiModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}

