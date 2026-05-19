import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Exercise } from '../exercise/entities/exercise.entity';
import { ApiUsage } from '../ai/entities/api-usage.entity';
import { UpdateConfigDto } from './dto/update-config.dto';

@Injectable()
export class AdminService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(ApiUsage)
    private apiUsageRepository: Repository<ApiUsage>
  ) {}

  async updateConfig(dto: UpdateConfigDto, userId: string) {
    // Update configuration (in a real app, this would persist to database)
    // For now, we'll just log it

    // Record the configuration update
    const apiUsage = this.apiUsageRepository.create({
      provider: 'admin',
      endpoint: '/admin/config/update',
      creditsUsed: 0,
      responseStatus: 200,
      requestPayload: { updatedKeys: Object.keys(dto) },
      userId
    });
    await this.apiUsageRepository.save(apiUsage);

    return {
      message: 'Configuration updated successfully',
      updatedFields: Object.keys(dto)
    };
  }

  async getConfig() {
    const safeConfig = {
      DEFAULT_SOURCE_LANG: this.configService.get('DEFAULT_SOURCE_LANGUAGE'),
      DEFAULT_TARGET_LANG: this.configService.get('DEFAULT_TARGET_LANGUAGE'),
      SARVAM_FREE_CREDITS: this.configService.get('SARVAM_FREE_CREDITS'),
      SARVAM_API_URL: this.configService.get('SARVAM_API_URL'),
      ML_SERVICE_URL: this.configService.get('ML_SERVICE_URL'),
      NODE_ENV: this.configService.get('NODE_ENV'),
      // Don't expose sensitive keys
      SARVAM_API_KEY: this.configService.get('SARVAM_API_KEY') ? '***' : null,
      AI4BHARAT_API_KEY: this.configService.get('AI4BHARAT_API_KEY') ? '***' : null
    };

    return { config: safeConfig };
  }

  async getStats(timeframe: string = '24h') {
    const hours = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Get user statistics
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: {
        isActive: true,
        lastActivity: MoreThanOrEqual(since)
      }
    });

    // Get exercise statistics
    const totalExercises = await this.exerciseRepository.count();
    const processedExercises = await this.exerciseRepository.count({
      where: { status: 'processed' }
    });
    const pendingExercises = await this.exerciseRepository.count({
      where: { status: 'pending' }
    });

    // Get API usage statistics
    const apiStats = await Promise.all([
      this.getUsageStats('sarvam', since),
      this.getUsageStats('ai4bharat', since),
      this.getUsageStats('ml-service', since)
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        activePercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : '0'
      },
      exercises: {
        total: totalExercises,
        processed: processedExercises,
        pending: pendingExercises,
        processedPercentage: totalExercises > 0
          ? ((processedExercises / totalExercises) * 100).toFixed(2)
          : '0'
      },
      apiUsage: {
        sarvam: apiStats[0],
        ai4bharat: apiStats[1],
        mlService: apiStats[2]
      },
      timeframe
    };
  }

  async getAPIAnalytics(provider?: string, timeframe: string = '24h') {
    const hours = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    if (provider) {
      const stats = await this.getUsageStats(provider, since);
      return { provider, stats, timeframe };
    } else {
      const providers = ['sarvam', 'ai4bharat', 'ml-service'];
      const allStats = {};

      for (const prov of providers) {
        allStats[prov] = await this.getUsageStats(prov, since);
      }

      return { stats: allStats, timeframe };
    }
  }

  async getUserAnalytics() {
    // User registration trends (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUsers = await this.userRepository.find({
      where: {
        createdAt: MoreThanOrEqual(thirtyDaysAgo)
      },
      select: ['id', 'createdAt', 'currentLanguage', 'targetLanguage', 'level']
    });

    // Group by date
    const registrationTrends = recentUsers.reduce((acc, user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Language preferences
    const languageStats = recentUsers.reduce((acc, user) => {
      const key = `${user.currentLanguage}_${user.targetLanguage}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // User levels
    const levelStats = recentUsers.reduce((acc, user) => {
      acc[user.level] = (acc[user.level] || 0) + 1;
      return acc;
    }, {});

    return {
      registrationTrends: Object.entries(registrationTrends).map(([date, count]) => ({
        date,
        count
      })),
      languagePreferences: Object.entries(languageStats).map(([key, count]) => {
        const [current, target] = key.split('_');
        return { currentLanguage: current, targetLanguage: target, count };
      }),
      levelDistribution: Object.entries(levelStats).map(([level, count]) => ({
        level,
        count
      }))
    };
  }

  async manageUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      select: [
        'id',
        'email',
        'name',
        'provider',
        'level',
        'hearts',
        'streak',
        'isActive',
        'lastActivity',
        'createdAt'
      ],
      order: { createdAt: 'DESC' },
      skip,
      take: limit
    });

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = isActive;
    await this.userRepository.save(user);

    return {
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user.id,
        email: user.email,
        isActive: user.isActive
      }
    };
  }

  private async getUsageStats(provider: string, since: Date) {
    const total = await this.apiUsageRepository.count({
      where: { provider, createdAt: MoreThanOrEqual(since) }
    });

    const successful = await this.apiUsageRepository.count({
      where: {
        provider,
        createdAt: MoreThanOrEqual(since),
        responseStatus: 200
      }
    });

    const totalCredits = await this.apiUsageRepository
      .createQueryBuilder('usage')
      .select('SUM(usage.creditsUsed)', 'total')
      .where('usage.provider = :provider', { provider })
      .andWhere('usage.createdAt >= :since', { since })
      .getRawOne();

    return {
      total,
      successful,
      failed: total - successful,
      totalCredits: parseInt(totalCredits?.total || '0', 10),
      successRate: total > 0 ? ((successful / total) * 100).toFixed(2) : '0'
    };
  }
}
