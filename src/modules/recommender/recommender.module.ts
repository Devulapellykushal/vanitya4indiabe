import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommenderController } from './recommender.controller';
import { RecommenderService } from './recommender.service';
import { RLState } from './entities/rl-state.entity';
import { User } from '../user/entities/user.entity';
import { Exercise } from '../exercise/entities/exercise.entity';
import { UserProgress } from '../exercise/entities/user-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RLState, User, Exercise, UserProgress])
  ],
  controllers: [RecommenderController],
  providers: [RecommenderService],
  exports: [RecommenderService]
})
export class RecommenderModule {}

