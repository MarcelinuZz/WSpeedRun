import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { LoginDto, RegisterDto } from './dto';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    this.validateRegister(dto);

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    await this.prisma.user.create({
      data: {
        user_id: randomUUID(),
        username: dto.username.trim(),
        email: dto.email.trim(),
        country: dto.country?.trim() ?? '',
        password: await bcrypt.hash(dto.password, 10),
        role: 'USER',
      },
    });

    return { message: 'Registration successful' };
  }

  async login(dto: LoginDto) {
    if (!this.isFilled(dto.email) || !this.isFilled(dto.password)) {
      throw new BadRequestException('Email and password must be filled');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Email is not registered');
    }

    const validPassword = await bcrypt.compare(dto.password, user.password);
    if (!validPassword) {
      throw new UnauthorizedException('Password is incorrect');
    }

    return {
      access_token: await this.jwtService.signAsync({
        id: user.user_id,
        role: user.role,
      }),
    };
  }

  async profile(id: string) {
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
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private validateRegister(dto: RegisterDto) {
    if (!this.hasLength(dto.username, 4, 40)) {
      throw new BadRequestException(
        'Username must be between 4 and 40 characters long',
      );
    }

    if (!this.isValidEmail(dto.email)) {
      throw new BadRequestException('Email format is invalid');
    }

    if (!this.hasLength(dto.password, 8, 40)) {
      throw new BadRequestException(
        'Password must be between 8 and 40 characters long',
      );
    }

    if (!this.isStrongPassword(dto.password)) {
      throw new BadRequestException(
        'Password must contain uppercase, lowercase, number, and special character',
      );
    }
  }

  private hasLength(value: unknown, min: number, max: number) {
    if (typeof value !== 'string') {
      return false;
    }

    const length = value.trim().length;
    return length >= min && length <= max;
  }

  private isFilled(value: unknown) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  private isValidEmail(value: unknown) {
    if (!this.isFilled(value)) {
      return false;
    }

    const email = (value as string).trim();
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

      if (
        (current === '@' && next === '.') ||
        (current === '.' && next === '@')
      ) {
        return false;
      }
    }

    return true;
  }

  private isStrongPassword(password: string) {
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
}
