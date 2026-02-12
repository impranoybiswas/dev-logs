import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';

const server = express();

let cachedServer: Express;

export const bootstrap = async (): Promise<Express> => {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    await app.init();
    cachedServer = server;
  }
  return cachedServer;
};

// Vercel Handler
export default async (req: Request, res: Response) => {
  const app = await bootstrap();
  app(req, res);
};
