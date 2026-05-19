import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  OneToOne
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ApiUsage } from '../../ai/entities/api-usage.entity';
import { UserProgress } from '../../exercise/entities/user-progress.entity';
import { RLState } from '../../recommender/entities/rl-state.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @Column({ default: 'email' })
  provider: string;

  @Column({ name: 'provider_id', nullable: true })
  providerId: string;

  @Column({ type: 'jsonb', default: {} })
  prefs: Record<string, any>;

  @Column({ name: 'current_language', default: 'hi', length: 10 })
  currentLanguage: string;

  @Column({ name: 'target_language', default: 'te', length: 10 })
  targetLanguage: string;

  @Column({ default: 'beginner', length: 20 })
  level: string;

  @Column({ default: 5 })
  hearts: number;

  @Column({ name: 'max_hearts', default: 5 })
  maxHearts: number;

  @Column({ default: 0 })
  streak: number;

  @Column({ name: 'last_activity', nullable: true })
  lastActivity: Date;

  @Column({ name: 'is_admin', default: false })
  isAdmin: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => UserProgress, (progress) => progress.user)
  progress: UserProgress[];

  @OneToMany(() => ApiUsage, (usage) => usage.user)
  apiUsage: ApiUsage[];

  @OneToOne(() => RLState, (rlState) => rlState.user)
  rlState: RLState;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && this.password.length < 60) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
  }

  async updateActivity() {
    this.lastActivity = new Date();
  }

  async useHeart(): Promise<boolean> {
    if (this.hearts > 0) {
      this.hearts -= 1;
      return true;
    }
    return false;
  }

  async addHeart(): Promise<boolean> {
    if (this.hearts < this.maxHearts) {
      this.hearts += 1;
      return true;
    }
    return false;
  }
}

