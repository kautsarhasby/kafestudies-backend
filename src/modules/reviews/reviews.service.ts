import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateReviewDTO } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(private prismaService: PrismaService) {}

  async create(data: CreateReviewDTO) {
    try {
      const review = await this.prismaService.review.create({
        data: {
          comment: data.comment,
          rating: data.rating,
          authorId: data.author_id,
        },
      });
      return { review, success: true };
    } catch (error: unknown) {
      const e = error as Error;
      return { success: false, error: e };
    }
  }
}
