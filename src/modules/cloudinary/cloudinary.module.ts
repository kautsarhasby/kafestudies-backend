import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { Cloudinary as CloudinaryProvider } from './config/cloudinary.config';
import { CloudinaryController } from './cloudinary.controller';

@Module({
  imports: [HttpModule],
  providers: [CloudinaryProvider, CloudinaryService],
  controllers: [CloudinaryController],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}
