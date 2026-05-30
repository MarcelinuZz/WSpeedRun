import { ConfigService } from '@nestjs/config';
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
export declare class AppService {
    private readonly prisma;
    private readonly authServiceUrl;
    private readonly gameServiceUrl;
    constructor(prisma: PrismaService, config: ConfigService);
    runsByCategory(categoryId: string): Promise<{
        run_duration_text: string;
        category: {
            run_category_id: string;
            run_category_name: string;
        };
        game: Game;
        runner: UserProfile;
        run_id: string;
        run_category_id: string;
        user_id: string;
        vod_url: string;
        run_duration: string;
        submitted_at: Date;
        verified_at: Date | null;
        status: string;
    }[]>;
    runsByUser(userId: string, authUser: JwtUser): Promise<{
        run_duration_text: string;
        category: {
            run_category_id: string;
            run_category_name: string;
        };
        game: Game;
        runner: UserProfile;
        run_id: string;
        run_category_id: string;
        user_id: string;
        vod_url: string;
        run_duration: string;
        submitted_at: Date;
        verified_at: Date | null;
        status: string;
    }[]>;
    getRun(id: string): Promise<{
        run_duration_text: string;
        category: Category;
        game: Game;
        runner: UserProfile;
        comments: {
            comment_id: string;
            run_id: string;
            user_id: string;
            user: UserProfile;
            comment: string;
            created_at: Date;
        }[];
        run_id: string;
        run_category_id: string;
        user_id: string;
        vod_url: string;
        run_duration: string;
        submitted_at: Date;
        verified_at: Date | null;
        status: string;
    }>;
    createRun(dto: CreateRunDto, authUser: JwtUser): Promise<{
        message: string;
    }>;
    createComment(dto: CreateCommentDto, authUser: JwtUser): Promise<{
        message: string;
    }>;
    deleteComment(id: string, authUser: JwtUser): Promise<{
        message: string;
    }>;
    adminRunsByStatus(status: string): Promise<{
        run_duration_text: string;
        category: {
            run_category_id: string;
            run_category_name: string;
        };
        game: Game;
        runner: UserProfile;
        run_id: string;
        run_category_id: string;
        user_id: string;
        vod_url: string;
        run_duration: string;
        submitted_at: Date;
        verified_at: Date | null;
        status: string;
    }[]>;
    acceptRun(id: string): Promise<{
        message: string;
    }>;
    rejectRun(id: string): Promise<{
        message: string;
    }>;
    private formatRun;
    private serializeRun;
    private ensureRunExists;
    private getCategory;
    private getUser;
    private normalizeStatus;
    private parseDuration;
    private formatDuration;
    private isFilled;
}
export {};
