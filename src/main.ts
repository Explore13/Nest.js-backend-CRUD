import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // validating incoming requests bodies automatically
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties that don't have decorators
      forbidNonWhitelisted: true,
      transform: true, //automatically transforms payloads to be objects typed according to their dto classes
      disableErrorMessages: false,
    }),
  );

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log('Server is ready');
  });
}
bootstrap();
