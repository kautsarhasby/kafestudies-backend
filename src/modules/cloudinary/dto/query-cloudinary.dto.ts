import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsUrl } from 'class-validator';

export class QueryCloudinaryDto {
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'invalid URL' })
  @Transform(({ value }: { value: string }) => value.trim())
  existedUrl?: string;

  @IsIn(['kafestudies_image'], {
    message: 'folder must be in kafestudies_image',
  })
  folder: string;
}
