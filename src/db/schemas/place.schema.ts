import * as mongoose from 'mongoose';

import PointSchema from './point.schema';

const schema = new mongoose.Schema({
  address: {type: String, required: [true, 'can\'t be blank']},
  name: {type: String, required: [true, 'can\'t be blank']},
  point: { type: PointSchema, required: true },
  radius: {type: Number, min: 0, required: [true, 'can\'t be blank']},
  type: {type: String, enum: ['home', 'work', 'gym', 'custom'], required: [true, 'can\'t be blank']},

  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

schema.index({ point: '2dsphere' });

schema.virtual('group', {
  ref: 'Group',
  localField: 'groupId',
  foreignField: '_id',
  justOne: true,
});

schema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

schema.set('toJSON', { virtuals: true });
schema.set('toObject', { virtuals: true });

export const PlaceModel = mongoose.model('Place', schema);
export const PlaceSchema = schema;
