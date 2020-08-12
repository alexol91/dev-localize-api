import { ApiModelProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class DTOTogglePlaceAlert {
  @ApiModelProperty()
  @IsBoolean()
  readonly enabled: boolean;
}
