import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import ms from 'ms';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/user.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }
    // username / password la 2 tham số thư viện passport nó ném về
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);
        if (user) {
            const isValid = this.usersService.isValidPassword(pass, user.password);
            if (isValid) {
                return user;
            }
        }
        return null;
    }

    async login(user: IUser, response: Response) {
        const { _id, name, email, role } = user;
        const payload = {
            sub: "token login",
            iss: "from server",
            _id,
            name,
            email,
            role
        };

        const refresh_token = this.createRefreshToken(payload);

        // update user with refresh token
        await this.usersService.updateRefreshToken(refresh_token, _id);

        // 
        response.cookie('refresh_token', refresh_token, {
            httpOnly: true, //chỉ bên server mới đọc được , bền client không lấy ra đc
            maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE"))
        })

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id,
                name,
                email,
                role
            }
        };
    }

    async account(user: IUser) {
        return {
            user
        }
    }

    async register(user: RegisterUserDto) {
        const newUser = await this.usersService.register(user);
        return {
            _id: newUser?._id,
            createAt: newUser?.createdAt
        };
    }

    createRefreshToken = (payload) => {
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            expiresIn: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE")) / 1000
        });
        return refreshToken
    }
}
