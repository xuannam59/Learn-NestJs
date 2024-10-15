import { Controller, Get, Post, Render, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';

@Controller("auth")
export class AuthController {
    constructor(
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
    @Public()
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
