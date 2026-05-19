import {
  Entity,
  Column,
  ManyToOne,
  Index
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('api_usage')
@Index(['provider'])
@Index(['createdAt'])
export class ApiUsage extends BaseEntity {
  @Column({ length: 50 })
  provider: string;

  @Column({ nullable: true })
  endpoint: string;

  @Column({ name: 'credits_used', default: 1 })
  creditsUsed: number;

  @Column({ name: 'credits_remaining', nullable: true })
  creditsRemaining: number;

  @Column({ name: 'request_payload', type: 'jsonb', nullable: true })
  requestPayload: Record<string, any>;

  @Column({ name: 'response_status', nullable: true })
  responseStatus: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.apiUsage, { nullable: true })
  user: User;
}

