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
}

module.exports = User;
