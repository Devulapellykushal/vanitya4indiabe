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
exports.RLState = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/entities/base.entity");
const user_entity_1 = require("../../user/entities/user.entity");
let RLState = class RLState extends base_entity_1.BaseEntity {
    selectArm() {
        return null;
    }
};
exports.RLState = RLState;
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', unique: true }),
    __metadata("design:type", String)
], RLState.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'model_state', type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], RLState.prototype, "modelState", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_updated' }),
    __metadata("design:type", Date)
], RLState.prototype, "lastUpdated", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.rlState),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], RLState.prototype, "user", void 0);
exports.RLState = RLState = __decorate([
    (0, typeorm_1.Entity)('rl_states')
], RLState);
//# sourceMappingURL=rl-state.entity.js.map