import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { HttpService } from '@nestjs/axios';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseImageFilePipe } from './dto/create-cloudinary.dto';
import { QueryCloudinaryDto } from './dto/query-cloudinary.dto';
import { UploadApiResponse } from 'cloudinary';

@Controller('upload')
export class CloudinaryController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly httpService: HttpService,
  ) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async uploadImage(
    @UploadedFile(ParseImageFilePipe) file: Express.Multer.File,
    @Query() query: QueryCloudinaryDto,
  ) {
    const { folder, existedUrl } = query;
    const existedPublicId = existedUrl
      ? this.cloudinaryService.extractPublicId(existedUrl)
      : undefined;
    const { secure_url, public_id, created_at } =
      (await this.cloudinaryService.uploadFile({
        file,
        folder,
        public_id: existedPublicId,
      })) as UploadApiResponse;

    return {
      message: `Image uploaded to ${folder} successfully`,
      secureUrl: secure_url,
      publicId: public_id,
      createdAt: created_at,
    };
  }
}
