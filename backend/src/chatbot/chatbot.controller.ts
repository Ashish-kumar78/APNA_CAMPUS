import { Controller, Post, Body, Req, Headers, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import jwt from 'jsonwebtoken';

@ApiTags('AI Campus Assistant')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('query')
  @ApiOperation({ summary: 'Send question to AI Campus Assistant with live context and RBAC' })
  @ApiResponse({ status: 200, description: 'AI response with live data and guidance' })
  async query(
    @Body()
    body: {
      message: string;
      history?: any[];
      context?: { page?: string; tab?: string; branch?: string; semester?: string };
      user?: any;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    let resolvedUser = body.user || null;

    // Extract user from JWT if token is provided
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const secret = process.env.JWT_SECRET || 'gift-autonomous-bput-super-secret-jwt-key-2026-production';
        const decoded: any = jwt.verify(token, secret);
        if (decoded) {
          resolvedUser = {
            id: decoded.sub || decoded.id,
            identifier: decoded.identifier,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name || body.user?.name,
            department: decoded.department || body.user?.department,
            deptCode: decoded.deptCode || body.user?.deptCode,
          };
        }
      } catch (e) {
        // Fallback to body.user if token expired or demo alias
      }
    }

    const res = await this.chatbotService.processQuery(
      body.message || '',
      body.history || [],
      body.context || {},
      resolvedUser,
    );

    return res;
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get role and page-specific suggested questions' })
  async getSuggestions(
    @Query('role') role?: string,
    @Query('page') page?: string,
  ) {
    return this.chatbotService.getSuggestedPrompts(role, page);
  }
}

