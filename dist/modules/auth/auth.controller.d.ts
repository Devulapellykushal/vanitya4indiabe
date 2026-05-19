import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: Partial<import("../user/entities/user.entity").User>;
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        user: Partial<import("../user/entities/user.entity").User>;
        token: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getProfile(user: any): Promise<{
        user: {
            id: any;
            email: any;
            isAdmin: any;
        };
    }>;
}
