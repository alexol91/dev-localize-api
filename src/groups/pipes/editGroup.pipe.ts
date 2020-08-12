import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { UsersService } from '../../db/services/users.service';

import { IEditGroup } from '../../db/interfaces/group.edit.interface';
import { DTOEditGroup } from '../dto/EditGroup.dto';

@Injectable()
export class EditGroupPipe implements PipeTransform {
  constructor(private usersService: UsersService, private userId: ObjectId) {}

  async transform(value: DTOEditGroup, metadata?: ArgumentMetadata): Promise<IEditGroup> {
    const formattedDto: any = {};
    if (value.name) { formattedDto.name = value.name; }
    if (value.userIds) { formattedDto.userIds = await this.getUserIds(value.userIds); }
    return formattedDto;
  }

  private getUserIds(uids: string[]): Promise<ObjectId[]> {
    return new Promise((resolve, reject) =>
      this.usersService.findMany({uid: { $in: uids }})
        .then((users) => resolve(users.filter((u) => u.id !== this.userId.toHexString())
          .map((u) => new ObjectId(u.id))))
        .catch((err) => reject(err)));
  }
}
