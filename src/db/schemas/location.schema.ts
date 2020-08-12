import * as mongoose from 'mongoose';

import PointSchema from './point.schema';

const schema = new mongoose.Schema({
  accuracy: {type: Number, min: 0},
  point: { type: PointSchema, required: true },
  timestamp: { type: Date, required: [true, 'can\'t be blank']},

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

schema.index({ userId: 1, timestamp: 1 }, {unique: true});
schema.index({ point: '2dsphere' });

schema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

schema.set('toJSON', { virtuals: true });
schema.set('toObject', { virtuals: true });

export const LocationModel = mongoose.model('Location', schema);
export const LocationSchema = schema;
