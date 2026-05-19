import { IsString, IsIn, IsOptional, IsInt, Min, Max, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateExerciseDto {
  @ApiProperty({ example: 'hi', description: 'Source language code' })
  @IsString()
  @Length(2, 10)
  sourceLanguage: string;

  @ApiProperty({ example: 'te', description: 'Target language code' })
  @IsString()
  @Length(2, 10)
  targetLanguage: string;

  @ApiProperty({ example: 'beginner', enum: ['beginner', 'intermediate', 'advanced'] })
  @IsIn(['beginner', 'intermediate', 'advanced'])
  difficulty: string;

  @ApiProperty({ 
    example: 'translation', 
    enum: ['translation', 'transliteration', 'listening', 'speaking', 'matching'] 
  })
  @IsIn(['translation', 'transliteration', 'listening', 'speaking', 'matching'])
  exerciseType: string;

  @ApiProperty({ example: 'unit_1' })
  @IsString()
  unitId: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 50, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  count?: number = 1;
}

