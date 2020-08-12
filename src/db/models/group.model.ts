import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString, Length } from 'class-validator';

import { IGroup } from '../interfaces/group.interface';
import { Member } from './member.model';

export class Group {
  @ApiModelProperty()
  @IsString()
  readonly id: string;

  @ApiModelProperty()
  @IsDateString()
  readonly createdAt: string;

  @ApiModelProperty()
  @IsString()
  @Length(6, 6)
  readonly joinCode: string;

  @ApiModelProperty()
  @IsString()
  readonly name: string;

  @ApiModelPropertyOptional({ type: [Member]})
  @IsOptional()
  @IsArray()
  users?: Member[];

  constructor(dbGroup: IGroup) {
    if (dbGroup) {
      this.id = dbGroup.id;
      this.createdAt = `${new Date(dbGroup.createdAt).toISOString().split('.')[0]}Z`;
      this.joinCode = dbGroup.code ? dbGroup.code.value : undefined,
      this.name = dbGroup.name;
    }
  }
}
