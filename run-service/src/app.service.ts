import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { CreateCommentDto, CreateRunDto } from './dto';
import { JwtUser } from './jwt.strategy';
import { PrismaService } from './prisma.service';

type Game = {
  game_id: string;
  game_name: string;
  description: string;
};

type Category = {
  run_category_id: string;
  game_id: string;
  run_category_name: string;
  game: Game;
};

type UserProfile = {
  user_id: string;
  username: string;
  email: string;
  country: string;
  role: string;
};

@Injectable()
export class AppService {
  private readonly authServiceUrl: string;
  private readonly gameServiceUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.authServiceUrl =
      config.get<string>('AUTH_SERVICE_URL') ?? 'http://localhost:3000';
    this.gameServiceUrl =
      config.get<string>('GAME_SERVICE_URL') ?? 'http://localhost:3001';
  }

  async runsByCategory(categoryId: string) {
    const category = await this.getCategory(categoryId);
    const runs = await this.prisma.run.findMany({
      where: { run_category_id: categoryId, status: 'ACCEPTED' },
      orderBy: { run_duration: 'asc' },
    });

    return Promise.all(runs.map((run) => this.formatRun(run, category)));
  }

  async runsByUser(userId: string, authUser: JwtUser) {
    await this.getUser(userId);

    const runs = await this.prisma.run.findMany({
      where:
        authUser.id === userId
          ? { user_id: userId }
          : { user_id: userId, status: 'ACCEPTED' },
      orderBy: { submitted_at: 'desc' },
    });

    return Promise.all(runs.map((run) => this.formatRun(run)));
  }

  async getRun(id: string) {
    const run = await this.prisma.run.findUnique({
      where: { run_id: id },
      include: { comments: { orderBy: { created_at: 'asc' } } },
    });

    if (!run) {
      throw new NotFoundException('Run not found');
    }

    const category = await this.getCategory(run.run_category_id);
    const runner = await this.getUser(run.user_id);
    const comments = await Promise.all(
      run.comments.map(async (comment) => ({
        comment_id: comment.comment_id,
        run_id: comment.run_id,
        user_id: comment.user_id,
        user: await this.getUser(comment.user_id),
        comment: comment.comment,
        created_at: comment.created_at,
      })),
    );

    return {
      ...this.serializeRun(run),
      run_duration_text: this.formatDuration(run.run_duration),
      category,
      game: category.game,
      runner,
      comments,
    };
  }

  async createRun(dto: CreateRunDto, authUser: JwtUser) {
    if (!this.isFilled(dto.run_category_id)) {
      throw new BadRequestException('Run category id must be filled');
    }

    if (!this.isFilled(dto.vod_url)) {
      throw new BadRequestException('VOD URL must be filled');
    }

    const duration = this.parseDuration(dto.run_duration);
    await this.getCategory(dto.run_category_id);

    await this.prisma.run.create({
      data: {
        run_id: randomUUID(),
        run_category_id: dto.run_category_id,
        user_id: authUser.id,
        vod_url: dto.vod_url.trim(),
        run_duration: duration,
        status: 'PENDING',
      },
    });

    return { message: 'Run submitted successfully' };
  }

  async createComment(dto: CreateCommentDto, authUser: JwtUser) {
    if (!this.isFilled(dto.run_id)) {
      throw new BadRequestException('Run id must be filled');
    }

    if (!this.isFilled(dto.user_id)) {
      throw new BadRequestException('User id must be filled');
    }

    if (!this.isFilled(dto.comment)) {
      throw new BadRequestException('Comment must be filled');
    }

    if (dto.user_id !== authUser.id) {
      throw new ForbiddenException('User id must match authenticated user');
    }

    await this.ensureRunExists(dto.run_id);
    await this.getUser(dto.user_id);

    await this.prisma.comment.create({
      data: {
        comment_id: randomUUID(),
        run_id: dto.run_id,
        user_id: dto.user_id,
        comment: dto.comment.trim(),
      },
    });

    return { message: 'Comment created successfully' };
  }

  async deleteComment(id: string, authUser: JwtUser) {
    const comment = await this.prisma.comment.findUnique({
      where: { comment_id: id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user_id !== authUser.id) {
      throw new ForbiddenException('Comment belongs to another user');
    }

    await this.prisma.comment.delete({ where: { comment_id: id } });
    return { message: 'Comment deleted successfully' };
  }

  async adminRunsByStatus(status: string) {
    const validStatus = this.normalizeStatus(status);
    const runs = await this.prisma.run.findMany({
      where: { status: validStatus },
      orderBy: { submitted_at: 'desc' },
    });

    return Promise.all(runs.map((run) => this.formatRun(run)));
  }

  async acceptRun(id: string) {
    await this.ensureRunExists(id);
    await this.prisma.run.update({
      where: { run_id: id },
      data: { status: 'ACCEPTED', verified_at: new Date() },
    });
    return { message: 'Run accepted successfully' };
  }

  async rejectRun(id: string) {
    await this.ensureRunExists(id);
    await this.prisma.run.update({
      where: { run_id: id },
      data: { status: 'REJECTED', verified_at: new Date() },
    });
    return { message: 'Run rejected successfully' };
  }

  private async formatRun(
    run: Awaited<ReturnType<PrismaService['run']['findFirst']>>,
    category?: Category,
  ) {
    if (!run) {
      throw new NotFoundException('Run not found');
    }

    const resolvedCategory =
      category ?? (await this.getCategory(run.run_category_id));
    return {
      ...this.serializeRun(run),
      run_duration_text: this.formatDuration(run.run_duration),
      category: {
        run_category_id: resolvedCategory.run_category_id,
        run_category_name: resolvedCategory.run_category_name,
      },
      game: resolvedCategory.game,
      runner: await this.getUser(run.user_id),
    };
  }

  private serializeRun(run: {
    run_id: string;
    run_category_id: string;
    user_id: string;
    vod_url: string;
    run_duration: bigint;
    submitted_at: Date;
    verified_at: Date | null;
    status: string;
  }) {
    return {
      run_id: run.run_id,
      run_category_id: run.run_category_id,
      user_id: run.user_id,
      vod_url: run.vod_url,
      run_duration: run.run_duration.toString(),
      submitted_at: run.submitted_at,
      verified_at: run.verified_at,
      status: run.status,
    };
  }

  private async ensureRunExists(id: string) {
    const run = await this.prisma.run.findUnique({ where: { run_id: id } });
    if (!run) {
      throw new NotFoundException('Run not found');
    }
  }

  private async getCategory(id: string) {
    try {
      const response = await axios.get<Category>(
        `${this.gameServiceUrl}/categories/${id}`,
      );
      return response.data;
    } catch {
      throw new BadRequestException('Run category id must exist');
    }
  }

  private async getUser(id: string) {
    try {
      const response = await axios.get<UserProfile>(
        `${this.authServiceUrl}/users/${id}/profile`,
      );
      return response.data;
    } catch {
      throw new BadRequestException('User id must exist');
    }
  }

  private normalizeStatus(status: string) {
    const value = status.toUpperCase();
    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED'];

    if (!validStatuses.includes(value)) {
      throw new BadRequestException(
        'Status must be PENDING, ACCEPTED, or REJECTED',
      );
    }

    return value;
  }

  private parseDuration(value: unknown) {
    const duration =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number(value)
          : Number.NaN;

    if (
      !Number.isFinite(duration) ||
      !Number.isInteger(duration) ||
      duration < 0
    ) {
      throw new BadRequestException('Run duration must be a number');
    }

    return BigInt(duration);
  }

  private formatDuration(value: bigint) {
    const totalSeconds = Number(value);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours} Hour(s) ${minutes} Minute(s) ${seconds} Second(s)`;
  }

  private isFilled(value: unknown) {
    return typeof value === 'string' && value.trim().length > 0;
  }
}
