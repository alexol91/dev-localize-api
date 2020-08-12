import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DTOAddGroup {
  @ApiModelProperty()
  @IsString()
  readonly name: string;
}
