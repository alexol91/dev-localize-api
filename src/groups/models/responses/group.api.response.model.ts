import { ApiModelProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';

import { ControllerResponse } from '../../../common/models/api.response.model';

import { Group } from '../../../db/models/group.model';

export class GroupControllerResponse extends ControllerResponse {
  @ApiModelProperty()
  @ValidateNested()
  public payload: Group;

  constructor(group: Group) {
    super();
    this.payload = group;
  }
}
