"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const prisma_service_1 = require("./prisma.service");
let AppService = class AppService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(dto) {
        this.validateRegister(dto);
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email is already registered');
        }
        await this.prisma.user.create({
            data: {
                user_id: (0, crypto_1.randomUUID)(),
                username: dto.username.trim(),
                email: dto.email.trim(),
                country: dto.country?.trim() ?? '',
                password: await bcrypt.hash(dto.password, 10),
                role: 'USER',
            },
        });
        return { message: 'Registration successful' };
    }
    async login(dto) {
        if (!this.isFilled(dto.email) || !this.isFilled(dto.password)) {
            throw new common_1.BadRequestException('Email and password must be filled');
        }
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.trim() },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Email is not registered');
        }
        const validPassword = await bcrypt.compare(dto.password, user.password);
        if (!validPassword) {
            throw new common_1.UnauthorizedException('Password is incorrect');
        }
        return {
            access_token: await this.jwtService.signAsync({
                id: user.user_id,
                role: user.role,
            }),
        };
    }
    async profile(id) {
        const user = await this.prisma.user.findUnique({
            where: { user_id: id },
            select: {
                username: true,
                email: true,
                country: true,
                role: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    validateRegister(dto) {
        if (!this.hasLength(dto.username, 4, 40)) {
            throw new common_1.BadRequestException('Username must be between 4 and 40 characters long');
        }
        if (!this.isValidEmail(dto.email)) {
            throw new common_1.BadRequestException('Email format is invalid');
        }
        if (!this.hasLength(dto.password, 8, 40)) {
            throw new common_1.BadRequestException('Password must be between 8 and 40 characters long');
        }
        if (!this.isStrongPassword(dto.password)) {
            throw new common_1.BadRequestException('Password must contain uppercase, lowercase, number, and special character');
        }
    }
    hasLength(value, min, max) {
        if (typeof value !== 'string') {
            return false;
        }
        const length = value.trim().length;
        return length >= min && length <= max;
    }
    isFilled(value) {
        return typeof value === 'string' && value.trim().length > 0;
    }
    isValidEmail(value) {
        if (!this.isFilled(value)) {
            return false;
        }
        const email = value.trim();
        let atCount = 0;
        let dotCount = 0;
        for (let index = 0; index < email.length; index += 1) {
            if (email[index] === '@') {
                atCount += 1;
            }
            if (email[index] === '.') {
                dotCount += 1;
            }
        }
        if (atCount !== 1 || dotCount < 1) {
            return false;
        }
        for (let index = 0; index < email.length - 1; index += 1) {
            const current = email[index];
            const next = email[index + 1];
            if ((current === '@' && next === '.') ||
                (current === '.' && next === '@')) {
                return false;
            }
        }
        return true;
    }
    isStrongPassword(password) {
        let hasUppercase = false;
        let hasLowercase = false;
        let hasNumber = false;
        let hasSpecial = false;
        for (const char of password) {
            const code = char.charCodeAt(0);
            const isUppercase = code >= 65 && code <= 90;
            const isLowercase = code >= 97 && code <= 122;
            const isNumber = code >= 48 && code <= 57;
            hasUppercase = hasUppercase || isUppercase;
            hasLowercase = hasLowercase || isLowercase;
            hasNumber = hasNumber || isNumber;
            hasSpecial = hasSpecial || (!isUppercase && !isLowercase && !isNumber);
        }
        return hasUppercase && hasLowercase && hasNumber && hasSpecial;
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AppService);
//# sourceMappingURL=app.service.js.map