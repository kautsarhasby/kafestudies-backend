import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReviewDTO {
  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @IsNotEmpty()
  @IsString()
  author_id: string;
}
