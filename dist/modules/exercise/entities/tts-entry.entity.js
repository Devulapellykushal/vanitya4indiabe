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
exports.TTSEntry = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/entities/base.entity");
const exercise_entity_1 = require("./exercise.entity");
let TTSEntry = class TTSEntry extends base_entity_1.BaseEntity {
};
exports.TTSEntry = TTSEntry;
__decorate([
    (0, typeorm_1.Column)({ name: 'exercise_id' }),
    __metadata("design:type", String)
], TTSEntry.prototype, "exerciseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], TTSEntry.prototype, "text", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10 }),
    __metadata("design:type", String)
], TTSEntry.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audio_url', nullable: true }),
    __metadata("design:type", String)
], TTSEntry.prototype, "audioUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_ms', nullable: true }),
    __metadata("design:type", Number)
], TTSEntry.prototype, "durationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], TTSEntry.prototype, "codec", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => exercise_entity_1.Exercise, (exercise) => exercise.ttsEntries),
    __metadata("design:type", exercise_entity_1.Exercise)
], TTSEntry.prototype, "exercise", void 0);
exports.TTSEntry = TTSEntry = __decorate([
    (0, typeorm_1.Entity)('tts_entries')
], TTSEntry);
//# sourceMappingURL=tts-entry.entity.js.map