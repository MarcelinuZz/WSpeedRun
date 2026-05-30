import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGameDto {
  @ApiProperty()
  game_name: string;

  @ApiProperty()
  description: string;
}

export class UpdateGameDto {
  @ApiPropertyOptional()
  game_name?: string;

  @ApiPropertyOptional()
  description?: string;
}

export class CreateCategoryDto {
  @ApiProperty()
  game_id: string;

  @ApiProperty()
  run_category_name: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional()
  game_id?: string;

  @ApiPropertyOptional()
  run_category_name?: string;
}
