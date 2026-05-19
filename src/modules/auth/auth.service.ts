import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { RLState } from '../recommender/entities/rl-state.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RLState)
    private rlStateRepository: Repository<RLState>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, name, password, currentLanguage, targetLanguage } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictException('User already exists with this email');
    }

    // Create user
    const user = this.userRepository.create({
      email,
      name,
      password,
      currentLanguage: currentLanguage || this.configService.get('DEFAULT_SOURCE_LANGUAGE', 'hi'),
      targetLanguage: targetLanguage || this.configService.get('DEFAULT_TARGET_LANGUAGE', 'te')
    });

    const savedUser = await this.userRepository.save(user);

    // Initialize RL state for user
    const rlState = this.rlStateRepository.create({
      userId: savedUser.id,
      modelState: {},
      lastUpdated: new Date()
    });
    await this.rlStateRepository.save(rlState);

    // Generate JWT token
    const token = this.generateToken(savedUser);

    return {
      message: 'User registered successfully',
      user: this.sanitizeUser(savedUser),
      token
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { email, isActive: true }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last activity
    await user.updateActivity();
    await this.userRepository.save(user);

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      message: 'Login successful',
      user: this.sanitizeUser(user),
      token
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email, isActive: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = newPassword;
    await this.userRepository.save(user);

    return {
      message: 'Password reset successfully'
    };
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin || false
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION', '24h')
    });
  }

  private sanitizeUser(user: User): Partial<User> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

