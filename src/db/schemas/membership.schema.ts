import * as mongoose from 'mongoose';

const schema = new mongoose.Schema({
  admin: { type: Boolean },

  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: true } });

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

export const MembershipModel = mongoose.model('Membership', schema);
export const MembershipSchema = schema;
