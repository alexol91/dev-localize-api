import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IDeviceSettings } from '../interfaces/device.settings.interface';

export class DeviceSettings {
  @ApiModelPropertyOptional()
  @IsString()
  readonly backgroundRefresh?: string;

  @ApiModelPropertyOptional()
  @IsString()
  readonly forceClose?: string;

  @ApiModelPropertyOptional()
  @IsString()
  readonly locationPermissions?: string;

  @ApiModelPropertyOptional()
  @IsString()
  readonly locationServices?: string;

  @ApiModelPropertyOptional()
  @IsString()
  readonly powerSaveMode?: string;

  constructor(dbSettings: IDeviceSettings) {
    this.backgroundRefresh = dbSettings ? dbSettings.backgroundRefresh : undefined;
    this.forceClose = dbSettings ? dbSettings.forceClose : undefined;
    this.locationPermissions = dbSettings ? dbSettings.locationPermissions : undefined;
    this.locationServices = dbSettings ? dbSettings.locationServices : undefined;
    this.powerSaveMode = dbSettings ? dbSettings.powerSaveMode : undefined;
  }
}
