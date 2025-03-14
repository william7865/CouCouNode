const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

class Episode {
    static async getAllEpisodes() {
        const result = await pool.query('SELECT * FROM episodes');
        return result.rows;
    }

    static async getEpisodeById(id) {
        const result = await pool.query(
            'SELECT * FROM episodes WHERE id = $1', 
            [id]
        );
        return result.rows[0];
    }

    static async createEpisode({ series_id, season, episode, title, duration, release_date }) {
        const result = await pool.query(
            'INSERT INTO episodes (series_id, season, episode, title, duration, release_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [series_id, season, episode, title, duration, release_date]
        );
        return result.rows[0];
    }

    static async updateEpisode(id, { season, episode, title, duration, release_date }) {
        const result = await pool.query(
            'UPDATE episodes SET season = $1, episode = $2, title = $3, duration = $4, release_date = $5 WHERE id = $6 RETURNING *',
            [season, episode, title, duration, release_date, id]
        );
        return result.rows[0];
    }

    static async deleteEpisode(id) {
        await pool.query('DELETE FROM episodes WHERE id = $1', [id]);
    }
}

module.exports = Episode;