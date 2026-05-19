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
exports.ApiUsage = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/entities/base.entity");
const user_entity_1 = require("../../user/entities/user.entity");
let ApiUsage = class ApiUsage extends base_entity_1.BaseEntity {
};
exports.ApiUsage = ApiUsage;
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], ApiUsage.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ApiUsage.prototype, "endpoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credits_used', default: 1 }),
    __metadata("design:type", Number)
], ApiUsage.prototype, "creditsUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credits_remaining', nullable: true }),
    __metadata("design:type", Number)
], ApiUsage.prototype, "creditsRemaining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'request_payload', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ApiUsage.prototype, "requestPayload", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'response_status', nullable: true }),
    __metadata("design:type", Number)
], ApiUsage.prototype, "responseStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ApiUsage.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true }),
    __metadata("design:type", String)
], ApiUsage.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.apiUsage, { nullable: true }),
    __metadata("design:type", user_entity_1.User)
], ApiUsage.prototype, "user", void 0);
exports.ApiUsage = ApiUsage = __decorate([
    (0, typeorm_1.Entity)('api_usage'),
    (0, typeorm_1.Index)(['provider']),
    (0, typeorm_1.Index)(['createdAt'])
], ApiUsage);
//# sourceMappingURL=api-usage.entity.js.map