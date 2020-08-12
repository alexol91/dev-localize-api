import { ObjectId } from 'mongodb';

export class MongoThenMock {
  constructor(private code: string, private readonly response?: any) {}

  aggregate(...obj) { this.code = 'aggregate'; return this; }
  create(...obj) {this.code = 'create'; return this; }
  deleteMany(...obj) { this.code = 'deleteMany'; return this; }
  deleteOne(...obj) { this.code = 'deleteOne'; return this; }
  find(...obj) { this.code = 'find'; return this; }
  findOne(...obj) { this.code = 'findOne'; return this; }
  findById(...obj) { this.code = 'findById'; return this; }
  insertMany(...obj) { this.code = 'insertMany'; return this; }
  limit(...obj) { this.code = 'limit'; return this; }
  populate(...obj) { this.code = 'populate'; return this; }
  sort(...obj) { this.code = 'sort'; return this; }
  updateOne(...obj) { this.code = 'updateOne'; return this; }

  then(func) { return func(this.response); }

  catch(func) {
    switch (this.code) {
      case 'insertMany':
        return func({
          result: {
            nInserted: 1,
            getWriteErrors: () => [],
            getInsertedIds: () => [new ObjectId().toHexString()],
          },
        });
      default:
        return func('Error!');
    }
  }
}
