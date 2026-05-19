import { IsOptional, IsString, IsArray, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class NextExerciseDto {
  @ApiPropertyOptional({ example: 'hi', description: 'Source language code' })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  sourceLanguage?: string;

  @ApiPropertyOptional({ example: 'te', description: 'Target language code' })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  targetLanguage?: string;

  @ApiPropertyOptional({ 
    example: ['listening', 'speaking'], 
    description: 'Exercise types to exclude' 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeTypes?: string[] = [];
}

