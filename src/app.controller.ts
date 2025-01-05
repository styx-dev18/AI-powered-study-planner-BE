import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get("/hello")
  getHello(@Req() request: Request): string {
    console.log('hi');
    return "Hello " + request['user']?.email + '!';
  }
}
