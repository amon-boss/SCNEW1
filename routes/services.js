const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

// Créer un service
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const service = new Service({
      userId,
      lastname: user.lastname,
      firstname: user.firstname,
      content: req.body.content,
      category: req.body.category,
      location: req.body.location,
      price: req.body.price
    });
    await service.save();
    res.json({ success: true, service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'ajout du service." });
  }
});

// Obtenir tous les services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du chargement.' });
  }
});

// Rechercher des services
router.get('/search', async (req, res) => {
  try {
    const { query, category } = req.query;
    let searchCriteria = {};
    
    if (query) {
      searchCriteria.$or = [
        { content: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (category) {
      searchCriteria.category = category;
    }
    
    const services = await Service.find(searchCriteria).sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la recherche.' });
  }
});

// Obtenir les services d'un utilisateur
router.get('/my-services', verifyToken, async (req, res) => {
  try {
    const services = await Service.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du chargement.' });
  }
});

// Modifier un service
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const service = await Service.findOne({ _id: req.params.id, userId: req.user.id });
    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé.' });
    }
    
    Object.assign(service, req.body);
    await service.save();
    res.json({ success: true, service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la modification.' });
  }
});

// Supprimer un service
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé.' });
    }
    res.json({ success: true, message: 'Service supprimé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

module.exports = router;
