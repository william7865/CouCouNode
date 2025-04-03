const { Pool } = require("pg");
require("dotenv").config();
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

class Profile {
  // Récupérer tous les profiles d'un utilisateur
  static async getProfilesByUserId(userId) {
    const result = await pool.query(
      `SELECT * FROM Profiles WHERE user_id = $1`,
      [userId]
    );
    return result.rows;
  }

  // Créer un nouveau profile pour un utilisateur
  static async createProfile({ user_id, name }) {
    const result = await pool.query(
      `INSERT INTO Profiles (user_id, name) VALUES ($1, $2) RETURNING *`,
      [user_id, name]
    );
    return result.rows[0];
  }

  // Supprimer un profile par son identifiant
  static async deleteProfile(id) {
    const result = await pool.query(
      `DELETE FROM Profiles WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
  // Mettre à jour le nom d'un profil par son identifiant
  static async updateProfile({ id, name }) {
    const result = await pool.query(
      `UPDATE Profiles SET name = $1 WHERE id = $2 RETURNING *`,
      [name, id]
    );
    return result.rows[0];
  }
}

module.exports = Profile;
