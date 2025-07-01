const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastname: { type: String },
  firstname: { type: String },
  content: { type: String, required: true },
  location: { type: String, required: true }, // Ajout du champ location
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', ServiceSchema);
