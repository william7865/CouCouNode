const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

class Movie {
  static async getAllMovies() {
    const result = await pool.query("SELECT * FROM movies");
    return result.rows;
  }

  static async getMovieById(id) {
    const result = await pool.query("SELECT * FROM movies WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async createMovie({
    title,
    description,
    release_year,
    user_id,
    genre_id,
    image_url,
    last_active,
    image_url,
  }) {
    const result = await pool.query(
      "INSERT INTO movies (title, description, release_year, user_id, last_active, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, description, release_year, user_id, last_active, image_url]
    );
    return result.rows[0];
  }

  static async updateMovie(
    id,

    { title, description, release_year, user_id, last_active, image_url }
  ) {
    const result = await pool.query(
      "UPDATE movies SET title = $1, description = $2, release_year = $3, user_id = $4, last_active = $5, image_url = $6 WHERE id = $7 RETURNING *",
      [title, description, release_year, user_id, last_active, image_url, id]
    );
    return result.rows[0];
  }

  static async deleteMovie(id) {
    await pool.query("DELETE FROM movies WHERE id = $1", [id]);
  }

  static async getMovieByGenre(genre) {
    const result = await pool.query("SELECT * FROM movies WHERE genre = $1", [
      genre,
    ]);
    return result.rows;
  }
}

module.exports = Movie;
