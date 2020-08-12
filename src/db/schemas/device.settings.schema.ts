import * as mongoose from 'mongoose';

const schema = new mongoose.Schema({
  backgroundRefresh: { type: String, enum: ['0', '1'] },
  forceClose: { type: String, enum: ['0', '1'] },
  locationPermissions: { type: String, enum: ['0', '1'] },
  locationServices: { type: String, enum: ['0', '1'] },
  powerSaveMode: { type: String, enum: ['0', '1'] },

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

export const DeviceSettingsModel = mongoose.model('DeviceSettings', schema);
export const DeviceSettingsSchema = schema;
