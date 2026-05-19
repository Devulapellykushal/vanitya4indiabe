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
exports.Transliteration = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/entities/base.entity");
const exercise_entity_1 = require("./exercise.entity");
let Transliteration = class Transliteration extends base_entity_1.BaseEntity {
};
exports.Transliteration = Transliteration;
__decorate([
    (0, typeorm_1.Column)({ name: 'exercise_id' }),
    __metadata("design:type", String)
], Transliteration.prototype, "exerciseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_script', length: 20 }),
    __metadata("design:type", String)
], Transliteration.prototype, "sourceScript", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_script', length: 20 }),
    __metadata("design:type", String)
], Transliteration.prototype, "targetScript", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transliterated_question', type: 'text' }),
    __metadata("design:type", String)
], Transliteration.prototype, "transliteratedQuestion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transliterated_options', type: 'jsonb' }),
    __metadata("design:type", Array)
], Transliteration.prototype, "transliteratedOptions", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Transliteration.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Transliteration.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => exercise_entity_1.Exercise, (exercise) => exercise.transliterations),
    __metadata("design:type", exercise_entity_1.Exercise)
], Transliteration.prototype, "exercise", void 0);
exports.Transliteration = Transliteration = __decorate([
    (0, typeorm_1.Entity)('transliterations')
], Transliteration);
//# sourceMappingURL=transliteration.entity.js.map