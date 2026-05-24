import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Post,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private config: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: { user: any }, @Res() res: Response) {
    const user = await this.auth.findOrCreateUser(req.user);
    const token = this.auth.generateToken(user.id, user.email);

    // Redirect to frontend with token
    const frontendUrl = this.config.get<string>('FRONTEND_USER_URL');
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: any) {
    return user;
  }

  @Post('dev-login')
  async devLogin(@Body() body: { email: string }) {
    if (process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Not available in production');
    }

    const user = await this.auth.findOrCreateUser({
      googleId: `dev-${body.email}`,
      email: body.email,
      name: body.email.split('@')[0],
    });

    const token = this.auth.generateToken(user.id, user.email);
    return { token, user };
  }
}
