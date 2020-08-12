import * as mongoose from 'mongoose';

const schema = new mongoose.Schema({
  enabled: { type: Boolean, required: true },

  alertedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

schema.index({ userId: 1, alertedUserId: 1, groupId: 1 }, {unique: true});

schema.virtual('alertedUser', {
  ref: 'User',
  localField: 'alertedUserId',
  foreignField: '_id',
  justOne: true,
});

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

export const UserAlertModel = mongoose.model('UserAlert', schema);
export const UserAlertSchema = schema;
