const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phone: { type: String, required: false },
  lastname: { type: String, required: true },
  firstname: { type: String, required: true },
  password: { type: String, required: true },
  accountType: { type: String, enum: ['Particulier', 'Prestataire'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);