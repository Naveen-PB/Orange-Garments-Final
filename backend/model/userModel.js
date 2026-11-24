const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
    trim: true,
  },
  email: {
    required: true,
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  contact: {
    type: String,
    default: "",
  },
  password: {
    required: true,
    type: String,
  },
  profilepic: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "GENERAL",
  }
}, {
  timestamps: true
});

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
