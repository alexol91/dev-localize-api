import { MongoThenMock } from './mongo.then.mock';

export class MongoModelMock {
  constructor(private readonly generator: () => any) {}

  aggregate(...obj) { return new MongoThenMock('aggregate', this.many()); }
  create(...obj) { return new MongoThenMock('create', this.single()); }
  deleteMany(...obj) { return new MongoThenMock('deleteMany', this.deleteResult()); }
  deleteOne(...obj) { return new MongoThenMock('deleteOne', this.deleteResult()); }
  find(...obj) { return new MongoThenMock('find', this.many()); }
  findOne(...obj) { return new MongoThenMock('findOne', this.single()); }
  findById(...obj) { return new MongoThenMock('findById', this.single()); }
  insertMany(...obj) { return new MongoThenMock('insertMany', this.many()); }
  limit(...obj) { return new MongoThenMock('limit', this.many()); }
  populate(...obj) { return new MongoThenMock('populate', this.many()); }
  sort(...obj) { return new MongoThenMock('sort', this.many()); }
  updateOne(...obj) { return new MongoThenMock('updateOne', this.deleteResult()); }

  private single() { return this.generator(); }
  private many() { return [this.generator()]; }
  private deleteResult() { return {n: 1}; }
}
