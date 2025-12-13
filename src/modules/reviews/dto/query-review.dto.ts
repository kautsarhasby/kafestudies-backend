import { IsOptional } from 'class-validator';

export class QueryReviewDTO {
  @IsOptional()
  page?: string;

  @IsOptional()
  limit?: string;

  @IsOptional()
  authorId?: string;
}
