import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DTOAddUserApp {
  @ApiModelProperty()
  @IsString()
  readonly registrationToken: string;

}
