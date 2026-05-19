import { IsEmail, IsString, MinLength, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe', minLength: 2, maxLength: 255 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'hi', description: 'Source language code' })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  currentLanguage?: string;

  @ApiPropertyOptional({ example: 'te', description: 'Target language code' })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  targetLanguage?: string;
}

