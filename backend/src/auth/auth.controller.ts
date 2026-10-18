import { Controller, Post, Body, Get, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
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
  async verifyActivationToken(@Query('token') token: string) {
    return this.authService.checkActivationToken(token);
  }

  @Post('activate-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate student account and set password using activation token' })
  async activateAccount(@Body() body: { token: string; newPassword: string }) {
    return this.authService.activateAccount(body.token, body.newPassword);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset token' })
  async forgotPassword(@Body() body: { identifier: string }) {
    return this.authService.forgotPassword(body.identifier);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with security token' })
  async resetPassword(@Body() body: { resetToken: string; newPassword: string }) {
    return this.authService.resetPassword(body.resetToken, body.newPassword);
  }
}
