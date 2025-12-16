import * as library from '@prisma/client/runtime/library';
import { IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Prisma } from 'generated/prisma/client';

export class CreatePlacesDTO implements Prisma.PlaceCreateInput {
  @IsNotEmpty()
  @IsString()
  @Min(2)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Min(2)
  slug: string;

  @IsNotEmpty()
  openHours: library.InputJsonValue;

  @IsOptional()
  @IsString()
  thumbnailUrl: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  facilities: string[];

  @IsNotEmpty()
  @IsString()
  contact: string;

  @IsNotEmpty()
  @IsString()
  maps: string;

  @IsNotEmpty()
  @IsString()
  url: string;
}
