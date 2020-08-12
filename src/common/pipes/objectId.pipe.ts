import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

const ERRORS = {
  INVALIDID: new BadRequestException('Id must be 12 hex or 24 byte long string.'),
};

@Injectable()
export class ObjectIdPipe implements PipeTransform {
  transform(id: string | number | ObjectId, metadata?: ArgumentMetadata): ObjectId {
    try {
      return new ObjectId(id);
    } catch (error) { throw ERRORS.INVALIDID; }
  }
}
