import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('WSpeedrun Run Service')
    .setDescription('Run submission, leaderboard, comment, and review API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3002);
}
void bootstrap();
