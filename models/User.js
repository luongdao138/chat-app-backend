const { Schema, model } = require('mongoose');
const userSchema = new Schema({
  social_id: { type: String },
  display_name: { type: String },
  password: String,
  email: { type: String, required: true },
  photo: String,
  phone: String,
  bio: String,
});

const User = model('User', userSchema);
module.exports = User;
