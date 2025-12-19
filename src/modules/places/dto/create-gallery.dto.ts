import { IsOptional, IsString } from 'class-validator';

export class CreateGalleryDTO {
  @IsOptional()
  @IsString()
  url: string;

  @IsString()
  placeId: string;

  @IsOptional()
  @IsString()
  publicId?: string | null | undefined;
}
