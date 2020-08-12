import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

import { IAddGroup } from '../../db/interfaces/group.add.interface';
import { DTOAddGroup } from '../dto/AddGroup.dto';

@Injectable()
export class AddGroupPipe implements PipeTransform {
  transform(value: DTOAddGroup, metadata?: ArgumentMetadata): IAddGroup {
    return { ...value };
  }
}
