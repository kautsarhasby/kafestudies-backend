import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  type Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from '../users/dto/create-user.dto';
import { CookieOptions, type Request, type Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UsersService } from '../users/users.service';

interface RefreshCookies {
  refreshToken?: string; // Use optional property as the cookie might not exist
}
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  private setCookieOptions(isProduction: boolean): CookieOptions {
    return {
      sameSite: isProduction ? 'none' : ('lax' as 'none' | 'lax'),
      secure: isProduction,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    };
  }

  @Post('google')
  async signInGoogle(
    @Body('idToken') idToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const isProduction = process.env.NODE_ENV === 'production';
    const { accessToken, refreshToken, email, name } =
      await this.authService.verifyGoogleToken(idToken);

    const user = await this.usersService.findUserByEmail(email);
    if (!user) throw new BadRequestException('User not found');
    try {
      await this.usersService.createUser({ email, name });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Something went error');
    }

    response.cookie(
      'refreshToken',
      refreshToken,
      this.setCookieOptions(isProduction),
    );

    return { message: 'Successfully signed in wwith Google', accessToken };
  }

  @Post('sign-in')
  async signIn(
    @Body() body: { email: string; password: string },
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const cookies = request.cookies as RefreshCookies;
    const existedTokenCookie = cookies?.['refreshToken'];
    const isProduction = process.env.NODE_ENV === 'production';
    if (existedTokenCookie) {
      try {
        const isValidatedToken =
          await this.authService.validateRefreshToken(existedTokenCookie);
        if (isValidatedToken) {
          throw new UnauthorizedException('User Already Login!');
        }
      } catch (error) {
        this.logger.log(error);
        response.clearCookie(
          'refreshToken',
          this.setCookieOptions(isProduction),
        );
      }
    }
    const { accessToken, refreshToken } = await this.authService.signIn(
      body.email,
      body.password,
    );

    if (accessToken && refreshToken) {
      response.cookie(
        'refreshToken',
        refreshToken,
        this.setCookieOptions(isProduction),
      );
    }
    return { message: 'Successfully signed in', accessToken };
  }

  @Get('verify')
  async verifyEmailThroughLink(
    @Query('token') token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const { accessToken, refreshToken } =
        await this.authService.verifyTokenEmail({ token });

      if (accessToken && refreshToken) {
        const isProduction = process.env.NODE_ENV === 'production';
        response.cookie(
          'refreshToken',
          refreshToken,
          this.setCookieOptions(isProduction),
        );
      }
      response.status(HttpStatus.ACCEPTED);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Something went error');
    }
  }

  @Post('passing-verify')
  async passingVerify(@Param() token: string) {
    const { sub } = await this.authService.decodeToken(token);
    try {
      await this.usersService.updateUser({
        id: sub,
        data: { isVerified: true },
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Something went error');
    }
  }

  @Post('sign-up')
  async signUp(@Body() data: CreateUserDTO) {
    const user = await this.authService.signUp({
      email: data.email,
      name: data.name,
      password: data.password!,
    });
    return {
      statusCode: HttpStatus.CREATED,
      status: true,
      message:
        'Succeed registering your account, please check your email for verification!',
      data: user,
    };
  }
}
