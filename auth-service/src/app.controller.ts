import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { LoginDto, RegisterDto } from './dto';

@ApiTags('auth')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('auth/register')
  register(@Body() dto: RegisterDto) {
    return this.appService.register(dto);
  }

  @Post('auth/login')
  login(@Body() dto: LoginDto) {
    return this.appService.login(dto);
  }

  @ApiBearerAuth()
  @Get('users/:id/profile')
  profile(@Param('id') id: string) {
    return this.appService.profile(id);
  }
}
