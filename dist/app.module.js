"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_config_1 = require("./config/database.config");
const env_validation_1 = require("./config/env.validation");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/user/user.module");
const exercise_module_1 = require("./modules/exercise/exercise.module");
const stt_module_1 = require("./modules/stt/stt.module");
const recommender_module_1 = require("./modules/recommender/recommender.module");
const admin_module_1 = require("./modules/admin/admin.module");
const ai_module_1 = require("./modules/ai/ai.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [database_config_1.databaseConfig],
                ...(env_validation_1.envValidation && { validationSchema: env_validation_1.envValidation }),
                envFilePath: [
                    `config/environments/${process.env.NODE_ENV || 'development'}.env`,
                    '.env'
                ]
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5432),
                    username: configService.get('DB_USERNAME', 'postgres'),
                    password: configService.get('DB_PASSWORD', ''),
                    database: configService.get('DB_NAME', 'vanitya'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: configService.get('NODE_ENV') === 'development',
                    logging: configService.get('NODE_ENV') === 'development',
                    ssl: configService.get('DB_SSL') === 'true',
                    extra: {
                        max: configService.get('DB_POOL_MAX', 10),
                        min: configService.get('DB_POOL_MIN', 0),
                        acquire: configService.get('DB_POOL_ACQUIRE', 30000),
                        idle: configService.get('DB_POOL_IDLE', 10000)
                    }
                }),
                inject: [config_1.ConfigService]
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    return [
                        {
                            ttl: Math.floor(configService.get('RATE_LIMIT_WINDOW_MS', 900000) / 1000),
                            limit: configService.get('RATE_LIMIT_MAX_REQUESTS', 100)
                        }
                    ];
                },
                inject: [config_1.ConfigService]
            }),
            schedule_1.ScheduleModule.forRoot(),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            exercise_module_1.ExerciseModule,
            stt_module_1.SttModule,
            recommender_module_1.RecommenderModule,
            admin_module_1.AdminModule,
            ai_module_1.AiModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard
            }
        ]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map