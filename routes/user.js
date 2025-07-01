const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Service = require('../models/Service');
const Message = require('../models/Message');
const verifyToken = require('../middleware/auth');

// Obtenir le profil utilisateur
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur chargement utilisateur.' });
  }
});

// Modifier le profil utilisateur
router.put('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    
    // Mettre à jour les champs autorisés
    const allowedFields = ['phone', 'lastname', 'firstname', 'accountType'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });
    
    await user.save();
    res.json({ success: true, user: user.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } }) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la modification.' });
  }
});

// Supprimer le compte utilisateur
router.delete('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Supprimer tous les services de l'utilisateur
    await Service.deleteMany({ userId });
    
    // Supprimer tous les messages de l'utilisateur
    await Message.deleteMany({
      $or: [{ senderId: userId }, { receiverId: userId }]
    });
    
    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);
    
    res.json({ success: true, message: 'Compte supprimé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression du compte.' });
  }
});

// Obtenir un utilisateur par ID (pour la messagerie)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du chargement de l\'utilisateur.' });
  }
});

module.exports = router;
