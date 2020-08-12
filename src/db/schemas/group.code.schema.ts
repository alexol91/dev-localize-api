import * as mongoose from 'mongoose';

const schema = new mongoose.Schema({
  value: { type: String, unique: true, required: [true, 'can\'t be blank'] },

  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

schema.virtual('group', {
  ref: 'Group',
  localField: 'groupId',
  foreignField: '_id',
  justOne: true,
});

schema.set('toJSON', { virtuals: true });
schema.set('toObject', { virtuals: true });

export const GroupCodeModel = mongoose.model('GroupCode', schema);
export const GroupCodeSchema = schema;
