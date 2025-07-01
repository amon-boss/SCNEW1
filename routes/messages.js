const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

// Envoyer un message
router.post('/', verifyToken, async (req, res) => {
  try {
    const senderId = req.user.id;
    const sender = await User.findById(senderId);
    const receiver = await User.findById(req.body.receiverId);
    
    if (!receiver) {
      return res.status(404).json({ error: 'Destinataire non trouvé.' });
    }
    
    const message = new Message({
      senderId,
      receiverId: req.body.receiverId,
      senderName: `${sender.firstname} ${sender.lastname}`,
      receiverName: `${receiver.firstname} ${receiver.lastname}`,
      content: req.body.content,
      serviceId: req.body.serviceId
    });
    
    await message.save();
    res.json({ success: true, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
  }
});

// Obtenir les conversations d'un utilisateur
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: mongoose.Types.ObjectId(userId) },
            { receiverId: mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', mongoose.Types.ObjectId(userId)] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);
    
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du chargement des conversations.' });
  }
});

// Obtenir les messages entre deux utilisateurs
router.get('/:otherUserId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;
    
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 });
    
    // Marquer les messages comme lus
    await Message.updateMany(
      { senderId: otherUserId, receiverId: userId, read: false },
      { read: true }
    );
    
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du chargement des messages.' });
  }
});

module.exports = router;
