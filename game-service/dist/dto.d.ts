export declare class CreateGameDto {
    game_name: string;
    description: string;
}
export declare class UpdateGameDto {
    game_name?: string;
    description?: string;
}
export declare class CreateCategoryDto {
    game_id: string;
    run_category_name: string;
}
export declare class UpdateCategoryDto {
    game_id?: string;
    run_category_name?: string;
}
