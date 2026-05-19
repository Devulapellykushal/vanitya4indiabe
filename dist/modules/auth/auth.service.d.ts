import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { RLState } from '../recommender/entities/rl-state.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthService {
    private userRepository;
    private rlStateRepository;
    private jwtService;
    private configService;
    constructor(userRepository: Repository<User>, rlStateRepository: Repository<RLState>, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: Partial<User>;
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        user: Partial<User>;
        token: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    private generateToken;
    private sanitizeUser;
}
