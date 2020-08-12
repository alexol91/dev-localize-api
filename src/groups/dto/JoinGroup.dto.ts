import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class DTOJoinGroup {
  @ApiModelProperty()
  @IsString()
  @Length(6, 6)
  readonly joinCode: string;
}
