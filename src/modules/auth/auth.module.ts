import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/common/mail/mail.module';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from './strategy/access-token.strategy';
import { AccessControlService } from './shared/access-control.service';
import { RefreshTokenStrategy } from './strategy/refresh-token.strategy';
import { GoogleOAuthModule } from './external-module/google-oauth.module';

@Module({
  imports: [
    JwtModule.register({}),
    PassportModule,
    UsersModule,
    MailModule,
    GoogleOAuthModule,
  ],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AccessControlService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
