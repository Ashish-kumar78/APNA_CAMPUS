import { Controller, Get, Post, Body, Param, Query, UseGuards, ForbiddenException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Campus CMS & Community')
@Controller('cms')
@UseGuards(JwtAuthGuard)
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('notices')
  @ApiOperation({ summary: 'Get official campus circulars & notices' })
  async getNotices(@Query('search') search?: string, @Query('tag') tag?: string) {
    const data = await this.cmsService.getNotices(search, tag);
    return { success: true, count: data.length, data };
  }

  @Post('notices')
  @ApiOperation({ summary: 'Publish new circular or notice' })
  async createNotice(@CurrentUser() user: any, @Body() body: any) {
    if (!['super_admin', 'admin', 'principal', 'management', 'exam_cell'].includes(normalizeRole(user.role))) {
      throw new ForbiddenException('Your role cannot publish institutional notices.');
    }
    if (![body.title, body.tag, body.summary, body.content].every((value) => typeof value === 'string' && value.trim())) {
      throw new BadRequestException('Notice title, tag, summary, and content are required.');
    }
    const notice = await this.cmsService.createNotice(body, user.name || user.identifier);
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
  @ApiOperation({ summary: 'Create new community blog article' })
  async createBlog(@CurrentUser() user: any, @Body() body: any) {
    if (!['super_admin', 'admin', 'principal', 'management', 'faculty', 'student'].includes(normalizeRole(user.role))) {
      throw new ForbiddenException('Your role cannot publish community articles.');
    }
    if (![body.title, body.tag, body.body].every((value) => typeof value === 'string' && value.trim())) {
      throw new BadRequestException('Article title, tag, and body are required.');
    }
    const post = await this.cmsService.createBlog(body, user.name || user.identifier, user.department || '');
    return { success: true, message: 'Blog published successfully!', data: post };
  }

  @Post('blogs/:id/like')
  @ApiOperation({ summary: 'Toggle like on a blog article' })
  async toggleLikeBlog(@Param('id') _id: string) {
    // BlogPost only stores a global boolean/counter, so it cannot represent
    // per-user likes or make retries safe. Avoid corrupting a shared toggle.
    throw new ServiceUnavailableException('Blog likes are unavailable until persistent per-user like records are configured.');
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Submit course feedback, faculty appraisal, or infrastructure survey' })
  async submitFeedback(@Body() body: any) {
    if (typeof body.formType !== 'string' || !body.formType.trim() || !Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) {
      throw new BadRequestException('Feedback form type and a rating from 1 to 5 are required.');
    }
    const res = await this.cmsService.submitFeedback({
      formType: body.formType.trim(),
      targetId: typeof body.targetId === 'string' ? body.targetId : undefined,
      targetName: typeof body.targetName === 'string' ? body.targetName : undefined,
      rating: body.rating,
      comments: typeof body.comments === 'string' ? body.comments : undefined,
    });
    return { success: true, message: 'Thank you! Your feedback has been recorded anonymously.', data: res };
  }

  @Get('biometric-logs')
  @ApiOperation({ summary: 'Get student turnstile biometric logs' })
  async getBiometricLogs(@CurrentUser() user: any, @Query('direction') direction?: string) {
    const role = normalizeRole(user.role);
    if (direction && !['ALL', 'IN', 'OUT'].includes(direction.toUpperCase())) {
      throw new BadRequestException('Direction must be IN, OUT, or ALL.');
    }
    if (role === 'student') {
      if (!user.student?.id) throw new ForbiddenException('Your account has no linked student profile.');
      const data = await this.cmsService.getBiometricLogs(direction?.toUpperCase(), user.student.id);
      return { success: true, count: data.length, data };
    }
    if (!['super_admin', 'admin', 'principal', 'management', 'warden', 'hostel'].includes(role)) {
      throw new ForbiddenException('Your role cannot view campus biometric logs.');
    }
    const data = await this.cmsService.getBiometricLogs(direction?.toUpperCase());
    return { success: true, count: data.length, data };
  }
}
