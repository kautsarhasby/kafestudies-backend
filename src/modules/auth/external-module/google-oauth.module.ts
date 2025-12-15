import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export const GOOGLE_OAUTH_CLIENT = 'GOOGLE_OAUTH_CLIENT';
@Module({
  providers: [
    {
      provide: GOOGLE_OAUTH_CLIENT,
      useFactory: (configService: ConfigService) => {
        return new OAuth2Client(configService.get<string>('GOOGLE_CLIENT_ID'));
      },
      inject: [ConfigService],
    },
  ],
  exports: [GOOGLE_OAUTH_CLIENT],
})
export class GoogleOAuthModule {}
