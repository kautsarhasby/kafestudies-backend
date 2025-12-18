import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
@Injectable()
export class ParseImageFilePipe implements PipeTransform {
  private readonly allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
  private readonly maxSize = 5 * 1024 * 1024;
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) throw new BadRequestException('File is required');
    if (!this.allowedMimeTypes.includes(file.mimetype))
      throw new BadRequestException('Only JPG, JPEG or PNG image are allowed');
    if (file.size > this.maxSize)
      throw new BadRequestException('Image must under 5MB');
    return file;
  }
}
