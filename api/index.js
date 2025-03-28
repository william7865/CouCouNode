const express = require("express");
const app = express();
const User = require("./models/user");
const Movie = require("./models/movie");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY;

// ROUTE : Inscription
app.post("/register", async (req, res) => {
  try {
    const { email, password, full_name, birth_date } = req.body;
    const existingUser = await User.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }
    const user = await User.createUser({
      email,
      password,
      full_name,
      birth_date,
    });
    res.status(201).json({ message: "Utilisateur créé", user });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    res.status(500).json({ error: error.message });
  }
});

// ROUTE : Connexion
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "2h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ROUTE : Profil
app.get("/profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const { email } = decoded;
    const user = await User.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: "Token invalide" });
  }
});

// ROUTE : Créer un film
app.post("/movies", async (req, res) => {
  try {
    const newMovie = await Movie.createMovie(req.body);
    res.status(201).json(newMovie);
  } catch (err) {
    console.error("Erreur lors de l'ajout du film :", err);
    res.status(500).json({ error: "Erreur lors de l'ajout du film." });
  }
});

// ROUTE : Récupérer les films
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.getAllMovies(); // Assurez-vous que cette méthode existe dans votre modèle Movie
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
