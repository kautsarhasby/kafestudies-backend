import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export const Cloudinary: Provider = {
  provide: 'CLOUDINARY',
  useFactory: (configService: ConfigService) => {
    cloudinary.config({
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
    });
    return cloudinary;
  },
  inject: [ConfigService],
};
