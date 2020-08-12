import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Document, Model } from 'mongoose';

export const ERRORS = {
  FAILEDUPDATE: new InternalServerErrorException('Failed to update document.'),
  DUPLICATE: new ForbiddenException('Document can\'t have duplicates.'),
};

@Injectable()
export class MongoService<T extends Document> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  aggregateAddFields(fields: any) {
    return { $addFields: fields };
  }

  aggregateGeoNearMax(coordinates: [number, number], maxDistance: number) {
    return { $geoNear: {
      near: { type: 'Point', coordinates },
      maxDistance,
      distanceField: 'distance',
      spherical: true,
    }};
  }

  aggregateGeoNearMin(coordinates: [number, number], minDistance: number) {
    return { $geoNear: {
      near: { type: 'Point', coordinates },
      minDistance,
      distanceField: 'distance',
      spherical: true,
    }};
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

  aggregateUnwind(path: string, preserveNullAndEmptyArrays = false) {
    return { $unwind: { path, preserveNullAndEmptyArrays } };
  }

  aggregate(aggregations: any[], justOne = false): Promise<any> {
    return new Promise((resolve, reject) =>
      this.model.aggregate(aggregations)
        .then((result) => resolve(justOne ? (result.length !== 0 ? result[0] : undefined) : result))
        .catch((err) => reject(this.formatError(err))));
  }

  create<Y>(dto: Y): Promise<T> {
    return new Promise((resolve, reject) =>
      this.model.create(dto)
        .then((result) => resolve(result))
        .catch((err) => reject(this.formatError(err))));
  }

  deleteMany(query: any): Promise<number> {
    return new Promise((resolve, reject) =>
      this.model.deleteMany(query)
        .then((result) => resolve(result.n || 0))
        .catch((err) => reject(this.formatError(err))));
  }

  deleteOne(query: any): Promise<number> {
    return new Promise((resolve, reject) =>
      this.model.deleteOne(query)
        .then((result) => resolve(result.n || 0))
        .catch((err) => reject(this.formatError(err))));
  }

  findMany(query: any): Promise<T[]> {
    return new Promise((resolve, reject) =>
      this.model.find(query)
        .then((doc) => resolve(doc))
        .catch((err) => reject(this.formatError(err))));
  }

  findOne(query: any = {}): Promise<T> {
    return new Promise((resolve, reject) =>
      this.model.findOne(query)
        .then((doc) => resolve(doc || undefined))
        .catch((err) => reject(this.formatError(err))));
  }

  insertMany(data, options: any = {}): Promise<T[]> {
    return new Promise((resolve, reject) =>
      this.model.insertMany(data, options)
        .then((result) => resolve(result))
        .catch((err) => reject(this.formatError(err))));
  }

  updateMany<Y>(query: any, dto: Y, upsert = false): Promise<number> {
    return new Promise((resolve, reject) =>
      this.model.updateMany(query, dto, {upsert})
        .then((result) => resolve(result.n || 0))
        .catch((err) => reject(this.formatError(err))));
  }

  updateOne<Y>(query: any, dto: Y, upsert = false): Promise<number> {
    return new Promise((resolve, reject) =>
      this.model.updateOne(query, dto, {upsert})
        .then((result) => result.n === 1 ? resolve() : reject(ERRORS.FAILEDUPDATE))
        // .then((result) => resolve(result.n || 0))
        .catch((err) => reject(this.formatError(err))));
  }

  protected formatError(error) {
    switch (error.code) {
      case 11000:
        return error.result ? error : ERRORS.DUPLICATE;
      default:
        return error;
    }
  }
}
