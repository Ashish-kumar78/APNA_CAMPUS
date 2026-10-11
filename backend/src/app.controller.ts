import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Root API Status' })
  @ApiResponse({ status: 200, description: 'API is operational' })
  root() {
    return {
      status: 'ok',
      success: true,
      message: 'Apna Campus (CollegeFlow) NestJS API is operational.',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      api: '/api',
      docs: '/api/docs',
    };
  }

  @Get('api')
  @ApiOperation({ summary: 'API Base Status' })
  @ApiResponse({ status: 200, description: 'API is operational' })
  apiRoot() {
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
  @ApiOperation({ summary: 'Service Health Endpoint' })
  @ApiResponse({ status: 200, description: 'Service health check passed' })
  health() {
    return {
      status: 'ok',
      success: true,
      message: 'Apna Campus (CollegeFlow) NestJS API is healthy.',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('api/health')
  @ApiOperation({ summary: 'API Health Endpoint' })
  @ApiResponse({ status: 200, description: 'API health check passed' })
  apiHealth() {
    return {
      status: 'ok',
      success: true,
      message: 'Apna Campus (CollegeFlow) NestJS API is healthy.',
      timestamp: new Date().toISOString(),
    };
  }
}


