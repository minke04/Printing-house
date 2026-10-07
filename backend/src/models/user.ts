import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true }, // fizicko_lice, pravno_lice, stampar, admin
  status: { type: String, default: 'pending' }, // approved, pending, rejected
  name: { type: String, required: true },
  surname: { type: String, required: true },
  phone: { type: String, required: true },
  profileImage: { type: String, default: 'default_profile_image.jpg' },
  institutionName: { type: String },
  address: { type: String },
  registrationNumber: { type: String },
  taxId: { type: String },
  resetToken: { type: String },
  resetTokenExpires: { type: Date }
});

export default mongoose.model('User', UserSchema, 'users');