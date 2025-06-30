const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const service = new Service({
      userId,
      lastname: user.lastname,
      firstname: user.firstname,
      content: req.body.content
    });
    await service.save();
    res.json({ success: true, service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l'ajout du service.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du chargement.' });
  }
});

module.exports = router;
