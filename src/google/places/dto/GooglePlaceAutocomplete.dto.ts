import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DTOGooglePlaceAutocomplete {
  @ApiModelProperty()
  @IsString()
  readonly sessiontoken: string;

  @ApiModelProperty()
  @IsString()
  readonly text: string;

  @ApiModelPropertyOptional()
  @IsOptional()
  @IsNumber()
  readonly lat?: number;

  @ApiModelPropertyOptional()
  @IsOptional()
  @IsNumber()
  readonly lon?: number;
}
