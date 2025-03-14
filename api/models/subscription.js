const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

class Subscription {
    static async getAllSubscriptions() {
        const result = await pool.query('SELECT * FROM subscriptions');
        return result.rows;
    }

    static async getSubscriptionById(id) {
        const result = await pool.query(
            'SELECT * FROM subscriptions WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    static async createSubscription({ user_id, plan, price, status, created_at, updated_at }) {
        const result = await pool.query(
            'INSERT INTO subscriptions (user_id, plan, price, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user_id, plan, price, status, created_at, updated_at]
        );
        return result.rows[0];
    }

    static async updateSubscription(id, { plan, price, status, updated_at }) {
        const result = await pool.query(
            'UPDATE subscriptions SET plan = $1, price = $2, status = $3, updated_at = $4 WHERE id = $5 RETURNING *',
            [plan, price, status, updated_at, id]
        );
        return result.rows[0];
    }

    static async deleteSubscription(id) {
        await pool.query('DELETE FROM subscriptions WHERE id = $1', [id]);
    }
}

module.exports = Subscription;