const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Service = require('../models/Service'); // Ajout pour supprimer les services associés
const verifyToken = require('../middleware/auth');
const bcrypt = require('bcryptjs'); // Ajout pour le hachage du mot de passe si modifié

// Récupérer les informations de l'utilisateur connecté
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du chargement de l\'utilisateur.' });
  }
});

// Mettre à jour les informations de l'utilisateur
router.put('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Si le mot de passe est mis à jour, le hacher
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur.' });
  }
});

// Supprimer le compte utilisateur
router.delete('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Supprimer tous les services associés à cet utilisateur
    await Service.deleteMany({ userId: userId });

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    res.json({ success: true, message: 'Compte utilisateur et services associés supprimés avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression du compte utilisateur.' });
  }
});

// Obtenir les services postés par l'utilisateur actuel (pour les prestataires)
router.get('/me/services', verifyToken, async (req, res) => {
  try {
    const services = await Service.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du chargement des services de l\'utilisateur.' });
  }
});

module.exports = router;
                                         
