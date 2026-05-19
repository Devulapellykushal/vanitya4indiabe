import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

export interface JwtPayload {
  sub: string;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')
    });
  }

  async validate(payload: JwtPayload) {
    // Transform payload to match controller expectations
    // IMPORTANT: Map 'sub' to 'id' for controllers
    const user = await this.userService.findOne(payload.sub);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: payload.sub,      // ✅ Controllers can access req.user.id
      sub: payload.sub,     // Keep for compatibility
      email: payload.email,
      isAdmin: payload.isAdmin || false
    };
  }
}

