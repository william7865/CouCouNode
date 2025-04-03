
const express = require('express');
const router = express.Router();
const Episode = require('../models/episode');

// GET /episodes/latest
router.get('/latest', async (req, res) => {
  try {
    const episodes = await Episode.getLatestEpisodes(20);
    res.json(episodes);
  } catch (error) {
    console.error('Erreur dans /episodes/latest :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des derniers épisodes' });
  }
});

module.exports = router;
