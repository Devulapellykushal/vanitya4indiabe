"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommenderModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const recommender_controller_1 = require("./recommender.controller");
const recommender_service_1 = require("./recommender.service");
const rl_state_entity_1 = require("./entities/rl-state.entity");
const user_entity_1 = require("../user/entities/user.entity");
const exercise_entity_1 = require("../exercise/entities/exercise.entity");
const user_progress_entity_1 = require("../exercise/entities/user-progress.entity");
let RecommenderModule = class RecommenderModule {
};
exports.RecommenderModule = RecommenderModule;
exports.RecommenderModule = RecommenderModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([rl_state_entity_1.RLState, user_entity_1.User, exercise_entity_1.Exercise, user_progress_entity_1.UserProgress])
        ],
        controllers: [recommender_controller_1.RecommenderController],
        providers: [recommender_service_1.RecommenderService],
        exports: [recommender_service_1.RecommenderService]
    })
], RecommenderModule);
//# sourceMappingURL=recommender.module.js.map