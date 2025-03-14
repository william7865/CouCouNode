const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

class Watchlist {
    static async getAllWatchlists() {
        const result = await pool.query('SELECT * FROM watchlists');
        return result.rows;
    }

    static async getWatchlistById(id) {
        const result = await pool.query(
            'SELECT * FROM watchlists WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    static async createWatchlist({ profile_id, content_id, added_at }) {
        const result = await pool.query(
            'INSERT INTO watchlists (profile_id, content_id, added_at) VALUES ($1, $2, $3) RETURNING *',
            [profile_id, content_id, added_at]
        );
        return result.rows[0];
    }

    static async deleteWatchlist(id) {
        await pool.query('DELETE FROM watchlists WHERE id = $1', [id]);
    }
}

module.exports = Watchlist;