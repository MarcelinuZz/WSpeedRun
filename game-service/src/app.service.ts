import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CreateCategoryDto,
  CreateGameDto,
  UpdateCategoryDto,
  UpdateGameDto,
} from './dto';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  listGames() {
    return this.prisma.game.findMany({
      include: { runCategories: true },
      orderBy: { game_name: 'asc' },
    });
  }

  async getGame(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { game_id: id },
      include: { runCategories: true },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }

  async createGame(dto: CreateGameDto) {
    if (!this.isFilled(dto.game_name) || !this.isFilled(dto.description)) {
      throw new BadRequestException('Game name and description must be filled');
    }

    await this.prisma.game.create({
      data: {
        game_id: randomUUID(),
        game_name: dto.game_name.trim(),
        description: dto.description.trim(),
      },
    });

    return { message: 'Game created successfully' };
  }

  async updateGame(id: string, dto: UpdateGameDto) {
    await this.ensureGameExists(id);

    const data: UpdateGameDto = {};

    if (dto.game_name !== undefined) {
      if (!this.isFilled(dto.game_name)) {
        throw new BadRequestException('Game name must be filled');
      }
      data.game_name = dto.game_name.trim();
    }

    if (dto.description !== undefined) {
      if (!this.isFilled(dto.description)) {
        throw new BadRequestException('Game description must be filled');
      }
      data.description = dto.description.trim();
    }

    await this.prisma.game.update({ where: { game_id: id }, data });
    return { message: 'Game updated successfully' };
  }

  async deleteGame(id: string) {
    await this.ensureGameExists(id);
    await this.prisma.game.delete({ where: { game_id: id } });
    return { message: 'Game deleted successfully' };
  }

  async getCategory(id: string) {
    const category = await this.prisma.runCategory.findUnique({
      where: { run_category_id: id },
      include: { game: true },
    });

    if (!category) {
      throw new NotFoundException('Run category not found');
    }

    return category;
  }

  async createCategory(dto: CreateCategoryDto) {
    if (!this.isFilled(dto.game_id)) {
      throw new BadRequestException('Game id must be filled');
    }

    if (!this.isFilled(dto.run_category_name)) {
      throw new BadRequestException('Run category name must be filled');
    }

    await this.ensureGameExists(dto.game_id);

    await this.prisma.runCategory.create({
      data: {
        run_category_id: randomUUID(),
        game_id: dto.game_id,
        run_category_name: dto.run_category_name.trim(),
      },
    });

    return { message: 'Run category created successfully' };
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    await this.ensureCategoryExists(id);

    const data: UpdateCategoryDto = {};

    if (dto.game_id !== undefined) {
      if (!this.isFilled(dto.game_id)) {
        throw new BadRequestException('Game id must be filled');
      }
      await this.ensureGameExists(dto.game_id);
      data.game_id = dto.game_id;
    }

    if (dto.run_category_name !== undefined) {
      if (!this.isFilled(dto.run_category_name)) {
        throw new BadRequestException('Run category name must be filled');
      }
      data.run_category_name = dto.run_category_name.trim();
    }

    await this.prisma.runCategory.update({
      where: { run_category_id: id },
      data,
    });

    return { message: 'Run category updated successfully' };
  }

  async deleteCategory(id: string) {
    await this.ensureCategoryExists(id);
    await this.prisma.runCategory.delete({ where: { run_category_id: id } });
    return { message: 'Run category deleted successfully' };
  }

  private async ensureGameExists(id: string) {
    const game = await this.prisma.game.findUnique({ where: { game_id: id } });
    if (!game) {
      throw new NotFoundException('Game not found');
    }
  }

  private async ensureCategoryExists(id: string) {
    const category = await this.prisma.runCategory.findUnique({
      where: { run_category_id: id },
    });
    if (!category) {
      throw new NotFoundException('Run category not found');
    }
  }

  private isFilled(value: unknown) {
    return typeof value === 'string' && value.trim().length > 0;
  }
}
