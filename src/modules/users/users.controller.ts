import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'generated/prisma/client';
import { CreateUserDTO } from './dto/create-user-dto';
import { QueryUserDTO } from './dto/query-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async findAllUsers(@Query() query: QueryUserDTO) {
    const users = await this.userService.findUsers(query);
    return users;
  }

  @Get(':id')
  async findUserById(@Param('id') id: string) {
    const users = await this.userService.findUserById(id);
    return users;
  }

  @Post()
  async createUser(@Body() userData: CreateUserDTO): Promise<User> {
    const user = await this.userService.createUser(userData);
    return user;
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: UpdateUserDTO,
  ): Promise<User> {
    return this.userService.updateUser({
      id,
      data,
    });
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.userService.deleteUser(id);
  }
}
