import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ExerciseService } from './exercise.service';
import { FetchExercisesDto } from './dto/fetch-exercises.dto';
import { SubmitExerciseDto } from './dto/submit-exercise.dto';
import { GenerateExerciseDto } from './dto/generate-exercise.dto';
import { GenerateAudioDto } from './dto/generate-audio.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('exercises')
@Controller('exercises')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Get('fetch')
  @ApiOperation({ summary: 'Fetch exercises for user' })
  @ApiResponse({ status: 200, description: 'Exercises fetched successfully' })
  async fetchExercises(
    @Query() dto: FetchExercisesDto,
    @CurrentUser() user: any
  ) {
    return this.exerciseService.fetchExercises(user.id, dto);
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit exercise answer' })
  @ApiResponse({ status: 200, description: 'Answer submitted successfully' })
  @ApiResponse({ status: 400, description: 'No hearts remaining' })
  async submitExercise(
    @Body() dto: SubmitExerciseDto,
    @CurrentUser() user: any
  ) {
    return this.exerciseService.submitExercise(user.id, dto);
  }

  @Post('generate')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate new exercises' })
  @ApiResponse({ status: 201, description: 'Exercises generated successfully' })
  async generateExercises(
    @Body() dto: GenerateExerciseDto,
    @CurrentUser() user: any
  ) {
    return this.exerciseService.generateExercises(user.id, dto);
  }

  @Post(':id/audio')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate audio for exercise' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Audio generated successfully' })
  async generateAudio(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GenerateAudioDto,
    @CurrentUser() user: any
  ) {
    return this.exerciseService.generateAudio(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exercise by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Exercise retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  async getExercise(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any
  ) {
    return this.exerciseService.getExercise(id, user.id);
  }
}
