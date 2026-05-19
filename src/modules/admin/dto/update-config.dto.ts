import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  DEFAULT_SOURCE_LANG?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  DEFAULT_TARGET_LANG?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  SARVAM_FREE_CREDITS?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  SARVAM_API_URL?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ML_SERVICE_URL?: string;

  // Add other config fields as needed
  [key: string]: any;
}

