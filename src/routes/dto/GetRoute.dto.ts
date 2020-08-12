import { ApiModelProperty } from '@nestjs/swagger';
import { IsISO8601 } from 'class-validator';

export class DTOGetRoute {
  @ApiModelProperty()
  @IsISO8601()
  readonly date: string;
}
