import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MailModule } from 'src/common/mail/mail.module';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from './strategy/access-token.strategy';
import { AccessControlService } from './shared/access-control.service';
import { RefreshTokenStrategy } from './strategy/refresh-token.strategy';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export const GOOGLE_OAUTH_CLIENT = 'GOOGLE_OAUTH_CLIENT';
@Module({
  imports: [
    JwtModule.register({}),
    ConfigModule,
    PassportModule,
    UsersModule,
    MailModule,
  ],
  providers: [
    {
      provide: GOOGLE_OAUTH_CLIENT,
      useFactory: (configService: ConfigService) => {
        return new OAuth2Client(configService.get<string>('GOOGLE_CLIENT_ID'));
      },
      inject: [ConfigService],
    },
    JwtService,
    ConfigService,
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AccessControlService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
