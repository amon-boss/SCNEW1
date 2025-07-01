const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Ajout pour le hachage du mot de passe

const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true }, // Rendre le téléphone obligatoire et unique
  lastname: { type: String, required: true },
  firstname: { type: String, required: true },
  password: { type: String, required: true },
  accountType: { type: String, enum: ['Particulier', 'Prestataire'], default: 'Particulier' }, // Valeur par défaut
  createdAt: { type: Date, default: Date.now }
});

// Pré-sauvegarde pour hacher le mot de passe
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Méthode pour comparer les mots de passe
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
