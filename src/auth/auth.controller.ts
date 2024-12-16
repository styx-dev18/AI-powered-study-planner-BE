import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Request,
    Res,
    UseGuards
  } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { AuthGuard as AuthGuardPassport } from '@nestjs/passport';

import { config } from 'dotenv';
config();

@Controller('')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(AuthGuardPassport('google'))
  @Get('google')
  async googleLogin(@Req() req) {}

  @Get('google/redirect')
  @UseGuards(AuthGuardPassport('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const response = await this.authService.googleLogin(req)
    res.redirect(`${process.env.CORS_ORIGIN}/login?username=${response.username}&email=${response.email}&token=${response.access_token}`)
  }
}