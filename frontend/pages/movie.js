import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "./components/header";

export default function MoviePage() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3001/movies", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP! Statut: ${response.status}`);
        }

        const data = await response.json();
        console.log("Données reçues:", data); // Debug
        setMovies(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des films:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [token, router]);

  const mostRecentMovie = movies
    .filter((movie) => movie.release_year && movie.image_url) // Filtrer les films avec une année et une image valides
    .reduce((latest, movie) => {
      return !latest || movie.release_year > latest.release_year
        ? movie
        : latest;
    }, null);

  console.log("Film le plus récent :", mostRecentMovie);

  if (!token) {
    return (
      <p className="text-center text-lg text-gray-600">
        Redirection en cours...
      </p>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Chargement en cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-red-500">Erreur: {error}</p>
      </div>
    );
  }

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? movies.length - 1 : prevIndex - 1
    );
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === movies.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Section pour le film le plus récent */}
        {mostRecentMovie && (
          <div className="relative mb-8">
            <div
              className="rounded-lg shadow-md overflow-hidden relative"
              style={{
                width: "100vw",
                height: "100vh",
                marginLeft: "calc(-50vw + 50%)",
              }}
            >
              <img
                src={mostRecentMovie.image_url}
                alt={mostRecentMovie.title}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 1 }}
              />
              <div
                className="absolute inset-0 bg-opacity-60 flex flex-col justify-center items-start p-6 ml-10"
                style={{ zIndex: 2 }}
              >
                <h2 className="text-5xl font-bold text-white mb-6 ">
                  {mostRecentMovie.title}
                </h2>
                <p className="text-white text-lg mb-6 max-w-2xl ">
                  {mostRecentMovie.description}
                </p>
                <p className="text-white-300 mb-6k">
                  <strong>Année de sortie :</strong>{" "}
                  {mostRecentMovie.release_year}
                </p>
                <button
                  onClick={() => router.push(`/movie/${mostRecentMovie.id}`)}
                  className="bg-white hover:bg-gray-200 text-black py-3 px-6 rounded transition-colors font-bold"
                >
                  Lecture
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Carrousel des films */}
        {movies.length > 0 && (
          <div className="relative max-w-5xl mx-auto mb-8">
            <h3 className="text-3xl font-bold text-white mb-6">
              Films préférés
            </h3>
            <div className="flex overflow-hidden relative">
              <button
                onClick={handlePrevClick}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition-all duration-300 z-10"
              >
                &lt;
              </button>

              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {movies.map((movie) => (
                  <div
                    key={movie.id}
                    className="min-w-full sm:min-w-[50%] lg:min-w-[25%] xl:min-w-[20%] p-4"
                  >
                    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 duration-300 h-full">
                      {movie.image_url ? (
                        <img
                          src={movie.image_url}
                          alt={movie.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                          onError={(e) => {
                            e.target.src = "https://picsum.photos/300/200";
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-700 flex items-center justify-center rounded-t-lg">
                          <span className="text-gray-400">Pas d'affiche</span>
                        </div>
                      )}
                      <div className="p-4">
                        <h2 className="text-xl font-semibold text-white truncate">
                          {movie.title}
                        </h2>
                        <p className="text-gray-400 mt-2 text-sm line-clamp-2">
                          {movie.description}
                        </p>
                        <p className="text-gray-300 mt-2 text-sm">
                          <strong>Année :</strong> {movie.release_year}
                        </p>
                        <button
                          onClick={() => router.push(`/movie/${movie.id}`)}
                          className="mt-4 bg-white hover:bg-gray-200 text-black py-1 px-3 rounded transition-colors text-sm"
                        >
                          Lecture
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleNextClick}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition-all duration-300 z-10"
              >
                &gt;
              </button>
            </div>
          </div>
        )}

        {/* Sections par genre */}
        {[1, 2, 3, 4].map((genreId) => {
          const genreMovies = movies.filter(
            (movie) => movie.genre_id === genreId
          );
          if (genreMovies.length === 0) return null;

          const genreTitles = {
            1: "Action",
            2: "Comédie",
            3: "Drame",
            4: "Science-fiction",
          };

          return (
            <div key={genreId} className="mb-8">
              <h3 className="text-3xl font-bold text-white mb-6">
                Films {genreTitles[genreId]}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {genreMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 duration-300"
                  >
                    {movie.image_url ? (
                      <img
                        src={movie.image_url}
                        alt={movie.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                        onError={(e) => {
                          e.target.src = "https://picsum.photos/300/200";
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400">Pas d'affiche</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h2 className="text-xl font-semibold text-white truncate">
                        {movie.title}
                      </h2>
                      <p className="text-gray-400 mt-2 text-sm line-clamp-2">
                        {movie.description}
                      </p>
                      <p className="text-gray-300 mt-2 text-sm">
                        <strong>Année :</strong> {movie.release_year}
                      </p>
                      <button
                        onClick={() => router.push(`/movie/${movie.id}`)}
                        className="mt-4 bg-white hover:bg-gray-200 text-black py-1 px-3 rounded transition-colors text-sm"
                      >
                        Lecture
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
