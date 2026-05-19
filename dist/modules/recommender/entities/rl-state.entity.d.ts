import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
export declare class RLState extends BaseEntity {
    userId: string;
    modelState: Record<string, any>;
    lastUpdated: Date;
    user: User;
    selectArm(): string | null;
}
