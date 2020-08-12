import { ApiModelProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';

import { ControllerResponse } from '../../../common/models/api.response.model';

import { Group } from '../../../db/models/group.model';

export class GroupsControllerResponse extends ControllerResponse {
  @ApiModelProperty({ type: [Group]})
  @ValidateNested({each: true})
  public payload: Group[];

  constructor(groups: Group[]) {
    super();
    this.payload = groups;
  }
}
