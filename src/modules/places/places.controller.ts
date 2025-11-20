import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreatePlacesDTO } from './dto/create-place.dto';
import { PlacesService } from './places.service';
import type { Response } from 'express';
import { QueryPlaceDTO } from './dto/query-place.dto';
import { UpdatePlaceDTO } from './dto/update-place.dto';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../users/enum/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';

@UseGuards(AccessTokenGuard)
@Controller('places')
export class PlacesController {
  constructor(private placesService: PlacesService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMINISTRATOR)
  @Get()
  async getPlaces(
    @Res({ passthrough: true }) response: Response,
    @Query() query: QueryPlaceDTO,
  ) {
    try {
      const data = await this.placesService.findAllPlaces(query);
      response.status(HttpStatus.FOUND);
      return {
        data,
      };
    } catch (error: unknown) {
      const e = error as Error;
      throw new BadRequestException(e.message);
    }
  }

  @Post()
  async addPlace(
    @Body() data: CreatePlacesDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { success, place } = await this.placesService.create(data);
    if (success == false) throw new ConflictException('Place already exist!');
    response.status(HttpStatus.CREATED);
    return {
      place,
      message: 'Success created place',
    };
  }

  @Patch(':id')
  async updatePlace(
    @Param('id') id: string,
    @Body() data: UpdatePlaceDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const place = await this.placesService.update({ id, data });
      response.status(HttpStatus.OK);
      return {
        place,
        message: 'Success',
      };
    } catch (error: unknown) {
      throw new BadRequestException(error);
    }
  }

  @Delete(':id')
  async removePlace(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      await this.placesService.delete(id);
      response.status(HttpStatus.OK);
      return {
        message: 'Succeed delete place',
      };
    } catch (error: unknown) {
      throw new BadRequestException(error);
    }
  }
}
