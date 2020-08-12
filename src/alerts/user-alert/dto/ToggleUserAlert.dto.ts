import { ApiModelProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class DTOToggleUserAlert {
  @ApiModelProperty()
  @IsBoolean()
  readonly enabled: boolean;
}
