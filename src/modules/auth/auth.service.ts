import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  type LoggerService,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDTO } from '../users/dto/create-user-dto';
import argon2 from 'argon2';
import { MailService } from 'src/common/mail/mail.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { JWTPayload } from './strategy/access-token.strategy';
import { Role } from '../users/enum/role.enum';

export interface JwtTokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: LoggerService,
  ) {}

  async hashPassword(password: string) {
    return await argon2.hash(password);
  }

  async verifyPassword(hashed: string, password: string) {
    return await argon2.verify(hashed, password);
  }

  async generateJwtTokens(payload: JWTPayload): Promise<JwtTokenResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '1d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  async confirmedUseremail(email: string) {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) throw new NotFoundException('User Not Found');
    if (user.isVerified) throw new BadRequestException('User already verified');
    return await this.usersService.verifiedUser(user.id);
  }

  async verifyTokenEmail({ token }: { token: string }) {
    try {
      const { email } = this.mailService.decodeEmailToken({ token });
      const user = await this.confirmedUseremail(email);
      if (!user) throw new NotFoundException('User not found');
      const { accessToken, refreshToken } = await this.generateJwtTokens({
        email: user.email,
        role: user.role as Role,
        sub: user.id,
        verified: user.isVerified,
      });

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('');
    }
  }

  async signIn(email: string, password: string): Promise<JwtTokenResponse> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) throw new UnauthorizedException('User not exist!');
    const compared = await this.verifyPassword(user.password, password);
    if (!compared) throw new UnauthorizedException('Password not valid!');
    const { accessToken, refreshToken } = await this.generateJwtTokens({
      sub: user.id,
      email,
      role: user.role as Role,
      verified: user.isVerified,
    });

    return { accessToken, refreshToken };
  }

  async signUp(data: CreateUserDTO) {
    const { password } = data;
    const hashedPassword = await this.hashPassword(password);
    try {
      await this.mailService.sendConfirmationEmail({
        email: data.email,
        name: data.name,
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed send email');
    }

    return await this.usersService.createUser({
      ...data,
      password: hashedPassword,
    });
  }
}
