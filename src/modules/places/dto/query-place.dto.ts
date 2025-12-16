import { IsOptional } from 'class-validator';

export class QueryPlaceDTO {
  @IsOptional()
  name?: string;

  @IsOptional()
  page?: string;

  @IsOptional()
  cursor?: string;

  @IsOptional()
  limit?: string;
}
