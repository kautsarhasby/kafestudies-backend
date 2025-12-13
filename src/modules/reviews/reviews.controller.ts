import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { QueryReviewDTO } from './dto/query-review.dto';
import { CreateReviewDTO } from './dto/create-review.dto';
import { Review } from 'generated/prisma/client';
import { UpdateReviewDTO } from './dto/update-review.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { Response } from 'express';

@UseGuards(AccessTokenGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewService: ReviewsService) {}

  @Get()
  async getReviews(
    @Res({ passthrough: true }) response: Response,
    @Query() query: QueryReviewDTO,
  ) {
    try {
      const data = await this.reviewService.findReviews(query);
      response.status(HttpStatus.FOUND);
      return {
        data,
      };
    } catch (error: unknown) {
      const e = error as Error;
      throw new BadRequestException(e.message);
    }
  }

  @Post()
  async createReview(@Body() data: CreateReviewDTO): Promise<Review> {
    const review = await this.reviewService.createReviews(data);
    return review;
  }

  @Put(':id')
  async updateReview(
    @Param('id') id: string,
    @Body() data: UpdateReviewDTO,
  ): Promise<Review> {
    return this.reviewService.updateReview({
      id,
      data,
    });
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.reviewService.deleteReview(id);
  }
}
