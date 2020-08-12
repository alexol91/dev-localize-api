import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { IMember } from '../interfaces/user.interface';
import { User } from './user.model';

export class Member extends User {
  @ApiModelPropertyOptional()
  @IsOptional()
  @IsBoolean()
  admin?: boolean;

  constructor(dbUser: IMember, options: any = {}) {
    super(dbUser, options);
    if (dbUser) { this.admin = dbUser.admin; }
  }
}
