import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import ms from 'ms';
import { RolesService } from 'src/roles/roles.service';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/user.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private rolesService: RolesService
    ) { }
    // username / password la 2 tham số thư viện passport nó ném về
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);
        if (user) {
            const isValid = this.usersService.isValidPassword(pass, user.password);
            if (isValid) {
                const userRole = user.role as unknown as { _id: string, name: string }
                const temp = await this.rolesService.findOne(userRole._id);

                const objectUser = {
                    ...user.toObject(), // convert type Document of MongoDB to type Object
                    permissions: temp?.permissions ?? []
                }
                return objectUser;
            }
        }
        return null;
    }

    // Login
    async login(user: IUser, response: Response) {
        const { _id, name, email, role, permissions } = user;
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
                role,
                permissions: permissions
            }
        };
    }

    // Logout
    async logout(user: IUser, response: Response) {
        await this.usersService.updateRefreshToken("", user._id);
        response.clearCookie("refresh_token");
        return "OK";
    }

    // Account
    async account(user: IUser) {
        // fetch user's role
        const userRole = user.role as unknown as { _id: string, name: string }
        const temp = await this.rolesService.findOne(userRole._id);
        return {
            user,
            permissions: temp?.permissions ?? []
        }
    }

    // register 
    async register(RegisterUserDto: RegisterUserDto) {
        const newUser = await this.usersService.register(RegisterUserDto);
        return {
            _id: newUser?._id,
            createAt: newUser?.createdAt
        };
    }

    // create refresh token
    createRefreshToken = (payload) => {
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            expiresIn: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE")) / 1000
        });
        return refreshToken
    }

    // process refresh token
    processNewToken = async (refreshToken: string, response: Response) => {
        try {
            this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET")
            })
            // todo
            const user = await this.usersService.findUserByToken(refreshToken);
            if (user) {
                const { _id, name, email, role } = user;
                const payload = {
                    sub: "token refresh",
                    iss: "from server",
                    _id,
                    name,
                    email,
                    role
                }

                const refresh_token = this.createRefreshToken(payload);

                // fetch user's role
                const userRole = user.role as unknown as { _id: string, name: string }
                const temp = await this.rolesService.findOne(userRole._id);
                // update refreshToken in database
                this.usersService.updateRefreshToken(refresh_token, _id.toString());
                // delete refresh_token cookie current
                response.clearCookie("refresh_token");
                // set refresh_token cookie again
                response.cookie("refresh_token", refresh_token, {
                    httpOnly: true,
                    maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE"))
                });

                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        _id,
                        name,
                        email,
                        role,
                        permissions: temp?.permissions ?? []
                    }
                }
            } else {
                throw new BadRequestException("Refresh Token không hợp lệ. Vui lòng login lại");
            }
        } catch (error) {
            throw new BadRequestException("Refresh Token không hợp lệ. Vui lòng login lại");
        }
    }
}
