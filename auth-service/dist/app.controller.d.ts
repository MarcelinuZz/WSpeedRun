import { AppService } from './app.service';
import { LoginDto, RegisterDto } from './dto';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    profile(id: string): Promise<{
        user_id: string;
        email: string;
        username: string;
        country: string;
        role: string;
    }>;
}
