import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

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

    googleLogin(req) {
        if (!req.user) {
            throw new UnauthorizedException('No user from google');
        }

        const payload = {
            email: req.user.email,
            username: req.user.firstName + ' ' + req.user.lastName,
        };
    
        return this.jwtService.signAsync(payload, { expiresIn: '60s' }).then((access_token) => {
            return {
                access_token,
                username: payload.username,
                email: payload.email,
            };
        });
    }
}
