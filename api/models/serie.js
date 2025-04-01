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
    try {
      // Requête pour récupérer toutes les séries avec leurs épisodes et catégories
      const query = `
        SELECT 
          s.*,
          (
            SELECT json_agg(
              json_build_object(
                'id', e.id,
                'title', e.title,
                'description', e.description,
                'duration', e.duration,
                'episode_number', e.episode_number,
                'season_number', e.season_number,
                'image_url', e.image_url
              )
            )
            FROM episodes e
            WHERE e.serie_id = s.id
          ) as episodes,
          (
            SELECT json_agg(
              json_build_object(
                'id', c.id,
                'name', c.name,
                'display_name', c.display_name
              )
            )
            FROM series_categories sc
            JOIN categories c ON sc.category_id = c.id
            WHERE sc.serie_id = s.id
          ) as categories
        FROM series s
      `;
      
      const result = await pool.query(query);
      
      // Formater les données pour avoir un tableau d'acteurs et de genres
      const formattedSeries = result.rows.map(serie => ({
        ...serie,
        actors: serie.actors || [], // Assure que actors est toujours un tableau
        genres: serie.genres || [], // Assure que genres est toujours un tableau
        episodes: serie.episodes || [], // Assure que episodes est toujours un tableau
        categories: serie.categories || [] // Assure que categories est toujours un tableau
      }));
      
      return formattedSeries;
    } catch (error) {
      console.error("Error fetching series:", error);
      throw error;
    }
  }

  static async getSeriesById(id) {
    try {
      const query = `
        SELECT 
          s.*,
          (
            SELECT json_agg(
              json_build_object(
                'id', e.id,
                'title', e.title,
                'description', e.description,
                'duration', e.duration,
                'episode_number', e.episode_number,
                'season_number', e.season_number,
                'image_url', e.image_url
              )
            )
            FROM episodes e
            WHERE e.serie_id = s.id
          ) as episodes,
          (
            SELECT json_agg(
              json_build_object(
                'id', c.id,
                'name', c.name,
                'display_name', c.display_name
              )
            )
            FROM series_categories sc
            JOIN categories c ON sc.category_id = c.id
            WHERE sc.serie_id = s.id
          ) as categories
        FROM series s
        WHERE s.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const serie = result.rows[0];
      
      // Formater les données
      return {
        ...serie,
        actors: serie.actors || [],
        genres: serie.genres || [],
        episodes: serie.episodes || [],
        categories: serie.categories || []
      };
    } catch (error) {
      console.error("Error fetching series by id:", error);
      throw error;
    }
  }

  static async createSeries({
    title,
    description,
    detailed_description,
    release_year,
    rating,
    actors,
    genres,
    seasons,
    episode_count,
    themes,
    moods,
    image_url,
    banner_url,
    trailer_url,
    duration,
    creator,
    is_featured,
    is_netflix_original
  }) {
    try {
      const query = `
        INSERT INTO series (
          title, description, detailed_description, release_year, rating,
          actors, genres, seasons, episode_count, themes, moods,
          image_url, banner_url, trailer_url, duration, creator,
          is_featured, is_netflix_original
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        title,
        description,
        detailed_description,
        release_year,
        rating,
        actors,
        genres,
        seasons,
        episode_count,
        themes,
        moods,
        image_url,
        banner_url,
        trailer_url,
        duration,
        creator,
        is_featured || false,
        is_netflix_original || false
      ]);
      
      return result.rows[0];
    } catch (error) {
      console.error("Error creating series:", error);
      throw error;
    }
  }

  static async updateSeries(
    id,
    {
      title,
      description,
      detailed_description,
      release_year,
      rating,
      actors,
      genres,
      seasons,
      episode_count,
      themes,
      moods,
      image_url,
      banner_url,
      trailer_url,
      duration,
      creator,
      is_featured,
      is_netflix_original
    }
  ) {
    try {
      const query = `
        UPDATE series 
        SET 
          title = $1,
          description = $2,
          detailed_description = $3,
          release_year = $4,
          rating = $5,
          actors = $6,
          genres = $7,
          seasons = $8,
          episode_count = $9,
          themes = $10,
          moods = $11,
          image_url = $12,
          banner_url = $13,
          trailer_url = $14,
          duration = $15,
          creator = $16,
          is_featured = $17,
          is_netflix_original = $18,
          updated_at = NOW()
        WHERE id = $19
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        title,
        description,
        detailed_description,
        release_year,
        rating,
        actors,
        genres,
        seasons,
        episode_count,
        themes,
        moods,
        image_url,
        banner_url,
        trailer_url,
        duration,
        creator,
        is_featured || false,
        is_netflix_original || false,
        id
      ]);
      
      return result.rows[0];
    } catch (error) {
      console.error("Error updating series:", error);
      throw error;
    }
  }

  static async deleteSeries(id) {
    try {
      // D'abord supprimer les épisodes associés
      await pool.query("DELETE FROM episodes WHERE serie_id = $1", [id]);
      
      // Puis supprimer les associations de catégories
      await pool.query("DELETE FROM series_categories WHERE serie_id = $1", [id]);
      
      // Enfin supprimer la série
      await pool.query("DELETE FROM series WHERE id = $1", [id]);
    } catch (error) {
      console.error("Error deleting series:", error);
      throw error;
    }
  }

  static async getSeriesByGenre(genre) {
    try {
      const query = `
        SELECT s.*
        FROM series s
        WHERE $1 = ANY(s.genres)
      `;
      
      const result = await pool.query(query, [genre]);
      return result.rows;
    } catch (error) {
      console.error("Error fetching series by genre:", error);
      throw error;
    }
  }

  // Méthode pour ajouter une série à une catégorie
  static async addSeriesToCategory(serieId, categoryId) {
    try {
      const query = `
        INSERT INTO series_categories (serie_id, category_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `;
      
      await pool.query(query, [serieId, categoryId]);
    } catch (error) {
      console.error("Error adding series to category:", error);
      throw error;
    }
  }

  // Méthode pour supprimer une série d'une catégorie
  static async removeSeriesFromCategory(serieId, categoryId) {
    try {
      await pool.query(
        "DELETE FROM series_categories WHERE serie_id = $1 AND category_id = $2",
        [serieId, categoryId]
      );
    } catch (error) {
      console.error("Error removing series from category:", error);
      throw error;
    }
  }

  // Méthode pour récupérer les épisodes d'une série
  static async getEpisodesBySeriesId(serieId) {
    try {
      const result = await pool.query(
        "SELECT * FROM episodes WHERE serie_id = $1 ORDER BY season_number, episode_number",
        [serieId]
      );
      return result.rows;
    } catch (error) {
      console.error("Error fetching episodes:", error);
      throw error;
    }
  }
}

module.exports = Series;