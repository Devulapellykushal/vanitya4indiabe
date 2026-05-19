import { IsUUID, IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitExerciseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  exerciseId: string;

  @ApiProperty({ example: 'Hello' })
  @IsString()
  answer: string;

  @ApiPropertyOptional({ example: 5000, description: 'Response time in milliseconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  responseTime?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hintUsed?: boolean = false;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  audioPlayed?: boolean = false;
}

