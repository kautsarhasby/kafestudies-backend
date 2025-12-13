import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateReviewDTO } from './dto/create-review.dto';
import { QueryReviewDTO } from './dto/query-review.dto';
import { Prisma, Review } from 'generated/prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prismaService: PrismaService) {}

  async findReviews(query: QueryReviewDTO) {
    const page = +(query.page || 1);
    const limit = +(query.limit || 10);
    const skip = (page - 1) * limit;
    const take = limit;
    const where: Prisma.ReviewWhereInput = {
      ...(query.authorId && {
        authorId: query.authorId,
      }),
    };

    const reviews = await this.prismaService.review.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const userCount = await this.prismaService.review.count({ where });
    return {
      reviews,
      page,
      limit,
      total: userCount,
    };
  }

  async createReviews(data: CreateReviewDTO) {
    const review = await this.prismaService.review.create({
      data: { ...data },
    });
    return review;
  }

  async updateReview(params: {
    id: string;
    data: Prisma.ReviewUpdateInput;
  }): Promise<Review> {
    const { data, id } = params;
    return await this.prismaService.review.update({
      where: { authorId: id },
      data,
    });
  }

  async deleteReview(id: string): Promise<Review> {
    const deletedAt = new Date();
    return await this.prismaService.review.update({
      where: { authorId: id },
      data: { deletedAt },
    });
  }
}
