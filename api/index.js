const express = require("express");
const app = express();
const User = require("./models/user");
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

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
