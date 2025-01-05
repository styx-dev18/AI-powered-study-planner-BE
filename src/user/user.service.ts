import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { SendMailUseCase } from 'src/mail/core/usecases/send_mail.usecase';
import { MailSubject } from 'src/mail/core/enums/subject';
import { AuthService } from 'src/auth/auth.service';
import { Token } from '../entities/token.entity';
import { TokenPurpose } from '../entities/token.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private readonly sendMailUsecase: SendMailUseCase,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) { }

  async updateUser(updateUserDto: UpdateUserDto): Promise<{ message: string, data: User }> {
    const { email } = updateUserDto;
    const { id, ...payload } = updateUserDto;
    const existingUser = await this.findOne(email);
    if (existingUser) {
      if (existingUser.userId !== id)
        throw new ConflictException('Email already exists.');
    }

    const user = await this.findOneById(id);

    Object.assign(user, payload);
    const updatedUser = await this.userRepository.save(user);

    return {
      message: 'Account is updated successfully.',
      data: updatedUser
    }
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto): Promise<{ message: string }> {
    const { userId, password, token } = updatePasswordDto;
    const user = await this.findOneById(userId);

    // Find and validate token
    const tokenRecord = await this.tokenRepository.findOne({
      where: {
        userId,
        token,
        purpose: TokenPurpose.RESET_PASSWORD
      }
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid reset token');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.tokenRepository.remove(tokenRecord);
      throw new UnauthorizedException('Reset token has expired');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and remove used token
    await this.userRepository.update(userId, { password: hashedPassword });
    await this.tokenRepository.remove(tokenRecord);

    return {
      message: 'Password updated successfully.'
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const { username, email, password, imageUrl } = createUserDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({ username, email, password: hashedPassword, imageUrl });

    try {
      const savedUser = await this.userRepository.save(user);
      const token = this.authService.generateVerificationToken(savedUser.userId);
      const verificationLink = `${process.env.CORS_ORIGIN}/verify-email?token=${token}`;

      // Store verification token
      await this.tokenRepository.save({
        userId: savedUser.userId,
        token,
        purpose: TokenPurpose.VERIFY_EMAIL,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      await this.sendMailUsecase.execute(user.email, {
        subject: MailSubject.VERIFY_EMAIL,
        templateName: 'verify_email'
      }, {
        displayName: user.username,
        verificationLink: verificationLink
      });
      return { message: 'User created successfully!' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user.');
    }
  }

  async verifyEmail(token: string): Promise<void> {
    // Find the token record
    const tokenRecord = await this.tokenRepository.findOne({
      where: {
        token,
        purpose: TokenPurpose.VERIFY_EMAIL
      }
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid verification token');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.tokenRepository.remove(tokenRecord);
      throw new UnauthorizedException('Verification token has expired');
    }

    const user = await this.findOneById(tokenRecord.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isVerified = true;
    await this.userRepository.save(user);
    
    // Remove the used token
    await this.tokenRepository.remove(tokenRecord);
  }

  async findOne(email: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    return existingUser;
  }

  async findOneById(userId: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { userId } });
    return existingUser;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Clear any existing reset tokens for this user
      await this.tokenRepository.delete({
        userId: user.userId,
        purpose: TokenPurpose.RESET_PASSWORD
      });

      const token = this.authService.generateVerificationToken(user.userId);
      const resetLink = `${process.env.CORS_ORIGIN}/reset-password?token=${token}`;

      // Create new token record
      await this.tokenRepository.save({
        userId: user.userId,
        token,
        purpose: TokenPurpose.RESET_PASSWORD,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      await this.sendMailUsecase.execute(user.email, {
        subject: MailSubject.FORGOT_PASSWORD,
        templateName: 'forgot_password',
      }, {
        displayName: user.username,
        resetPasswordLink: resetLink,
      });

      return { message: 'Password reset link sent successfully' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to send password reset link');
    }
  }
}
