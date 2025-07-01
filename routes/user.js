const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Service = require('../models/Service');
const verifyToken = require('../middleware/auth');

// Obtenir le profil utilisateur
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
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
    // Le mot de passe ne devrait pas être modifié ici pour des raisons de sécurité
    // (une route séparée pour le changement de mot de passe serait préférable)
    const allowedFields = ['phone', 'lastname', 'firstname', 'accountType'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();
    // Retourne l'utilisateur sans le mot de passe
    res.json({ success: true, user: user.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } }) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la modification du profil.' });
  }
});

// Supprimer le compte utilisateur
router.delete('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Supprimer tous les services de l'utilisateur
    await Service.deleteMany({ userId });

    // IMPORTANT : La logique de suppression des messages est COMMENTÉE
    // car le modèle Message n'est pas encore implémenté.
    // Vous devrez la décommenter et la dé-commenter quand vous ajouterez le modèle Message.
    /*
    await Message.deleteMany({
      $or: [{ senderId: userId }, { receiverId: userId }]
    });
    */

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'Compte supprimé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression du compte.' });
  }
});

// Obtenir un utilisateur par ID (peut être utilisé pour la messagerie future)
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
