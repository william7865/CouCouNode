const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

class WatchHistory {
    static async getAllWatchHistory() {
        const result = await pool.query('SELECT * FROM watch_history');
        return result.rows;
    }

    static async getWatchHistoryById(id) {
        const result = await pool.query(
            'SELECT * FROM watch_history WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    static async createWatchHistory({ profile_id, content_id, watched_at, progress }) {
        const result = await pool.query(
            'INSERT INTO watch_history (profile_id, content_id, watched_at, progress) VALUES ($1, $2, $3, $4) RETURNING *',
            [profile_id, content_id, watched_at, progress]
        );
        return result.rows[0];
    }

    static async updateWatchHistory(id, { watched_at, progress }) {
        const result = await pool.query(
            'UPDATE watch_history SET watched_at = $1, progress = $2 WHERE id = $3 RETURNING *',
            [watched_at, progress, id]
        );
        return result.rows[0];
    }

    static async deleteWatchHistory(id) {
        await pool.query('DELETE FROM watch_history WHERE id = $1', [id]);
    }
}

module.exports = WatchHistory;