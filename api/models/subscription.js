const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

class Subscription {
  static async getSubscriptionByUserId(userId) {
    const result = await pool.query(
      "SELECT status FROM Subscriptions WHERE user_id = $1",
      [userId]
    );
    return result.rows[0];
  }
}

module.exports = Subscription;
