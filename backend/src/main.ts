import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';

let cachedApp: INestApplication;

async function bootstrap(): Promise<INestApplication> {
  if (!cachedApp) {
    const server = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Enable CORS
    app.enableCors({
      origin: process.env.FRONTEND_URL,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Content-Type, Accept, Authorization',
    });

    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

// Vercel serverless handler
export default async (req: Request, res: Response) => {
  const app = await bootstrap();
  const instance = app.getHttpAdapter().getInstance() as express.Application;
  instance(req, res);
};

// Local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  bootstrap()
    .then(async (app) => {
      await app.listen(process.env.PORT ?? 3001);
      console.log(`Application is running on: ${await app.getUrl()}`);
    })
    .catch((error) => console.error(error));
}
