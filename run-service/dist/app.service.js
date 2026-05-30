"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const prisma_service_1 = require("./prisma.service");
let AppService = class AppService {
    prisma;
    authServiceUrl;
    gameServiceUrl;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.authServiceUrl =
            config.get('AUTH_SERVICE_URL') ?? 'http://localhost:3000';
        this.gameServiceUrl =
            config.get('GAME_SERVICE_URL') ?? 'http://localhost:3001';
    }
    async runsByCategory(categoryId) {
        const category = await this.getCategory(categoryId);
        const runs = await this.prisma.run.findMany({
            where: { run_category_id: categoryId, status: 'ACCEPTED' },
            orderBy: { run_duration: 'asc' },
        });
        return Promise.all(runs.map((run) => this.formatRun(run, category)));
    }
    async runsByUser(userId, authUser) {
        await this.getUser(userId);
        const runs = await this.prisma.run.findMany({
            where: authUser.id === userId
                ? { user_id: userId }
                : { user_id: userId, status: 'ACCEPTED' },
            orderBy: { submitted_at: 'desc' },
        });
        return Promise.all(runs.map((run) => this.formatRun(run)));
    }
    async getRun(id) {
        const run = await this.prisma.run.findUnique({
            where: { run_id: id },
            include: { comments: { orderBy: { created_at: 'asc' } } },
        });
        if (!run) {
            throw new common_1.NotFoundException('Run not found');
        }
        const category = await this.getCategory(run.run_category_id);
        const runner = await this.getUser(run.user_id);
        const comments = await Promise.all(run.comments.map(async (comment) => ({
            comment_id: comment.comment_id,
            run_id: comment.run_id,
            user_id: comment.user_id,
            user: await this.getUser(comment.user_id),
            comment: comment.comment,
            created_at: comment.created_at,
        })));
        return {
            ...this.serializeRun(run),
            run_duration_text: this.formatDuration(run.run_duration),
            category,
            game: category.game,
            runner,
            comments,
        };
    }
    async createRun(dto, authUser) {
        if (!this.isFilled(dto.run_category_id)) {
            throw new common_1.BadRequestException('Run category id must be filled');
        }
        if (!this.isFilled(dto.vod_url)) {
            throw new common_1.BadRequestException('VOD URL must be filled');
        }
        const duration = this.parseDuration(dto.run_duration);
        await this.getCategory(dto.run_category_id);
        await this.prisma.run.create({
            data: {
                run_id: (0, crypto_1.randomUUID)(),
                run_category_id: dto.run_category_id,
                user_id: authUser.id,
                vod_url: dto.vod_url.trim(),
                run_duration: duration,
                status: 'PENDING',
            },
        });
        return { message: 'Run submitted successfully' };
    }
    async createComment(dto, authUser) {
        if (!this.isFilled(dto.run_id)) {
            throw new common_1.BadRequestException('Run id must be filled');
        }
        if (!this.isFilled(dto.user_id)) {
            throw new common_1.BadRequestException('User id must be filled');
        }
        if (!this.isFilled(dto.comment)) {
            throw new common_1.BadRequestException('Comment must be filled');
        }
        if (dto.user_id !== authUser.id) {
            throw new common_1.ForbiddenException('User id must match authenticated user');
        }
        await this.ensureRunExists(dto.run_id);
        await this.getUser(dto.user_id);
        await this.prisma.comment.create({
            data: {
                comment_id: (0, crypto_1.randomUUID)(),
                run_id: dto.run_id,
                user_id: dto.user_id,
                comment: dto.comment.trim(),
            },
        });
        return { message: 'Comment created successfully' };
    }
    async deleteComment(id, authUser) {
        const comment = await this.prisma.comment.findUnique({
            where: { comment_id: id },
        });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        if (comment.user_id !== authUser.id) {
            throw new common_1.ForbiddenException('Comment belongs to another user');
        }
        await this.prisma.comment.delete({ where: { comment_id: id } });
        return { message: 'Comment deleted successfully' };
    }
    async adminRunsByStatus(status) {
        const validStatus = this.normalizeStatus(status);
        const runs = await this.prisma.run.findMany({
            where: { status: validStatus },
            orderBy: { submitted_at: 'desc' },
        });
        return Promise.all(runs.map((run) => this.formatRun(run)));
    }
    async acceptRun(id) {
        await this.ensureRunExists(id);
        await this.prisma.run.update({
            where: { run_id: id },
            data: { status: 'ACCEPTED', verified_at: new Date() },
        });
        return { message: 'Run accepted successfully' };
    }
    async rejectRun(id) {
        await this.ensureRunExists(id);
        await this.prisma.run.update({
            where: { run_id: id },
            data: { status: 'REJECTED', verified_at: new Date() },
        });
        return { message: 'Run rejected successfully' };
    }
    async formatRun(run, category) {
        if (!run) {
            throw new common_1.NotFoundException('Run not found');
        }
        const resolvedCategory = category ?? (await this.getCategory(run.run_category_id));
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
    serializeRun(run) {
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
    async ensureRunExists(id) {
        const run = await this.prisma.run.findUnique({ where: { run_id: id } });
        if (!run) {
            throw new common_1.NotFoundException('Run not found');
        }
    }
    async getCategory(id) {
        try {
            const response = await axios_1.default.get(`${this.gameServiceUrl}/categories/${id}`);
            return response.data;
        }
        catch {
            throw new common_1.BadRequestException('Run category id must exist');
        }
    }
    async getUser(id) {
        try {
            const response = await axios_1.default.get(`${this.authServiceUrl}/users/${id}/profile`);
            return response.data;
        }
        catch {
            throw new common_1.BadRequestException('User id must exist');
        }
    }
    normalizeStatus(status) {
        const value = status.toUpperCase();
        const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED'];
        if (!validStatuses.includes(value)) {
            throw new common_1.BadRequestException('Status must be PENDING, ACCEPTED, or REJECTED');
        }
        return value;
    }
    parseDuration(value) {
        const duration = typeof value === 'number'
            ? value
            : typeof value === 'string'
                ? Number(value)
                : Number.NaN;
        if (!Number.isFinite(duration) ||
            !Number.isInteger(duration) ||
            duration < 0) {
            throw new common_1.BadRequestException('Run duration must be a number');
        }
        return BigInt(duration);
    }
    formatDuration(value) {
        const totalSeconds = Number(value);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours} Hour(s) ${minutes} Minute(s) ${seconds} Second(s)`;
    }
    isFilled(value) {
        return typeof value === 'string' && value.trim().length > 0;
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AppService);
//# sourceMappingURL=app.service.js.map