const express = require("express");
const app = express();
const User = require("./models/user");
const Movie = require("./models/movie");
const Genre = require("./models/genre");
const Serie = require("./models/serie");
const Profile = require("./models/profile");
const Subscription = require("./models/subscription");
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

// ROUTE : Lister les utilisateurs (admin uniquement)
app.get("/users", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const currentUser = await User.getUserById(decoded.id);
    if (currentUser.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé" });
    }
    const users = await User.getAllUsers();
    res.json({ users });
  } catch (error) {
    res.status(401).json({ error: "Token invalide" });
  }
});

// ROUTE : Supprimer un utilisateur (admin uniquement)
app.delete("/users/:id", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const currentUser = await User.getUserById(decoded.id);
    if (currentUser.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé" });
    }
    const deletedUser = await User.deleteUser(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json({ message: "Utilisateur supprimé", user: deletedUser });
  } catch (error) {
    res.status(401).json({ error: "Token invalide" });
  }
});

// ROUTE : Compte (récupérer les informations) - modifié
app.get("/account", async (req, res) => {
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

// ROUTE : Mise à jour du compte
app.put("/account", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const updatedUser = await User.updateUser(decoded.id, req.body);
    res.json({ user: updatedUser });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du compte :", error);
    res.status(500).json({ error: error.message });
  }
});

// ROUTE : Suppression du compte utilisateur
app.delete("/account", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const deletedUser = await User.deleteUser(decoded.id);
    res.json({ message: "Compte supprimé", user: deletedUser });
  } catch (error) {
    console.error("Erreur lors de la suppression du compte :", error);
    res.status(500).json({ error: error.message });
  }
});

// ROUTE : Créer un profile
app.post("/profiles", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nom du profile requis" });
    }
    const newProfile = await Profile.createProfile({
      user_id: decoded.id,
      name,
    });
    res
      .status(201)
      .json({ profile: newProfile, message: "Profile créé avec succès !" });
  } catch (error) {
    console.error("Erreur lors de la création du profile :", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/profiles", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const profiles = await Profile.getProfilesByUserId(decoded.id);
    res.json({ profiles });
  } catch (error) {
    console.error("Erreur lors de la récupération des profiles :", error);
    res.status(500).json({ error: error.message });
  }
});
// ROUTE : Supprimer un profile
app.delete("/profiles/:id", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const profileId = req.params.id;
    const deletedProfile = await Profile.deleteProfile(profileId);
    res.json({
      message: "Profile supprimé avec succès",
      profile: deletedProfile,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du profile :", error);
    res.status(500).json({ error: error.message });
  }
});
// ROUTE : Mettre à jour un profil
app.put("/profiles/:id", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const profileId = req.params.id;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nom du profil requis" });
    }
    const updatedProfile = await Profile.updateProfile({ id: profileId, name });
    res.json({
      message: "Profil modifié avec succès",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Erreur lors de la modification du profil :", error);
    res.status(500).json({ error: error.message });
  }
});

// ROUTE : Abonnement de l'utilisateur
app.get("/subscription", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const subscription = await Subscription.getSubscriptionByUserId(decoded.id);
    if (!subscription) {
      return res.status(404).json({ error: "Abonnement non trouvé" });
    }
    res.json(subscription);
  } catch (error) {
    res.status(401).json({ error: "Token invalide" });
  }
});
// ROUTE : Modifier l'abonnement d'un utilisateur (admin uniquement)
app.patch("/subscription/:userId", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const currentUser = await User.getUserById(decoded.id);
    if (currentUser.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé" });
    }
    const { userId } = req.params;
    const { status } = req.body; // Ex : "active", "canceled", "pending"
    const updatedSubscription = await Subscription.updateSubscription(
      userId,
      status
    );
    if (!updatedSubscription) {
      return res.status(404).json({ error: "Abonnement non trouvé" });
    }
    res.status(200).json({ subscription: updatedSubscription });
  } catch (error) {
    console.error("Erreur lors de la vérification du token :", error);
    res.status(401).json({ error: "Token invalide" });
  }
});

// ROUTE : Annuler un abonnement
app.delete("/subscription/cancel", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const canceledSubscription = await Subscription.cancelSubscription(
      decoded.id
    );
    if (!canceledSubscription) {
      return res.status(404).json({ error: "Abonnement non trouvé" });
    }
    res.json({
      message: "Abonnement annulé avec succès",
      subscription: canceledSubscription,
    });
  } catch (error) {
    console.error("Erreur lors de l'annulation de l'abonnement:", error);
    res.status(401).json({ error: "Token invalide" });
  }
});

// ROUTE : Créer un film
app.post("/movies", async (req, res) => {
  try {
    console.log("Requête reçue dans /movies :", req.body);
    const newMovie = await Movie.createMovie(req.body);
    res.status(201).json(newMovie);
  } catch (err) {
    console.error("Erreur lors de l'ajout du film :", err.message);
    res.status(500).json({ error: "Erreur lors de l'ajout du film." });
  }
});

// ROUTE : Récupérer les films
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.getAllMovies();
    res.json(movies);
  } catch (error) {
    console.error("Erreur lors de la récupération des films :", error);
    res.status(500).json({ error: error.message });
  }
});
//ROUTE : Supprimer un film
app.delete("/movies/:id", async (req, res) => {
  try {
    const movieId = req.params.id;
    const deletedMovie = await Movie.deleteMovie(movieId);
    if (!deletedMovie) {
      return res.status(404).json({ error: "Film non trouvé" });
    }
    res.json({ message: "Film supprimé avec succès", movie: deletedMovie });
  } catch (error) {
    console.error("Erreur lors de la suppression du film :", error);
    res.status(500).json({ error: error.message });
  }
});
// ROUTE : Récupérer les genres
app.get("/genres", async (req, res) => {
  try {
    const genres = await Genre.getAllGenres();
    res.json(genres);
  } catch (error) {
    console.error("Erreur lors de la récupération des genres :", error);
    res.status(500).json({ error: error.message });
  }
});
// ROUTE : Créer une série
app.post("/series", async (req, res) => {
  try {
    const newSerie = await Serie.createSeries(req.body);
    res.status(201).json(newSerie);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la série :", error);
    res.status(500).json({ error: "Erreur lors de l'ajout de la série." });
  }
});
// ROUTE : Récupérer les séries
app.get("/series", async (req, res) => {
  try {
    const getSeries = await Serie.getAllSeries();
    res.json(getSeries);
  } catch (error) {
    console.error("Erreur lors de la récupération des séries :", error);
    res.status(500).json({ error: error.message });
  }
});
const episodesRoutes = require("./routes/episodes");
app.use("/episodes", episodesRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
