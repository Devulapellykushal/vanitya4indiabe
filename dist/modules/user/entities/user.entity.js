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
exports.User = void 0;
const bcrypt = require("bcryptjs");
const class_transformer_1 = require("class-transformer");
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/entities/base.entity");
const api_usage_entity_1 = require("../../ai/entities/api-usage.entity");
const user_progress_entity_1 = require("../../exercise/entities/user-progress.entity");
const rl_state_entity_1 = require("../../recommender/entities/rl-state.entity");
let User = class User extends base_entity_1.BaseEntity {
    async hashPassword() {
        if (this.password && this.password.length < 60) {
            this.password = await bcrypt.hash(this.password, 12);
        }
    }
    async comparePassword(password) {
        if (!this.password)
            return false;
        return await bcrypt.compare(password, this.password);
    }
    async updateActivity() {
        this.lastActivity = new Date();
    }
    async useHeart() {
        if (this.hearts > 0) {
            this.hearts -= 1;
            return true;
        }
        return false;
    }
    async addHeart() {
        if (this.hearts < this.maxHearts) {
            this.hearts += 1;
            return true;
        }
        return false;
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'email' }),
    __metadata("design:type", String)
], User.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'provider_id', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "providerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], User.prototype, "prefs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_language', default: 'hi', length: 10 }),
    __metadata("design:type", String)
], User.prototype, "currentLanguage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_language', default: 'te', length: 10 }),
    __metadata("design:type", String)
], User.prototype, "targetLanguage", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'beginner', length: 20 }),
    __metadata("design:type", String)
], User.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 5 }),
    __metadata("design:type", Number)
], User.prototype, "hearts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_hearts', default: 5 }),
    __metadata("design:type", Number)
], User.prototype, "maxHearts", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "streak", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_activity', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lastActivity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_admin', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isAdmin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_progress_entity_1.UserProgress, (progress) => progress.user),
    __metadata("design:type", Array)
], User.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => api_usage_entity_1.ApiUsage, (usage) => usage.user),
    __metadata("design:type", Array)
], User.prototype, "apiUsage", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => rl_state_entity_1.RLState, (rlState) => rlState.user),
    __metadata("design:type", rl_state_entity_1.RLState)
], User.prototype, "rlState", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], User.prototype, "hashPassword", null);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map