const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

class Notification {
  static async getAllNotifications() {
    const result = await pool.query("SELECT * FROM notifications");
    return result.rows;
  }

  static async getNotificationById(id) {
    const result = await pool.query(
      "SELECT * FROM notifications WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }

  static async createNotification({ user_id, message, status, sent_at }) {
    const result = await pool.query(
      "INSERT INTO notifications (user_id, message, status, sent_at) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, message, status, sent_at]
    );
    return result.rows[0];
  }

  static async updateNotification(id, { message, status, sent_at }) {
    const result = await pool.query(
      "UPDATE notifications SET message = $1, status = $2, sent_at = $3 WHERE id = $4 RETURNING *",
      [message, status, sent_at, id]
    );
    return result.rows[0];
  }

  static async deleteNotification(id) {
    await pool.query("DELETE FROM notifications WHERE id = $1", [id]);
  }
}

module.exports = Notification;
