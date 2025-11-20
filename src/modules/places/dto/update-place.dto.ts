import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePlacesDTO } from './create-place.dto';

export class UpdatePlaceDTO extends PartialType(
  OmitType(CreatePlacesDTO, ['slug']),
) {}
