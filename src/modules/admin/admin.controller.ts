import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
  ParseIntPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('config/update')
  @ApiOperation({ summary: 'Update configuration' })
  @ApiResponse({ status: 200, description: 'Configuration updated successfully' })
  async updateConfig(
    @Body() dto: UpdateConfigDto,
    @CurrentUser() user: any
  ) {
    return this.adminService.updateConfig(dto, user.id);
  }

  @Get('config')
  @ApiOperation({ summary: 'Get current configuration (non-sensitive)' })
  @ApiResponse({ status: 200, description: 'Configuration retrieved' })
  async getConfig() {
    return this.adminService.getConfig();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStats(@Query('timeframe') timeframe?: string) {
    return this.adminService.getStats(timeframe);
  }

  @Get('analytics/api-usage')
  @ApiOperation({ summary: 'Get API usage analytics' })
  @ApiResponse({ status: 200, description: 'API analytics retrieved' })
  async getAPIAnalytics(
    @Query('provider') provider?: string,
    @Query('timeframe') timeframe?: string
  ) {
    return this.adminService.getAPIAnalytics(provider, timeframe);
  }

  @Get('analytics/users')
  @ApiOperation({ summary: 'Get user analytics' })
  @ApiResponse({ status: 200, description: 'User analytics retrieved' })
  async getUserAnalytics() {
    return this.adminService.getUserAnalytics();
  }

  @Get('users')
  @ApiOperation({ summary: 'List users with pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved' })
  async manageUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.adminService.manageUsers(page, limit);
  }

  @Put('users')
  @ApiOperation({ summary: 'Update user status' })
  @ApiResponse({ status: 200, description: 'User status updated' })
  async updateUserStatus(
    @Body() body: { userId: string; isActive: boolean }
  ) {
    return this.adminService.updateUserStatus(body.userId, body.isActive);
  }
}
