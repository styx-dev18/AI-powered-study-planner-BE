import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { SendMailUseCase } from 'src/mail/core/usecases/send_mail.usecase';
import { MailSubject } from 'src/mail/core/enums/subject';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) { }
  @Post('/register')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Post('update')
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(updateUserDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string): Promise<{ message: string }> {
    return this.userService.forgotPassword(email);
  }

  @Post('update-password')
  updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    return this.userService.updatePassword(updatePasswordDto);
  }
}