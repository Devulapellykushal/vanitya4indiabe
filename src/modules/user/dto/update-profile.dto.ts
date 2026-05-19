import { IsOptional, IsString, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  @Length(2, 255)
  name?: string;

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

  @ApiPropertyOptional({ 
    example: 'beginner', 
    enum: ['beginner', 'intermediate', 'advanced'] 
  })
  @IsOptional()
  @IsString()
  level?: string;
}

