const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  password:    { type: String, required: true, minlength: 6, select: false },
  avatar:      { type: String, default: '' },
  role:        { type: String, enum: ['user', 'admin'], default: 'user' },
  isBlocked:   { type: Boolean, default: false },
  isVerified:  { type: Boolean, default: false },
  otp:         { type: String },
  otpExpire:   { type: Date },
  resetPasswordToken:  { type: String },
  resetPasswordExpire: { type: Date },
  lastLogin:   { type: Date },
  bio:         { type: String, default: '' },
  phone:       { type: String, default: '' },
  website:     { type: String, default: '' },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
