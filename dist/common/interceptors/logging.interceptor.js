"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let LoggingInterceptor = class LoggingInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, query, params } = request;
        const requestId = request.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const userId = request.user?.id || 'anonymous';
        const startTime = Date.now();
        return next.handle().pipe((0, operators_1.tap)({
            next: (data) => {
                const duration = Date.now() - startTime;
                console.log({
                    requestId,
                    method,
                    url,
                    userId,
                    duration: `${duration}ms`,
                    status: 'success',
                    timestamp: new Date().toISOString()
                });
            },
            error: (error) => {
                const duration = Date.now() - startTime;
                console.error({
                    requestId,
                    method,
                    url,
                    userId,
                    duration: `${duration}ms`,
                    status: 'error',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map