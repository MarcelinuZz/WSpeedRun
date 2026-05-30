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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("./prisma.service");
let AppService = class AppService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    listGames() {
        return this.prisma.game.findMany({
            include: { runCategories: true },
            orderBy: { game_name: 'asc' },
        });
    }
    async getGame(id) {
        const game = await this.prisma.game.findUnique({
            where: { game_id: id },
            include: { runCategories: true },
        });
        if (!game) {
            throw new common_1.NotFoundException('Game not found');
        }
        return game;
    }
    async createGame(dto) {
        if (!this.isFilled(dto.game_name) || !this.isFilled(dto.description)) {
            throw new common_1.BadRequestException('Game name and description must be filled');
        }
        await this.prisma.game.create({
            data: {
                game_id: (0, crypto_1.randomUUID)(),
                game_name: dto.game_name.trim(),
                description: dto.description.trim(),
            },
        });
        return { message: 'Game created successfully' };
    }
    async updateGame(id, dto) {
        await this.ensureGameExists(id);
        const data = {};
        if (dto.game_name !== undefined) {
            if (!this.isFilled(dto.game_name)) {
                throw new common_1.BadRequestException('Game name must be filled');
            }
            data.game_name = dto.game_name.trim();
        }
        if (dto.description !== undefined) {
            if (!this.isFilled(dto.description)) {
                throw new common_1.BadRequestException('Game description must be filled');
            }
            data.description = dto.description.trim();
        }
        await this.prisma.game.update({ where: { game_id: id }, data });
        return { message: 'Game updated successfully' };
    }
    async deleteGame(id) {
        await this.ensureGameExists(id);
        await this.prisma.game.delete({ where: { game_id: id } });
        return { message: 'Game deleted successfully' };
    }
    async getCategory(id) {
        const category = await this.prisma.runCategory.findUnique({
            where: { run_category_id: id },
            include: { game: true },
        });
        if (!category) {
            throw new common_1.NotFoundException('Run category not found');
        }
        return category;
    }
    async createCategory(dto) {
        if (!this.isFilled(dto.game_id)) {
            throw new common_1.BadRequestException('Game id must be filled');
        }
        if (!this.isFilled(dto.run_category_name)) {
            throw new common_1.BadRequestException('Run category name must be filled');
        }
        await this.ensureGameExists(dto.game_id);
        await this.prisma.runCategory.create({
            data: {
                run_category_id: (0, crypto_1.randomUUID)(),
                game_id: dto.game_id,
                run_category_name: dto.run_category_name.trim(),
            },
        });
        return { message: 'Run category created successfully' };
    }
    async updateCategory(id, dto) {
        await this.ensureCategoryExists(id);
        const data = {};
        if (dto.game_id !== undefined) {
            if (!this.isFilled(dto.game_id)) {
                throw new common_1.BadRequestException('Game id must be filled');
            }
            await this.ensureGameExists(dto.game_id);
            data.game_id = dto.game_id;
        }
        if (dto.run_category_name !== undefined) {
            if (!this.isFilled(dto.run_category_name)) {
                throw new common_1.BadRequestException('Run category name must be filled');
            }
            data.run_category_name = dto.run_category_name.trim();
        }
        await this.prisma.runCategory.update({
            where: { run_category_id: id },
            data,
        });
        return { message: 'Run category updated successfully' };
    }
    async deleteCategory(id) {
        await this.ensureCategoryExists(id);
        await this.prisma.runCategory.delete({ where: { run_category_id: id } });
        return { message: 'Run category deleted successfully' };
    }
    async ensureGameExists(id) {
        const game = await this.prisma.game.findUnique({ where: { game_id: id } });
        if (!game) {
            throw new common_1.NotFoundException('Game not found');
        }
    }
    async ensureCategoryExists(id) {
        const category = await this.prisma.runCategory.findUnique({
            where: { run_category_id: id },
        });
        if (!category) {
            throw new common_1.NotFoundException('Run category not found');
        }
    }
    isFilled(value) {
        return typeof value === 'string' && value.trim().length > 0;
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppService);
//# sourceMappingURL=app.service.js.map