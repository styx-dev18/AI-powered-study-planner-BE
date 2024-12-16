import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { emitWarning } from 'process';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const { username, email, password } = createUserDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }

    const existingUsername = await this.userRepository.findOne({where: {username}});
    if(existingUsername){
      throw new ConflictException('Username already exists.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({username,  email, password: hashedPassword });

    try {
      await this.userRepository.save(user);
      return { message: 'User created successfully!' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user.');
    }
  }

  async findOne(email: string): Promise<User>{
    const existingUser = await this.userRepository.findOne({ where: { email } });
    return existingUser; 
  }
}
