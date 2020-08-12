import * as mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: {type: String, required: [true, 'can\'t be blank']},
}, { timestamps: { createdAt: true, updatedAt: false } });

schema.virtual('code', {
  ref: 'GroupCode',
  localField: '_id',
  foreignField: 'groupId',
  justOne: true,
});

schema.virtual('membership', {
  ref: 'Membership',
  localField: '_id',
  foreignField: 'groupId',
});

schema.virtual('places', {
  ref: 'Place',
  localField: '_id',
  foreignField: 'groupId',
});

schema.set('toJSON', { virtuals: true });
schema.set('toObject', { virtuals: true });

export const GroupModel = mongoose.model('Group', schema);
export const GroupSchema = schema;
