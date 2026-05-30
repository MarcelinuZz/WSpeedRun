import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AdminGuard } from './admin.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PassportModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtStrategy, AdminGuard],
})
export class AppModule {}
