"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const compression = require("compression");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3000);
    const environment = configService.get('NODE_ENV', 'development');
    const httpAdapter = app.getHttpAdapter();
    if (httpAdapter && httpAdapter.getInstance) {
        const expressApp = httpAdapter.getInstance();
        if (expressApp && typeof expressApp.set === 'function') {
            expressApp.set('trust proxy', true);
        }
    }
    const helmetOptions = {
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
        helmetOptions.hsts = {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        };
    }
    else {
        helmetOptions.hsts = false;
        helmetOptions.crossOriginOpenerPolicy = false;
        helmetOptions.crossOriginEmbedderPolicy = false;
    }
    app.use((0, helmet_1.default)(helmetOptions));
    app.use(compression());
    const corsOrigin = configService.get('CORS_ORIGIN', '*');
    app.enableCors({
        origin: corsOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID']
    });
    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: '1'
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true
        }
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter(configService));
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor(), new logging_interceptor_1.LoggingInterceptor());
    if (environment !== 'production') {
        const swaggerHost = 'localhost';
        const config = new swagger_1.DocumentBuilder()
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
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
    await app.listen(port);
    const host = configService.get('HOST', '0.0.0.0');
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
//# sourceMappingURL=main.js.map