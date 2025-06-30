const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.post('/register', async (req, res) => {
  try {
    const { phone, lastname, firstname, password, accountType } = req.body;
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: 'Utilisateur déjà existant' });
    }

    const user = new User({ phone, lastname, firstname, password, accountType });
    await user.save();

    const token = jwt.sign(
      { id: user._id, lastname: user.lastname },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'inscription." });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Modif ici : on cherche l'utilisateur par phone (identifiant)
    const user = await User.findOne({ phone: identifier });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { id: user._id, lastname: user.lastname },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur de connexion.' });
  }
});

module.exports = router;
