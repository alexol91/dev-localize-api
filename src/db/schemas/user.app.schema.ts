import * as mongoose from 'mongoose';

const schema = new mongoose.Schema({
  registrationToken: { type: String, required: true, unique: true },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

schema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

schema.set('toJSON', { virtuals: true });
schema.set('toObject', { virtuals: true });

export const UserAppModel = mongoose.model('UserApp', schema);
export const UserAppSchema = schema;
