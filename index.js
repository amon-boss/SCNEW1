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
.then(() => console.log('鉁� Connect茅 脿 MongoDB'))
.catch((err) => console.error('鉂� Erreur MongoDB:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/users', require('./routes/user'));
app.use('/api/messages', require('./routes/messages'));

app.get('/', (req, res) => res.send('Service Connect API 馃殌'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('馃殌 Serveur lanc茅 sur le port', PORT))
