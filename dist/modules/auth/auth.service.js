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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../user/entities/user.entity");
const rl_state_entity_1 = require("../recommender/entities/rl-state.entity");
let AuthService = class AuthService {
    constructor(userRepository, rlStateRepository, jwtService, configService) {
        this.userRepository = userRepository;
        this.rlStateRepository = rlStateRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(registerDto) {
        const { email, name, password, currentLanguage, targetLanguage } = registerDto;
        const existingUser = await this.userRepository.findOne({
            where: { email }
        });
        if (existingUser) {
            throw new common_1.ConflictException('User already exists with this email');
        }
        const user = this.userRepository.create({
            email,
            name,
            password,
            currentLanguage: currentLanguage || this.configService.get('DEFAULT_SOURCE_LANGUAGE', 'hi'),
            targetLanguage: targetLanguage || this.configService.get('DEFAULT_TARGET_LANGUAGE', 'te')
        });
        const savedUser = await this.userRepository.save(user);
        const rlState = this.rlStateRepository.create({
            userId: savedUser.id,
            modelState: {},
            lastUpdated: new Date()
        });
        await this.rlStateRepository.save(rlState);
        const token = this.generateToken(savedUser);
        return {
            message: 'User registered successfully',
            user: this.sanitizeUser(savedUser),
            token
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({
            where: { email, isActive: true }
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        await user.updateActivity();
        await this.userRepository.save(user);
        const token = this.generateToken(user);
        return {
            message: 'Login successful',
            user: this.sanitizeUser(user),
            token
        };
    }
    async resetPassword(resetPasswordDto) {
        const { email, newPassword } = resetPasswordDto;
        const user = await this.userRepository.findOne({
            where: { email, isActive: true }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.password = newPassword;
        await this.userRepository.save(user);
        return {
            message: 'Password reset successfully'
        };
    }
    generateToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            isAdmin: user.isAdmin || false
        };
        return this.jwtService.sign(payload, {
            expiresIn: this.configService.get('JWT_EXPIRATION', '24h')
        });
    }
    sanitizeUser(user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(rl_state_entity_1.RLState)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map