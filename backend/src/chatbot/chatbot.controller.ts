
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('AI Campus Assistant')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('query')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Send question to AI Campus Assistant with live context and RBAC',
  })
  @ApiResponse({
    status: 200,
    description: 'AI response with live data and guidance',
  })
  async query(
    @Body()
    body: {
      message: string;
      history?: any[];
      context?: {
        page?: string;
        tab?: string;
        branch?: string;
        semester?: string;
      };
    },
    @CurrentUser() user: any,
  ) {
    if (!user) {
      throw new UnauthorizedException('Authentication is required.');
    }

    return this.chatbotService.processQuery(
      body.message || '',
      body.history || [],
      body.context || {},
      user,
    );
  }

  @Get('suggestions')
  @ApiOperation({
    summary: 'Get role and page-specific suggested questions',
  })
  async getSuggestions(
    @Query('role') role?: string,
    @Query('page') page?: string,
  ) {
    return this.chatbotService.getSuggestedPrompts(role, page);
  }
}
