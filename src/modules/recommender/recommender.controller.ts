import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { RecommenderService } from './recommender.service';
import { NextExerciseDto } from './dto/next-exercise.dto';
import { FeedbackDto } from './dto/feedback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('recommender')
@Controller('recommender')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecommenderController {
  constructor(private readonly recommenderService: RecommenderService) {}

  @Get('next')
  @ApiOperation({ summary: 'Get next recommended exercise' })
  @ApiResponse({ status: 200, description: 'Exercise recommendation' })
  async getNextExercise(
    @Query() dto: NextExerciseDto,
    @CurrentUser() user: any
  ) {
    return this.recommenderService.getNextExercise(user.id, dto);
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Record exercise outcome for RL learning' })
  @ApiResponse({ status: 200, description: 'Feedback recorded successfully' })
  async recordFeedback(
    @Body() dto: FeedbackDto,
    @CurrentUser() user: any
  ) {
    return this.recommenderService.recordFeedback(user.id, dto);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get user learning analytics' })
  @ApiResponse({ status: 200, description: 'Analytics data' })
  async getAnalytics(@CurrentUser() user: any) {
    return this.recommenderService.getAnalytics(user.id);
  }
}
