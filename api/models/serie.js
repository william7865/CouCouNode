const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

class Series {
  static async getAllSeries() {
    const result = await pool.query("SELECT * FROM series");
    return result.rows;
  }

  static async getSeriesById(id) {
    const result = await pool.query("SELECT * FROM series WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async createSeries({
    title,
    description,
    release_year,
    rating,
    created_at,
    updated_at,
  }) {
    const result = await pool.query(
      "INSERT INTO series (title, description, release_year, rating, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, description, release_year, rating, created_at, updated_at]
    );
    return result.rows[0];
  }

  static async updateSeries(
    id,
    { title, description, release_year, rating, updated_at }
  ) {
    const result = await pool.query(
      "UPDATE series SET title = $1, description = $2, release_year = $3, rating = $4, updated_at = $5 WHERE id = $6 RETURNING *",
      [title, description, release_year, rating, updated_at, id]
    );
    return result.rows[0];
  }

  static async deleteSeries(id) {
    await pool.query("DELETE FROM series WHERE id = $1", [id]);
  }

  static async getSeriesByGenre(genre) {
    const result = await pool.query("SELECT * FROM series WHERE genre = $1", [
      genre,
    ]);
  }
}

module.exports = Series;
