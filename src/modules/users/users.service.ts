import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { QueryUserDTO } from './dto/query-user.dto';
import { Prisma, User } from 'generated/prisma/client';
import { CreateUserDTO } from './dto/create-user-dto';

@Injectable()
export class UsersService {
  constructor(protected prismaService: PrismaService) {}

  async findUsers(query: QueryUserDTO) {
    const page = +(query.page || 1);
    const limit = +(query.limit || 10);
    const skip = (page - 1) * limit;
    const take = limit;
    const where: Prisma.UserWhereInput = {
      ...(query.name && {
        name: { contains: query.name, mode: 'insensitive' },
      }),
    };

    const users = await this.prismaService.user.findMany({
      where,
      omit: { password: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const userCount = await this.prismaService.user.count({ where });
    return {
      users,
      page,
      limit,
      total: userCount,
    };
  }

  async findUserById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      omit: { password: true },
    });
    return user;
  }

  async findUserByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    return user;
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: { phone },
    });
    return user;
  }

  async createUser(userData: CreateUserDTO) {
    const user = await this.prismaService.user.create({
      data: { ...userData },
    });
    return user;
  }

  async verifiedUser(id: string) {
    const user = await this.prismaService.user.update({
      where: { id },
      data: { isVerified: true },
    });

    return user;
  }

  async updateUser(params: {
    id: string;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { data, id } = params;
    return await this.prismaService.user.update({ where: { id }, data });
  }

  async deleteUser(id: string): Promise<User> {
    const deletedAt = new Date();
    return await this.prismaService.user.update({
      where: { id },
      data: { deletedAt },
    });
  }
}
