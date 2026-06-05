import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './dto';
import { PrismaService } from './prisma.service';
export declare class AppService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    profile(id: string): Promise<{
        username: string;
        email: string;
        country: string;
        role: string;
    }>;
    private validateRegister;
    private hasLength;
    private isFilled;
    private isValidEmail;
    private isStrongPassword;
}
