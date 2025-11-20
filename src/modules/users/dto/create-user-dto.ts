import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Prisma } from 'generated/prisma/client';

export class CreateUserDTO implements Prisma.UserCreateInput {
  @IsNotEmpty({ message: 'Name cannot empty' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  readonly name: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  @Length(10, 15, { message: 'Phone number at least 10 to 15 characters' })
  readonly phone?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password at least 6 characters' })
  @MaxLength(20)
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password at least contains one capitalize character and one number',
  })
  readonly password: string;
}
