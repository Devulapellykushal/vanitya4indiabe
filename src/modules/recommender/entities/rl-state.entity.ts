import {
  Entity,
  Column,
  OneToOne,
  JoinColumn
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('rl_states')
export class RLState extends BaseEntity {
  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ name: 'model_state', type: 'jsonb', default: {} })
  modelState: Record<string, any>;

  @Column({ name: 'last_updated' })
  lastUpdated: Date;

  @OneToOne(() => User, (user) => user.rlState)
  @JoinColumn({ name: 'user_id' })
  user: User;

  selectArm(): string | null {
    // RL algorithm implementation
    // This is a placeholder - implement actual RL logic
    return null;
  }
}

