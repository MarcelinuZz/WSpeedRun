import { Request } from 'express';
import { AppService } from './app.service';
import { CreateCommentDto, CreateRunDto } from './dto';
import { JwtUser } from './jwt.strategy';
type AuthenticatedRequest = Request & {
    user: JwtUser;
};
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    runsByCategory(id: string): Promise<{
        run_duration_text: string;
        category: {
            run_category_id: string;
            run_category_name: string;
        };
        game: {
            game_id: string;
            game_name: string;
            description: string;
        };
        runner: {
            user_id: string;
            username: string;
            email: string;
            country: string;
            role: string;
        };
        run_id: string;
        run_category_id: string;
        user_id: string;
        vod_url: string;
        run_duration: string;
        submitted_at: Date;
        verified_at: Date | null;
        status: string;
    }[]>;
    runsByUser(id: string, request: AuthenticatedRequest): Promise<{
        run_duration_text: string;
        category: {
            run_category_id: string;
            run_category_name: string;
        };
        game: {
            game_id: string;
            game_name: string;
            description: string;
        };
        runner: {
            user_id: string;
            username: string;
            email: string;
            country: string;
            role: string;
        };
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
        category: {
            run_category_id: string;
            game_id: string;
            run_category_name: string;
            game: {
                game_id: string;
                game_name: string;
                description: string;
            };
        };
        game: {
            game_id: string;
            game_name: string;
            description: string;
        };
        runner: {
            user_id: string;
            username: string;
            email: string;
            country: string;
            role: string;
        };
        comments: {
            comment_id: string;
            run_id: string;
            user_id: string;
            user: {
                user_id: string;
                username: string;
                email: string;
                country: string;
                role: string;
            };
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
    createRun(dto: CreateRunDto, request: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    createComment(dto: CreateCommentDto, request: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    deleteComment(id: string, request: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    adminRunsByStatus(status: string): Promise<{
        run_duration_text: string;
        category: {
            run_category_id: string;
            run_category_name: string;
        };
        game: {
            game_id: string;
            game_name: string;
            description: string;
        };
        runner: {
            user_id: string;
            username: string;
            email: string;
            country: string;
            role: string;
        };
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
}
export {};
