import * as mongoose from 'mongoose';

const schema = new mongoose.Schema({
  enabled: { type: Boolean, required: true },

  placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

schema.index({ userId: 1, placeId: 1 }, {unique: true});

schema.virtual('place', {
  ref: 'Place',
  localField: 'placeId',
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

export const PlaceAlertModel = mongoose.model('PlaceAlert', schema);
export const PlaceAlertSchema = schema;
