import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/users/user.interface';

@Controller("auth")
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    // [POST] auth/login
    @Public()
    @UseGuards(LocalAuthGuard)
    @Post("/login")
    handleLogin(
        @Req() req,
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.login(req.user, response);
    }

    // [POST] auth/account
    @Get("/account")
    @ResponseMessage("Get user information")
    handleGetAccount(
        @User() user: IUser
    ) {
        return this.authService.account(user);
    }

    // [POST] auth/register
    @Public() // Không cần chuyển JSW token
    @ResponseMessage("Register a new user")
    @Post("/register")
    handleRegister(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
    }

    // [GET] auth/refresh
    @Public()
    @ResponseMessage("Get user by refresh token")
    @Get("/refresh")
    handleRefreshToken(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ) {
        const refreshToken = request.cookies["refresh_token"];
        return this.authService.processNewToken(refreshToken, response)
    }

    // [POST] auth/logout
    @ResponseMessage("Logout User")
    @Post("/logout")
    handleLogout(
        @User() user: IUser,
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.logout(user, response);
    }
}
