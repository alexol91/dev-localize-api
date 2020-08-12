import { ApiModelProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';

import { ControllerResponse } from '../../../common/models/api.response.model';

import { User } from '../../../db/models/user.model';

export class UserControllerResponse extends ControllerResponse {
  @ApiModelProperty()
  @ValidateNested()
  public payload: User;

  constructor(user: User) {
    super();
    this.payload = user;
  }
}
