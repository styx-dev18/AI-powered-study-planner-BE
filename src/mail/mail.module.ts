import { Module } from '@nestjs/common';
import { MailService } from './infra/mail.service';
import { SendMailUseCase } from './core/usecases/send_mail.usecase';

@Module({
  providers: [MailService, SendMailUseCase],
  exports: [SendMailUseCase],
})
export class MailModule {}
