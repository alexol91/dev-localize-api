import * as mongoose from 'mongoose';

const schema = new mongoose.Schema({
  uid: {type: String, required: [true, 'can\'t be blank'], unique: true},
});

schema.virtual('apps', {
  ref: 'UserApp',
  localField: '_id',
  foreignField: 'userId',
});

schema.virtual('deviceSettings', {
  ref: 'DeviceSettings',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

schema.virtual('locations', {
  ref: 'Location',
  localField: '_id',
  foreignField: 'userId',
});

schema.virtual('membership', {
  ref: 'Membership',
  localField: '_id',
  foreignField: 'userId',
});

schema.set('toJSON', { virtuals: true });
schema.set('toObject', { virtuals: true });

export const UserModel = mongoose.model('User', schema);
export const UserSchema = schema;
