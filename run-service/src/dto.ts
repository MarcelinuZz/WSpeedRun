import { ApiProperty } from '@nestjs/swagger';

export class CreateRunDto {
  @ApiProperty()
  run_category_id: string;

  @ApiProperty()
  vod_url: string;

  @ApiProperty()
  run_duration: number;
}

export class CreateCommentDto {
  @ApiProperty()
  run_id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  comment: string;
}
