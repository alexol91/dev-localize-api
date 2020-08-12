import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AutocompleteGooglePlace {
  @ApiModelProperty()
  @IsString()
  readonly address: string;

  @ApiModelProperty()
  @IsString()
  readonly name: string;

  @ApiModelProperty()
  @IsString()
  readonly placeId: string;
}
