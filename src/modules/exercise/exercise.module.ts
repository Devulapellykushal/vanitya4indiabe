import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';
import { Exercise } from './entities/exercise.entity';
import { UserProgress } from './entities/user-progress.entity';
import { User } from '../user/entities/user.entity';
import { TTSEntry } from './entities/tts-entry.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exercise, UserProgress, User, TTSEntry]),
    AiModule
  ],
  controllers: [ExerciseController],
  providers: [ExerciseService],
  exports: [ExerciseService]
})
export class ExerciseModule {}

