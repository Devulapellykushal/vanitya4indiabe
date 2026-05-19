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
exports.UserProgress = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/entities/base.entity");
const user_entity_1 = require("../../user/entities/user.entity");
const exercise_entity_1 = require("./exercise.entity");
let UserProgress = class UserProgress extends base_entity_1.BaseEntity {
};
exports.UserProgress = UserProgress;
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], UserProgress.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exercise_id' }),
    __metadata("design:type", String)
], UserProgress.prototype, "exerciseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], UserProgress.prototype, "attempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserProgress.prototype, "correct", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_answer', type: 'text', nullable: true }),
    __metadata("design:type", String)
], UserProgress.prototype, "lastAnswer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'response_time_ms', nullable: true }),
    __metadata("design:type", Number)
], UserProgress.prototype, "responseTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'needs_retry', default: false }),
    __metadata("design:type", Boolean)
], UserProgress.prototype, "needsRetry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hint_used', default: false }),
    __metadata("design:type", Boolean)
], UserProgress.prototype, "hintUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audio_played', default: false }),
    __metadata("design:type", Boolean)
], UserProgress.prototype, "audioPlayed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_voice', default: false }),
    __metadata("design:type", Boolean)
], UserProgress.prototype, "isVoice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], UserProgress.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.progress),
    __metadata("design:type", user_entity_1.User)
], UserProgress.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => exercise_entity_1.Exercise, (exercise) => exercise.userProgress),
    __metadata("design:type", exercise_entity_1.Exercise)
], UserProgress.prototype, "exercise", void 0);
exports.UserProgress = UserProgress = __decorate([
    (0, typeorm_1.Entity)('user_progress'),
    (0, typeorm_1.Unique)(['userId', 'exerciseId']),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['exerciseId'])
], UserProgress);
//# sourceMappingURL=user-progress.entity.js.map