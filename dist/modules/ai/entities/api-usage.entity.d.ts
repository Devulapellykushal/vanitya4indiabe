import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
export declare class ApiUsage extends BaseEntity {
    provider: string;
    endpoint: string;
    creditsUsed: number;
    creditsRemaining: number;
    requestPayload: Record<string, any>;
    responseStatus: number;
    errorMessage: string;
    userId: string;
    user: User;
}
