import { AppService } from './app.service';
import { CreateCategoryDto, CreateGameDto, UpdateCategoryDto, UpdateGameDto } from './dto';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    listGames(): import("@prisma/client").Prisma.PrismaPromise<({
        runCategories: {
            game_id: string;
            run_category_name: string;
            run_category_id: string;
        }[];
    } & {
        game_name: string;
        description: string;
        game_id: string;
    })[]>;
    getGame(id: string): Promise<{
        runCategories: {
            game_id: string;
            run_category_name: string;
            run_category_id: string;
        }[];
    } & {
        game_name: string;
        description: string;
        game_id: string;
    }>;
    getCategory(id: string): Promise<{
        game: {
            game_name: string;
            description: string;
            game_id: string;
        };
    } & {
        game_id: string;
        run_category_name: string;
        run_category_id: string;
    }>;
    createGame(dto: CreateGameDto): Promise<{
        message: string;
    }>;
    updateGame(id: string, dto: UpdateGameDto): Promise<{
        message: string;
    }>;
    deleteGame(id: string): Promise<{
        message: string;
    }>;
    createCategory(dto: CreateCategoryDto): Promise<{
        message: string;
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto): Promise<{
        message: string;
    }>;
    deleteCategory(id: string): Promise<{
        message: string;
    }>;
}
