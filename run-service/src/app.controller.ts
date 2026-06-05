import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AdminGuard } from './admin.guard';
import { AppService } from './app.service';
import { CreateCommentDto, CreateRunDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtUser } from './jwt.strategy';

type AuthenticatedRequest = Request & {
  user: JwtUser;
};

@ApiTags('runs')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('runs/:id/category')
  runsByCategory(@Param('id') id: string) {
    return this.appService.runsByCategory(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('runs/:id/user')
  runsByUser(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.appService.runsByUser(id, request.user);
  }

  @Get('runs/:id')
  getRun(@Param('id') id: string) {
    return this.appService.getRun(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('runs')
  createRun(@Body() dto: CreateRunDto, @Req() request: AuthenticatedRequest) {
    return this.appService.createRun(dto, request.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('comments')
  createComment(
    @Body() dto: CreateCommentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.appService.createComment(dto, request.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('comments/:id')
  deleteComment(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.appService.deleteComment(id, request.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/runss/:status')
  adminRunsByStatus(@Param('status') status: string) {
    return this.appService.adminRunsByStatus(status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/runs/:id/accept')
  acceptRun(@Param('id') id: string) {
    return this.appService.acceptRun(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/runs/:id/reject')
  rejectRun(@Param('id') id: string) {
    return this.appService.rejectRun(id);
  }
}
