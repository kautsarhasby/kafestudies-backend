import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AccessControlService } from '../auth/shared/access-control.service';

@Module({
  imports: [PrismaModule],
  controllers: [PlacesController],
  providers: [PlacesService, AccessControlService],
  exports: [PlacesService],
})
export class PlacesModule {}
