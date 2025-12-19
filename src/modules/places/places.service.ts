import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreatePlacesDTO } from './dto/create-place.dto';
import { UpdatePlaceDTO } from './dto/update-place.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryPlaceDTO } from './dto/query-place.dto';
import { Prisma, Image } from 'generated/prisma/client';
import slugify from 'slugify';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class PlacesService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  private slugPlace(text: string) {
    return slugify(text);
  }

  async findAllPlaces(query: QueryPlaceDTO) {
    const take = +(query.limit ?? 10);
    const where: Prisma.PlaceWhereInput = {
      ...(query.name && {
        name: { contains: query.name, mode: 'insensitive' },
      }),
    };

    const places = await this.prismaService.place.findMany({
      where,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      skip: query.cursor ? 1 : 0,
      take,
      orderBy: { createdAt: 'desc' },
    });
    return {
      places,
      nextCursor: places.at(-1)?.id ?? null,
    };
  }

  async create(data: CreatePlacesDTO) {
    try {
      const slug = this.slugPlace(data.name);
      const place = await this.prismaService.place.create({
        data: { ...data, slug },
      });
      return { place, success: true };
    } catch (error: unknown) {
      const e = error as Error;
      return { success: false, error: e };
    }
  }

  async update(params: { id: string; data: UpdatePlaceDTO }) {
    const slug = this.slugPlace(params.data.name!);
    const place = await this.prismaService.place.update({
      where: { id: params.id },
      data: { ...params.data, slug },
    });

    return place;
  }

  async updateRating(params: {
    id: string;
    userId: string;
    rating: number;
    comment: string;
  }) {
    const user = await this.prismaService.place.update({
      data: { rating: params.rating },
      where: { id: params.id, createdById: params.userId },
    });

    return user;
  }

  async delete(id: string) {
    const now = new Date();
    const place = await this.prismaService.place.update({
      where: { id },
      data: { deletedAt: now },
    });

    return place;
  }

  // for retrieve public id thumbnail from place
  async getThumbnailPublicId(id: string): Promise<string | null> {
    const place = await this.prismaService.place.findUnique({
      where: { id },
    });
    return place?.publicId ?? null;
  }

  // for retrieve public id gallery from place
  async getGalleryPublicId(id: string): Promise<Image[] | null> {
    const place = await this.prismaService.place.findUnique({
      where: { id },
      include: { gallery: true },
    });

    return place?.gallery ?? null;
  }

  // for upload thumbnail
  async uploadThumbnail(id: string, file: Express.Multer.File) {
    const { secure_url, public_id } = (await this.cloudinaryService.uploadFile({
      file,
      folder: 'kafestudies/thumbnail',
    })) as UploadApiResponse;

    return await this.prismaService.place.update({
      where: { id },
      data: { thumbnail: secure_url, publicId: public_id },
    });
  }

  // for update thumbnail
  async updateThumbnail(id: string, file: Express.Multer.File) {
    const existedPublicId = await this.getThumbnailPublicId(id);
    if (!existedPublicId)
      throw new BadRequestException('Cannot found public_id');
    const { secure_url, public_id } = (await this.cloudinaryService.uploadFile({
      file,
      folder: 'kafestudies/thumbnail',
      public_id: existedPublicId,
    })) as UploadApiResponse;

    return await this.prismaService.place.update({
      where: { id },
      data: { thumbnail: secure_url, publicId: public_id },
    });
  }

  // for upload gallery (multiple images)
  async uploadGallery(id: string, files: Express.Multer.File[]) {
    const uploads = await Promise.all(
      files.map((file) =>
        this.cloudinaryService.uploadFile({
          file,
          folder: 'kafestudies/gallery',
        }),
      ),
    );

    return await this.prismaService.image.createMany({
      data: uploads.map((u: UploadApiResponse) => ({
        placeId: id,
        url: u.secure_url,
        publicId: u.public_id,
      })),
    });
  }

  // for update gallery (multiple images)
  async updateGallery(id: string, files: Express.Multer.File[]) {
    const existedPublicId = await this.getGalleryPublicId(id);
    if (!existedPublicId)
      throw new BadRequestException('Cannot found public_id');
    const uploads = await Promise.all(
      files.map((file, i) =>
        this.cloudinaryService.uploadFile({
          file,
          folder: 'kafestudies/gallery',
          public_id: existedPublicId[i].publicId!,
        }),
      ),
    );

    return await Promise.all(
      uploads.map((u: UploadApiResponse, i) =>
        this.prismaService.image.update({
          where: { id: existedPublicId[i].id },
          data: { url: u.secure_url, publicId: u.public_id },
        }),
      ),
    );
  }
}
