import { Controller, Post, Get, Body, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/auth.decorator';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Returns JWT token pair and user profile' })
  async login(
    @Body() dto: LoginDto,
    @Request() req: ExpressRequest,
  ) {
    return this.authService.login(dto, req.ip ?? undefined);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async me(@CurrentUser() user: AuthUser) {
    return this.authService.getProfile(user.id);
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and invalidate session' })
  async logout() {
    // In production: invalidate the session in Redis
    return { message: 'Logged out successfully' };
  }
}
