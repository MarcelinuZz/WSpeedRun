import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from './admin.guard';
import { AppService } from './app.service';
import {
  CreateCategoryDto,
  CreateGameDto,
  UpdateCategoryDto,
  UpdateGameDto,
} from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('games')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('games')
  listGames() {
    return this.appService.listGames();
  }

  @Get('games/:id')
  getGame(@Param('id') id: string) {
    return this.appService.getGame(id);
  }

  @Get('categories/:id')
  getCategory(@Param('id') id: string) {
    return this.appService.getCategory(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/games')
  createGame(@Body() dto: CreateGameDto) {
    return this.appService.createGame(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/games/:id/update')
  updateGame(@Param('id') id: string, @Body() dto: UpdateGameDto) {
    return this.appService.updateGame(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/games/:id/delete')
  deleteGame(@Param('id') id: string) {
    return this.appService.deleteGame(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.appService.createCategory(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/categories/:id/update')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.appService.updateCategory(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/categories/:id/delete')
  deleteCategory(@Param('id') id: string) {
    return this.appService.deleteCategory(id);
  }
}
