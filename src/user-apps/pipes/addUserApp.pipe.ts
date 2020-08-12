import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { IAddUserApp } from '../../db/interfaces/user.app.add.interface';
import { DTOAddUserApp } from '../dto/AddUserApp.dto';

@Injectable()
export class AddUserAppPipe implements PipeTransform {
  constructor(private userId: ObjectId) { }

  transform(value: DTOAddUserApp, metadata?: ArgumentMetadata): IAddUserApp {
    return {
      userId: this.userId,
      ...value,
    };
  }
}
