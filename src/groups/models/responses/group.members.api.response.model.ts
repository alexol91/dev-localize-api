import { ApiModelProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';

import { ControllerResponse } from '../../../common/models/api.response.model';

import { User } from '../../../db/models/user.model';

export class GroupMembersControllerResponse extends ControllerResponse {
  @ApiModelProperty({ type: [User]})
  @ValidateNested({each: true})
  public payload: User[];

  constructor(members: User[]) {
    super();
    this.payload = members;
  }
}
