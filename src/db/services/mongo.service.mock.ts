export class MongoServiceMock {
  constructor(private readonly generator: () => any) {}

  aggregateAddFields(fields: any) {
    return { $addFields: fields };
  }

  aggregateLimit(limit: number) {
    return { $limit: limit };
  }

  aggregateLookup(from: string, as: string, letObj?: any, pipeline?: any[]) {
    const lookupObj: any = { from, as };
    if (letObj) { lookupObj.let = letObj; }
    if (pipeline) { lookupObj.pipeline = pipeline; }
    return { $lookup: lookupObj };
  }

  aggregateMatch(match: any) {
    return { $match: match };
  }

  aggregatePipeline(...steps: any[]) {
    return steps;
  }

  aggregateReplaceRoot(path: string) {
    return { $replaceRoot: { newRoot: path } };
  }

  aggregateSort(sortObj: any) {
    return { $sort: sortObj };
  }

  aggregateUnwind(path: string) {
    return { $unwind: path };
  }

  aggregate(aggregations: any[]): Promise<any> {
    return new Promise((resolve, reject) => resolve([this.generator()]));
  }

  create(obj: any): Promise<any> {
    return new Promise((resolve, reject) => resolve({}));
  }

  deleteMany(query: any): Promise<number> {
    return new Promise((resolve, reject) => resolve(1));
  }

  deleteOne(query: any): Promise<number> {
    return new Promise((resolve, reject) => resolve(1));
  }

  findMany(query: any, populate?: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => resolve([this.generator()]));
  }

  findOne(query: any, populate?: any[]): Promise<any> {
    return new Promise((resolve, reject) => resolve(this.generator()));
  }

  insertMany(data: any, options: any = {}): Promise<any[]> {
    return new Promise((resolve, reject) => resolve([this.generator()]));
  }

  updateMany(query: any, dto: any): Promise<number> {
    return new Promise((resolve, reject) => resolve(1));
  }

  updateOne(query: any, dto: any): Promise<number> {
    return new Promise((resolve, reject) => resolve(1));
  }
}
