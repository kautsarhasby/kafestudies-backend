import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Inject,
  type Logger,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from '../users/dto/create-user-dto';
import type { Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  @Post('sign-in')
  async signIn(@Body() body: { email: string; password: string }) {
    return await this.authService.signIn(body.email, body.password);
  }

  @Post('verify')
  async verifyEmailThroughLink(
    @Query('token') token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      await this.authService.verifyTokenEmail({ token });
      response.status(HttpStatus.ACCEPTED);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Something went error');
    }
  }

  @Post('sign-up')
  async signUp(@Body() data: CreateUserDTO) {
    const user = await this.authService.signUp(data);
    return {
      statusCode: HttpStatus.CREATED,
      status: true,
      message:
        'Succeed registering your account, please check your email for verification!',
      data: user,
    };
  }
}
