import { Controller, Get, Post, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Campus CMS & Community')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('notices')
  @ApiOperation({ summary: 'Get official campus circulars & notices' })
  async getNotices(@Query('search') search?: string, @Query('tag') tag?: string) {
    const data = await this.cmsService.getNotices(search, tag);
    return { success: true, count: data.length, data };
  }

  @Post('notices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish new circular or notice (Admin, Management & Leadership only)' })
  async createNotice(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (!['admin', 'principal', 'management', 'super_admin', 'hod'].includes(role)) {
      throw new ForbiddenException('Access denied. Only College Administration, Principal, Management, or HOD can publish official notices.');
    }
    const notice = await this.cmsService.createNotice({
      ...body,
      author: user.name || body.author || 'Administrative Office',
    });
    return { success: true, message: 'Notice published.', data: notice };
  }

  @Get('holidays')
  @ApiOperation({ summary: 'Get upcoming institutional holidays' })
  async getHolidays() {
    const data = await this.cmsService.getHolidays();
    return { success: true, count: data.length, data };
  }

  @Get('blogs')
  @ApiOperation({ summary: 'Get student and faculty community blog posts' })
  async getBlogs(@Query('tag') tag?: string) {
    const data = await this.cmsService.getBlogs(tag);
    return { success: true, count: data.length, data };
  }

  @Post('blogs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new community blog article' })
  async createBlog(@CurrentUser() user: any, @Body() body: any) {
    const post = await this.cmsService.createBlog({
      ...body,
      author: user.name || body.author,
      authorRole: user.role,
    });
    return { success: true, message: 'Blog published successfully!', data: post };
  }

  @Post('blogs/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like on a blog article' })
  async toggleLikeBlog(@Param('id') id: string) {
    const updated = await this.cmsService.toggleLikeBlog(id);
    return { success: true, data: updated };
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Submit course feedback, faculty appraisal, or infrastructure survey' })
  async submitFeedback(@Body() body: any) {
    const res = await this.cmsService.submitFeedback(body);
    return { success: true, message: 'Thank you! Your feedback has been recorded anonymously.', data: res };
  }

  @Get('biometric-logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student turnstile biometric logs' })
  async getBiometricLogs(@CurrentUser() user: any, @Query('direction') direction?: string) {
    const data = await this.cmsService.getBiometricLogs(direction);
    return { success: true, count: data.length, data };
  }
}
