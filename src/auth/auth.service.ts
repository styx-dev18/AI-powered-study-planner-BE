import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService
    ) { }

    async signIn(
        email: string,
        pass: string,
    ): Promise<{ userId: string, access_token: string, username: string, email: string }> {
        if (email == '') {
            throw new UnauthorizedException('Email is required.');
        }
        if (pass == '') {
            throw new UnauthorizedException('Password is required.');
        }
        const user = await this.usersService.findOne(email);
        if (!user) {
            throw new UnauthorizedException('Email does not exist.');
        } else if (!(await bcrypt.compare(pass, user.password))) {
            throw new UnauthorizedException('Password is not correct.');
        }

        const payload = { sub: user.userId, username: user.username };

        return {
            userId: user.userId,
            access_token: await this.jwtService.signAsync(payload),
            username: user.username,
            email: user.email
        };
    }

    async googleLogin(req) {
        if (!req.user) {
            throw new UnauthorizedException('No user from google');
        }

        const payload = {
            email: req.user.email,
            username: req.user.firstName + ' ' + req.user.lastName,
        };

        const user = await this.usersService.findOne(req.user.email);
        if(user) {
            return {
                userId: user.userId,
                access_token: await this.jwtService.signAsync(payload),
                username: user.username,
                email: user.email
            };
        } else {
            const createUserDTO: CreateUserDto = {
                username: payload.username,
                email: payload.email,
                password: await this.jwtService.signAsync(payload),
            }
            await this.usersService.createUser(createUserDTO);
            const createdUser = await this.usersService.findOne(payload.email);
            return {
                access_token: await this.jwtService.signAsync(payload),
                email: createdUser.email,
                username: createdUser.username,
                userId: createdUser.userId
            }
        }
    }
}
