import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreatePlacesDTO } from './dto/create-place.dto';
import { UpdatePlaceDTO } from './dto/update-place.dto';
import { Injectable } from '@nestjs/common';
import { QueryPlaceDTO } from './dto/query-place.dto';
import { Prisma } from 'generated/prisma/client';
import slugify from 'slugify';

@Injectable()
export class PlacesService {
  constructor(private prismaService: PrismaService) {}

  private slugPlace(text: string) {
    return slugify(text);
  }

  async findAllPlaces(query: QueryPlaceDTO) {
    const limit = +(query.limit || 10);
    const page = +(query.page || 1);
    const skip = limit * (page - 1);
    const take = limit;
    const where: Prisma.PlaceWhereInput = {
      ...(query.name && {
        name: { contains: query.name, mode: 'insensitive' },
      }),
    };

    const places = await this.prismaService.place.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
    const total = await this.prismaService.place.count({ where });

    return {
      places,
      total,
      limit,
      page,
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
}
