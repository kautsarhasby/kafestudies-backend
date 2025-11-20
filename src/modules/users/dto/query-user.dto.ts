import { IsOptional } from 'class-validator';

export class QueryUserDTO {
  @IsOptional()
  page?: string;

  @IsOptional()
  limit?: string;

  @IsOptional()
  name?: string;
}
