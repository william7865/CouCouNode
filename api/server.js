
const express = require('express');
const cors = require('cors');
const episodesRoutes = require('./routes/episodes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/episodes', episodesRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API CouCouNode fonctionne !');
});

// Démarrer le serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Serveur API démarré sur http://localhost:${PORT}`);
});
