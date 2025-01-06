import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UserService))
        private usersService: UserService,
        private jwtService: JwtService
    ) { }

    verifyToken(token: string) {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    generateVerificationToken(userId: string): string {
        return this.jwtService.sign(
            { userId },
            { expiresIn: '24h' }
        );
    }

    async signIn(
        email: string,
        pass: string,
    ): Promise<{ userId: string, access_token: string, username: string, email: string, imageUrl: string }> {
        if (email == '') {
            throw new UnauthorizedException('Email is required.');
        }
        if (pass == '') {
            throw new UnauthorizedException('Password is required.');
        }
        const user = await this.usersService.findOne(email);

        if (!user) {
            throw new UnauthorizedException('Email does not exist.');
        }
        
        if (!(await bcrypt.compare(pass, user.password))) {
            throw new UnauthorizedException('Password is not correct.');
        }

        if(!user.isVerified) {
            throw new UnauthorizedException('User is not verified.');
        }

        const payload = { sub: user.userId, username: user.username };

        return {
            userId: user.userId,
            access_token: await this.jwtService.signAsync(payload),
            username: user.username,
            email: user.email,
            imageUrl: user.imageUrl
        };
    }

    async googleLogin(req) {
        if (!req.user) {
            throw new UnauthorizedException('No user from google');
        }

        const payload = {
            email: req.user.email,
            username: req.user.displayName || `${req.user.firstName} ${req.user.lastName}`,
            imageUrl: req.user.picture
        };

        const user = await this.usersService.findOne(req.user.email);
        if (user) {
            return {
                userId: user.userId,
                access_token: await this.jwtService.signAsync(payload),
                username: user.username,
                email: user.email,
                imageUrl: user.imageUrl
            };
        } else {
            const createUserDTO: CreateUserDto = {
                username: payload.username,
                email: payload.email,
                password: await this.jwtService.signAsync(payload),
                imageUrl: payload.imageUrl
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
