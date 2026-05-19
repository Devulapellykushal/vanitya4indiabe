import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateAudioDto {
  @ApiProperty({ example: 'नमस्ते', description: 'Text to convert to speech' })
  @IsString()
  text: string;

  @ApiProperty({ example: 'hi', description: 'Language code' })
  @IsString()
  @Length(2, 10)
  language: string;
}

