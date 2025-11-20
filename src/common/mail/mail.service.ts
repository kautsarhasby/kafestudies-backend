import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { JWTPayload } from 'src/modules/auth/strategy/access-token.strategy';

interface userInfo {
  name: string;
  email: string;
}

@Injectable()
export class MailService {
  private frontendUrl: string;
  constructor(
    private mailerService: MailerService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {
    this.frontendUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:4000'
        : 'https://lokerin-frontend.vercel.app';
  }

  private generateVerifyToken(payload: { email: string }): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_VERIFY_TOKEN_SECRET'),
      expiresIn: '15m',
    });
  }

  private dateFormatter(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day} ${month.toString().padStart(2, '0')}, ${year}`;
  }

  public decodeEmailToken({ token }: { token: string }) {
    try {
      const payload = this.jwtService.verify<JWTPayload>(token, {
        secret: this.configService.get<string>('JWT_VERIFY_TOKEN_SECRET'),
      });
      return {
        email: payload.email,
        role: payload.role,
        id: payload.sub,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Token not found');
    }
  }

  async sendConfirmationEmail(info: userInfo) {
    const token = this.generateVerifyToken({ email: info.email });

    const url = `${this.frontendUrl}/api/auth/verify?token=${token}`;
    const subject = 'Confirm your email';
    const template = this.getEmailConfirmationTemplate(info.name);

    return await this.sendMail({
      context: { ...template, name: info.name, url, subject },
      to: info.email,
      subject,
    });
  }

  async sendMail(params: {
    to: string;
    subject: string;
    context: Record<string, string>;
  }) {
    try {
      const sendMailParams = {
        to: params.to,
        subject: params.subject,
        context: params.context,
      };

      const response = (await this.mailerService.sendMail(
        sendMailParams,
      )) as ISendMailOptions;
      this.logger.log(
        `Email sent successfully to recipients with the following parameters : ${JSON.stringify(
          sendMailParams,
        )}`,
        response,
      );
    } catch (error) {
      this.logger.error(
        `Error while sending mail with the following parameters : ${JSON.stringify(
          params,
        )}`,
        error,
      );
    }
  }

  private getEmailConfirmationTemplate(name: string) {
    return {
      title: `Selamat Datang, ${name}! 🎉`,
      message: 'Terima kasih telah bergabung dengan KafeStudies',
      date: this.dateFormatter(new Date()),
      description:
        'Untuk memulai perjalanan teknologi Anda bersama kami dan mengakses semua fitur eksklusif, silakan verifikasi alamat email Anda dengan menekan tombol di bawah ini.',
    };
  }
}
