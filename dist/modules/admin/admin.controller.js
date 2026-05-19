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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const update_config_dto_1 = require("./dto/update-config.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async updateConfig(dto, user) {
        return this.adminService.updateConfig(dto, user.id);
    }
    async getConfig() {
        return this.adminService.getConfig();
    }
    async getStats(timeframe) {
        return this.adminService.getStats(timeframe);
    }
    async getAPIAnalytics(provider, timeframe) {
        return this.adminService.getAPIAnalytics(provider, timeframe);
    }
    async getUserAnalytics() {
        return this.adminService.getUserAnalytics();
    }
    async manageUsers(page, limit) {
        return this.adminService.manageUsers(page, limit);
    }
    async updateUserStatus(body) {
        return this.adminService.updateUserStatus(body.userId, body.isActive);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('config/update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_config_dto_1.UpdateConfigDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Get)('config'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current configuration (non-sensitive)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved' }),
    __param(0, (0, common_1.Query)('timeframe')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('analytics/api-usage'),
    (0, swagger_1.ApiOperation)({ summary: 'Get API usage analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'API analytics retrieved' }),
    __param(0, (0, common_1.Query)('provider')),
    __param(1, (0, common_1.Query)('timeframe')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAPIAnalytics", null);
__decorate([
    (0, common_1.Get)('analytics/users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User analytics retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserAnalytics", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'List users with pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved' }),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "manageUsers", null);
__decorate([
    (0, common_1.Put)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User status updated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserStatus", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map