import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API Root & Health Check' })
  @ApiResponse({ status: 200, description: 'API is operational' })
  health() {
    return {
      status: 'ok',
      success: true,
      message: 'Apna Campus (CollegeFlow) NestJS API is operational.',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      docs: '/api/docs',
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Explicit Service Health Endpoint' })
  @ApiResponse({ status: 200, description: 'Service health check passed' })
  healthCheck() {
    return {
      status: 'ok',
      success: true,
      message: 'Apna Campus (CollegeFlow) NestJS API is healthy.',
      timestamp: new Date().toISOString(),
    };
  }
}

