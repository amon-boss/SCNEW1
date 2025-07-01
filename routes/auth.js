const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Ajout pour le hachage

router.post('/register', async (req, res) => {
  try {
    const { phone, lastname, firstname, password, accountType } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: 'Utilisateur avec ce numéro de téléphone déjà existant.' });
    }

    // Le hachage du mot de passe est géré dans le pré-save du modèle User
    const user = new User({ phone, lastname, firstname, password, accountType });
    await user.save();

    const token = jwt.sign(
      { id: user._id, lastname: user.lastname, firstname: user.firstname, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ success: true, user: { id: user._id, phone: user.phone, lastname: user.lastname, firstname: user.firstname, accountType: user.accountType }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'inscription." });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body; // Changement: identifier devient phone

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const isMatch = await user.matchPassword(password); // Utilisation de la méthode du modèle
    if (!isMatch) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { id: user._id, lastname: user.lastname, firstname: user.firstname, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, user: { id: user._id, phone: user.phone, lastname: user.lastname, firstname: user.firstname, accountType: user.accountType }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur de connexion.' });
  }
});

module.exports = router;
