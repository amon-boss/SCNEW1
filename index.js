const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch((err) => console.error('❌ Erreur MongoDB:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/users', require('./routes/user'));

app.get('/', (req, res) => res.send('Service Connect API 🚀'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('🚀 Serveur lancé sur le port', PORT));