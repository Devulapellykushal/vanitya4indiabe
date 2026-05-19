import { User } from '../../user/entities/user.entity';
export declare class AuthResponseDto {
    message: string;
    user: Partial<User>;
    token: string;
}
