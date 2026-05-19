import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SttService } from './stt.service';
import { SubmitAudioDto } from './dto/submit-audio.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('stt')
@Controller('stt')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SttController {
  constructor(private readonly sttService: SttService) {}

  @Post('submit')
  @UseGuards(ThrottlerGuard)
  @UseInterceptors(FileInterceptor('audio'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit audio for speech-to-text' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audio: {
          type: 'string',
          format: 'binary'
        },
        language: {
          type: 'string',
          example: 'hi'
        },
        exerciseId: {
          type: 'string',
          format: 'uuid'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Audio processed successfully' })
  @ApiResponse({ status: 400, description: 'Audio file is required' })
  async submitAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: SubmitAudioDto,
    @CurrentUser() user: any
  ) {
    return this.sttService.processAudio(file, dto.language, dto.exerciseId);
  }

  @Get('languages')
  @ApiOperation({ summary: 'Get supported languages for STT' })
  @ApiResponse({ status: 200, description: 'Supported languages' })
  getSupportedLanguages() {
    return this.sttService.getSupportedLanguages();
  }
}
