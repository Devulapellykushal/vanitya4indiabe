import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { ApiUsage } from './entities/api-usage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiUsage])],
  providers: [AiService],
  exports: [AiService]
})
export class AiModule {}

