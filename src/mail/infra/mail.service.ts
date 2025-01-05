import { BadRequestException, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { cwd } from 'process';

@Injectable()
export class MailService {
  private readonly MAIL: string;
  private readonly CLIENT_ID: string;
  private readonly CLIENT_SECRET: string;
  private readonly REDIRECT_URI: string;
  private readonly REFRESH_TOKEN: string;

  private oAuth2Client;

  constructor(private readonly configService: ConfigService) {
    this.MAIL = this.configService.get<string>('MAIL_SERVICE_MAIL');
    this.CLIENT_ID = this.configService.get<string>('MAIL_SERVICE_CLIENT_ID');
    this.CLIENT_SECRET = this.configService.get<string>(
      'MAIL_SERVICE_CLIENT_SECRET',
    );
    this.REDIRECT_URI = this.configService.get<string>(
      'MAIL_SERVICE_REDIRECT_URI',
    );
    this.REFRESH_TOKEN = this.configService.get<string>(
      'MAIL_SERVICE_REFRESH_TOKEN',
    );
  }

  private async getAccessToken() {
    this.oAuth2Client = new google.auth.OAuth2(
      this.CLIENT_ID,
      this.CLIENT_SECRET,
      this.REDIRECT_URI,
    );
    this.oAuth2Client.setCredentials({ refresh_token: this.REFRESH_TOKEN });
    const accessToken = await this.oAuth2Client.getAccessToken();
    return accessToken.token as string;
  }

  async renderTemplate(templateName: string, data: any): Promise<string> {
    const templatePath = path.join(
      cwd(),
      'dist/mail/core/templates/',
      `${templateName}.hbs`,
    );
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateContent);
    return template(data);
  }

  async sendMail(
    to: string,
    subject: string,
    htmlContent: string,
  ): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();

      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: this.MAIL,
          clientId: this.CLIENT_ID,
          clientSecret: this.CLIENT_SECRET,
          refreshToken: this.REFRESH_TOKEN,
          accessToken,
        },
      });

      const mailOptions = {
        to,
        from: this.MAIL,
        subject,
        html: htmlContent,
      };

      await transport.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new BadRequestException(error.message);
    }
  }
}
