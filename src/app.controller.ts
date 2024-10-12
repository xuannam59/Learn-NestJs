import { Controller, Get, Post, Render, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService, // cách sử dụng env trong controller
    private authService: AuthService
  ) { }

  // @Get()
  // @Render("home") // server side rendering , k được return
  // handleHomePage() {
  //   const message = this.appService.getHello();
  //   console.log(this.configService.get<string>("PORT")); // cách sử dụng env trong controller
  //   return {
  //     message: message
  //   }
  // }
  @UseGuards(LocalAuthGuard)
  @Post("/login")
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  // @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // @UseGuards(JwtAuthGuard)
  @Get('profile1')
  getProfile1(@Request() req) {
    return req.user;
  }
}
