import { Injectable } from '@nestjs/common';
import { MailService } from '../../infra/mail.service';
import { MailParams } from '../models/mail_params';

@Injectable()
export class SendMailUseCase {
  constructor(private readonly mailService: MailService) {}

  async execute(
    to: string,
    mailParams: MailParams,
    data: any,
  ): Promise<boolean> {
    const bodyContent = await this.mailService.renderTemplate(
      mailParams.templateName,
      data,
    );
    const layoutContext = {
      body: bodyContent,
    };

    const htmlContent = await this.mailService.renderTemplate(
      'layout',
      layoutContext,
    );

    return this.mailService.sendMail(to, mailParams.subject, htmlContent);
  }
}
