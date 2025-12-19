import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
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
import { ParseImageFilePipe } from '../cloudinary/dto/create-cloudinary.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@UseGuards(AccessTokenGuard)
@Controller('places')
export class PlacesController {
  constructor(
    private placesService: PlacesService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMINISTRATOR)
  @Get()
  async getPlaces(
    @Res({ passthrough: true }) response: Response,
    @Query() query: QueryPlaceDTO,
  ) {
    try {
      return await this.placesService.findAllPlaces(query);
    } catch (error: unknown) {
      const e = error as Error;
      throw new BadRequestException(e.message);
    }
  }
  @Post()
  async addPlace(@Body() data: CreatePlacesDTO) {
    const { success, place } = await this.placesService.create(data);
    if (success == false) throw new ConflictException('Place already exist!');
    return {
      place,
      message: 'Success created place',
    };
  }

  @Put(':id')
  async updatePlace(@Param('id') id: string, @Body() data: UpdatePlaceDTO) {
    try {
      const place = await this.placesService.update({ id, data });
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

  @Post(':id/thumbnail')
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async uploadThumbnail(
    @Param('id') id: string,
    @UploadedFile(ParseImageFilePipe) file: Express.Multer.File,
  ) {
    return await this.placesService.uploadThumbnail(id, file);
  }

  @Put(':id/thumbnail')
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async updateThumbnail(
    @Param('id') id: string,
    @UploadedFile(ParseImageFilePipe) file: Express.Multer.File,
  ) {
    return await this.placesService.updateThumbnail(id, file);
  }

  @Post(':id/gallery')
  @UseInterceptors(
    FilesInterceptor('image', 4, { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async uploadGallery(
    @Param('id') id: string,
    @UploadedFiles(ParseImageFilePipe) files: Express.Multer.File[],
  ) {
    return await this.placesService.uploadGallery(id, files);
  }

  @Put(':id/thumbnail')
  @UseInterceptors(
    FilesInterceptor('image', 4, { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async updateGallery(
    @Param('id') id: string,
    @UploadedFiles(ParseImageFilePipe) files: Express.Multer.File[],
  ) {
    return await this.placesService.updateGallery(id, files);
  }
}
