const { Pool } = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config();
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

class User {
  static async createUser({ email, password, full_name, birth_date }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password, full_name, birth_date) VALUES ($1, $2, $3, $4) RETURNING *`,
      [email, hashedPassword, full_name, birth_date]
    );
    return result.rows[0];
  }

  static async getUserByEmail(email) {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    return result.rows[0];
  }

  static async getUserById(id) {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    return result.rows[0];
  }

  // Méthode pour récupérer la liste de tous les utilisateurs
  static async getAllUsers() {
    const result = await pool.query(`SELECT * FROM users`);
    return result.rows;
  }

  static async updateUser(
    id,
    { email, full_name, birth_date, password, newPassword }
  ) {
    let updatedPassword = null;
    if (newPassword) {
      if (!password) {
        throw new Error(
          "Mot de passe actuel requis pour changer le mot de passe."
        );
      }
      const user = await this.getUserById(id);
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Mot de passe actuel incorrect.");
      }
      updatedPassword = await bcrypt.hash(newPassword, 10);
    }
    const result = await pool.query(
      `UPDATE users 
       SET email = $1, 
           full_name = $2, 
           birth_date = $3, 
           password = COALESCE($4, password), 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [email, full_name, birth_date, updatedPassword, id]
    );
    return result.rows[0];
  }

  static async deleteUser(id) {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = User;
