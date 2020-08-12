import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DTOLogoutApp {
  @ApiModelProperty()
  @IsString()
  readonly registrationToken: string;

}
