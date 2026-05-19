import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
export interface JwtPayload {
    sub: string;
    email: string;
    isAdmin: boolean;
    iat?: number;
    exp?: number;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private userService;
    constructor(configService: ConfigService, userService: UserService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        sub: string;
        email: string;
        isAdmin: boolean;
    }>;
}
export {};
