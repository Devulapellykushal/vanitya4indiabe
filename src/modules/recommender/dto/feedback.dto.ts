import { IsUUID, IsString, IsBoolean, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeedbackDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  exerciseId: string;

  @ApiProperty({ example: 'translation' })
  @IsString()
  exerciseType: string;

  @ApiProperty({ example: 'beginner' })
  @IsString()
  difficulty: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  correct: boolean;

  @ApiPropertyOptional({ example: 5000, description: 'Response time in milliseconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  responseTime?: number;
}

