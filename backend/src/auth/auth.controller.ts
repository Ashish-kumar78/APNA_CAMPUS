import { Controller, Post, Body, Get, Patch, Req, Query, UseGuards, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and receive JWT access token' })
  @ApiResponse({ status: 200, description: 'Login successful with token and profile' })
  @ApiResponse({ status: 401, description: 'Invalid login credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile returned' })
  
  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get theme and language preferences for the authenticated user' })
  async getPreferences(@CurrentUser() user: any, @Req() req: any) {
    const userId = req?.headers?.['x-user-id'] || user?.id || user?.identifier || user?.email || user?.role || 'default_user';
    const preferences = await this.authService.getUserPreferences(userId);
    return {
      success: true,
      userId,
      preferences,
    };
  }

  @Patch('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update theme and language preferences for the authenticated user' })
  async updatePreferences(
    @CurrentUser() user: any,
    @Req() req: any,
    @Body() body: { theme?: string; language?: string },
  ) {
    const userId = req?.headers?.['x-user-id'] || user?.id || user?.identifier || user?.email || user?.role || 'default_user';
    const preferences = await this.authService.updateUserPreferences(userId, body);
    return {
      success: true,
      userId,
      preferences,
    };
  }

  async getProfile(@CurrentUser() user: any) {
    return {
      success: true,
      user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidate current session' })
  async logout() {
    return {
      success: true,
      message: 'Logged out successfully.',
    };
  }

  @Get('verify-activation-token')
  @ApiOperation({ summary: 'Validate a student account activation token' })
  @ApiQuery({ name: 'token', required: true, description: 'Student account activation token' })
  @ApiResponse({ status: 200, description: 'Token is valid, returns student profile' })
  @ApiResponse({ status: 400, description: 'Invalid or expired activation link' })
  async verifyActivationToken(@Query('token') token: string) {
    return this.authService.checkActivationToken(token);
  }

  @Post('activate-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate student account and set password using activation token' })
  @ApiResponse({ status: 200, description: 'Account activated successfully with auth token' })
  @ApiResponse({ status: 400, description: 'Invalid token or password requirements not met' })
  async activateAccount(@Body() body: ActivateAccountDto) {
    if (!body || !body.token || !body.newPassword) {
      throw new BadRequestException('Activation token and newPassword are required.');
    }
    return this.authService.activateAccount(body.token, body.newPassword);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset token' })
  @ApiResponse({ status: 200, description: 'Reset token dispatched or simulated' })
  @ApiResponse({ status: 400, description: 'Identifier missing or invalid' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    if (!body || !body.identifier) {
      throw new BadRequestException('Identifier is required.');
    }
    return this.authService.forgotPassword(body.identifier);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with security token' })
  @ApiResponse({ status: 200, description: 'Password reset completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid reset token or password' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    if (!body || !body.resetToken || !body.newPassword) {
      throw new BadRequestException('Reset token and newPassword are required.');
    }
    return this.authService.resetPassword(body.resetToken, body.newPassword);
  }
}
