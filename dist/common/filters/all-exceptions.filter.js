"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AllExceptionsFilter = class AllExceptionsFilter {
    constructor(configService) {
        this.configService = configService;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const requestId = request.id || 'unknown';
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let code = 'INTERNAL_SERVER_ERROR';
        let details = null;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object') {
                message = exceptionResponse.message || exception.message;
                code = exceptionResponse.code || exception.name;
                details = exceptionResponse.details;
            }
            else {
                message = exceptionResponse;
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
            code = exception.name;
            if (exception.code) {
                const dbError = this.handleDatabaseError(exception);
                status = dbError.status;
                message = dbError.message;
                code = dbError.code;
            }
        }
        const isDevelopment = this.configService.get('NODE_ENV') === 'development';
        const errorResponse = {
            success: false,
            error: {
                message,
                code,
                requestId,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
                ...(details && { details }),
                ...(isDevelopment && exception instanceof Error && { stack: exception.stack })
            }
        };
        console.error(`Error in ${request.method} ${request.url}:`, {
            requestId,
            error: message,
            stack: isDevelopment && exception instanceof Error ? exception.stack : undefined,
            userId: request.user?.id,
            timestamp: new Date().toISOString()
        });
        response.status(status).json(errorResponse);
    }
    handleDatabaseError(error) {
        const code = error.code || error.original?.code;
        switch (code) {
            case '23505':
                return {
                    status: common_1.HttpStatus.CONFLICT,
                    code: 'DUPLICATE_ENTRY',
                    message: 'Resource already exists'
                };
            case '23503':
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    code: 'FOREIGN_KEY_VIOLATION',
                    message: 'Referenced resource does not exist'
                };
            case '23502':
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    code: 'MISSING_REQUIRED_FIELD',
                    message: 'Required field is missing'
                };
            default:
                return {
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    code: 'DATABASE_ERROR',
                    message: this.configService.get('NODE_ENV') === 'production'
                        ? 'Database operation failed'
                        : error.message
                };
        }
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map