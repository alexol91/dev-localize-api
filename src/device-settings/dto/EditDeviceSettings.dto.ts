import { ApiModelProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

enum Setting { disabled = '0', enabled = '1' }

export class DTOEditDeviceSettings {
  @ApiModelProperty()
  @IsEnum(Setting)
  readonly backgroundRefresh?: Setting;

  @ApiModelProperty()
  @IsEnum(Setting)
  forceClose?: Setting;

  @ApiModelProperty()
  @IsEnum(Setting)
  locationPermissions?: Setting;

  @ApiModelProperty()
  @IsEnum(Setting)
  locationServices?: Setting;

  @ApiModelProperty()
  @IsEnum(Setting)
  powerSaveMode?: Setting;
}
