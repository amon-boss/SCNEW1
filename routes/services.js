const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

// Ajouter un nouveau service (nécessite d'être prestataire)
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (user.accountType !== 'Prestataire') {
      return res.status(403).json({ error: 'Seuls les prestataires peuvent ajouter des services.' });
    }

    const { content, location, category } = req.body; // Ajout de location et category
    const service = new Service({
      userId,
      lastname: user.lastname,
      firstname: user.firstname,
      content,
      location,
      category
    });
    await service.save();
    res.status(201).json({ success: true, service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'ajout du service." });
  }
});

// Obtenir tous les services (avec filtrage et recherche optionnels)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query; // Récupère les paramètres de requête
    let query = {};

    if (search) {
      query.content = { $regex: search, $options: 'i' }; // Recherche insensible à la casse
    }
    if (category) {
      query.category = category;
    }

    const services = await Service.find(query).sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du chargement des services.' });
  }
});

// Mettre à jour un service (seul le prestataire qui l'a créé peut le faire)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const userId = req.user.id;
    const updates = req.body;

    const service = await Service.findOne({ _id: serviceId, userId: userId });

    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé ou vous n\'êtes pas autorisé à le modifier.' });
    }

    // Mettre à jour les champs
    Object.assign(service, updates);
    await service.save();

    res.json({ success: true, service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du service.' });
  }
});

// Supprimer un service (seul le prestataire qui l'a créé peut le faire)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const userId = req.user.id;

    const service = await Service.findOneAndDelete({ _id: serviceId, userId: userId });

    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé ou vous n\'êtes pas autorisé à le supprimer.' });
    }

    res.json({ success: true, message: 'Service supprimé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression du service.' });
  }
});

module.exports = router;
