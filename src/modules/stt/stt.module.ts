import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SttController } from './stt.controller';
import { SttService } from './stt.service';
import { Exercise } from '../exercise/entities/exercise.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise]), AiModule],
  controllers: [SttController],
  providers: [SttService],
  exports: [SttService]
})
export class SttModule {}

