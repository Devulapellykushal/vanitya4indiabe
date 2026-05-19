import { IsString, IsOptional, IsUUID, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitAudioDto {
  @ApiProperty({ example: 'hi', description: 'Language code' })
  @IsString()
  @Length(2, 10)
  language: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  exerciseId?: string;
}

