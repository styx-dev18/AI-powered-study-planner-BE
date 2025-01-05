import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

import * as firebase from 'firebase-admin'
import * as serviceAccount from './firebaseServiceAccount.json'

const firebaseParams = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProvider_x509_cert_url: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url,
};


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: [configService.get<string>('CORS_ORIGIN'), 'http://localhost:3000'],
    credentials: true,
  });

  if (firebase.apps.length === 0) {
    console.log('Initialize Firebase Application.');
    firebase.initializeApp({
      credential: firebase.credential.cert(firebaseParams),
      databaseURL: "ep-spring-violet-a1habikb-pooler.ap-southeast-1.aws.neon.tech"
    });
  }

  await app.listen(4000);
}
bootstrap();
