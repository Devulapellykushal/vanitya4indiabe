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
exports.Exercise = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/entities/base.entity");
const user_progress_entity_1 = require("./user-progress.entity");
const translation_entity_1 = require("./translation.entity");
const transliteration_entity_1 = require("./transliteration.entity");
const tts_entry_entity_1 = require("./tts-entry.entity");
let Exercise = class Exercise extends base_entity_1.BaseEntity {
    markAsProcessed() {
        this.status = 'processed';
    }
    markAsError(error) {
        this.status = 'error';
        this.metadata = {
            ...this.metadata,
            error: error.message,
            errorTimestamp: new Date().toISOString()
        };
    }
    updateMetadata(updates) {
        this.metadata = {
            ...this.metadata,
            ...updates
        };
    }
};
exports.Exercise = Exercise;
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_id', length: 50 }),
    __metadata("design:type", String)
], Exercise.prototype, "unitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_language', length: 10 }),
    __metadata("design:type", String)
], Exercise.prototype, "sourceLanguage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_language', length: 10 }),
    __metadata("design:type", String)
], Exercise.prototype, "targetLanguage", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], Exercise.prototype, "difficulty", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exercise_type', length: 30 }),
    __metadata("design:type", String)
], Exercise.prototype, "exerciseType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_question', type: 'text' }),
    __metadata("design:type", String)
], Exercise.prototype, "originalQuestion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_options', type: 'jsonb' }),
    __metadata("design:type", Array)
], Exercise.prototype, "originalOptions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'correct_answer', type: 'text' }),
    __metadata("design:type", String)
], Exercise.prototype, "correctAnswer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Exercise.prototype, "hint", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Exercise.prototype, "explanation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sarvam_generated_json', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Exercise.prototype, "sarvamGeneratedJson", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'pending', length: 20 }),
    __metadata("design:type", String)
], Exercise.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], Exercise.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_progress_entity_1.UserProgress, (progress) => progress.exercise),
    __metadata("design:type", Array)
], Exercise.prototype, "userProgress", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => translation_entity_1.Translation, (translation) => translation.exercise),
    __metadata("design:type", Array)
], Exercise.prototype, "translations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transliteration_entity_1.Transliteration, (transliteration) => transliteration.exercise),
    __metadata("design:type", Array)
], Exercise.prototype, "transliterations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tts_entry_entity_1.TTSEntry, (ttsEntry) => ttsEntry.exercise),
    __metadata("design:type", Array)
], Exercise.prototype, "ttsEntries", void 0);
exports.Exercise = Exercise = __decorate([
    (0, typeorm_1.Entity)('exercises'),
    (0, typeorm_1.Index)(['unitId']),
    (0, typeorm_1.Index)(['sourceLanguage', 'targetLanguage']),
    (0, typeorm_1.Index)(['difficulty']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['exerciseType'])
], Exercise);
//# sourceMappingURL=exercise.entity.js.map