import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PlacesModule } from './modules/places/places.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { MailModule } from './common/mail/mail.module';
import { ReviewModule } from './modules/reviews/reviews.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailModule,
    UsersModule,
    AuthModule,
    CloudinaryModule,
    PrismaModule,
    PlacesModule,
    ReviewModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(
              ({
                level,
                message,
                timestamp,
              }: {
                level: string;
                message: string;
                timestamp: string;
              }) => {
                return `[${timestamp}] ${level}: ${message}`;
              },
            ),
          ),
        }),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
