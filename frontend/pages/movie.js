import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "./header";

export default function MoviePage() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }

    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:3001/movies", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des films :", error);
      }
    };

    fetchMovies();
  }, [token]);

  const mostRecentMovie = movies.reduce((latest, movie) => {
    return !latest || movie.release_year > latest.release_year ? movie : latest;
  }, null);

  if (!token)
    return (
      <p className="text-center text-lg text-gray-600">
        Redirection en cours...
      </p>
    );

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
          <div className="relative mb-8 mt-20">
            <div
              className="rounded-lg shadow-md overflow-hidden"
              style={{
                backgroundImage: `url(${
                  mostRecentMovie.image_url || "/placeholder.jpg"
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100%",
                height: "100vh",
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-start p-6">
                <h2 className="text-5xl font-bold text-white mb-6">
                  {mostRecentMovie.title}
                </h2>
                <p className="text-white text-lg mb-6">
                  {mostRecentMovie.description}
                </p>
                <p className="text-gray-300 mb-6">
                  <strong>Année de sortie :</strong>{" "}
                  {mostRecentMovie.release_year}
                </p>
                <button
                  onClick={() => router.push(`/movie/${mostRecentMovie.id}`)}
                  className="bg-white hover:bg-gray-200 text-black py-3 px-6 rounded transition-colors"
                >
                  Lecture
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Carrousel des films */}
        <div className="relative max-w-5xl mx-auto mb-8">
          <h3 className="text-3xl font-bold text-white mb-6">Films préférés</h3>
          <div className="flex overflow-hidden">
            {/* Bouton gauche */}
            <button
              onClick={handlePrevClick}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-600 transition-all duration-300 z-10"
            >
              &lt;
            </button>

            {/* Contenu du carrousel */}
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="min-w-full sm:w-1/3 lg:w-1/4 xl:w-1/5 p-4"
                >
                  <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 duration-300">
                    <img
                      src={movie.image_url || "/placeholder.jpg"}
                      alt={movie.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="p-4 bg-gray-800 bg-opacity-80">
                      <h2 className="text-xl font-semibold text-white">
                        {movie.title}
                      </h2>
                      <p className="text-gray-400 mt-2">{movie.description}</p>
                      <p className="text-gray-300 mt-2">
                        <strong>Année de sortie :</strong> {movie.release_year}
                      </p>
                      <button
                        onClick={() => router.push(`/movie/${movie.id}`)}
                        className="mt-4 bg-white hover:bg-gray-200 text-black py-2 px-4 rounded transition-colors"
                      >
                        Lecture
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton droit */}
            <button
              onClick={handleNextClick}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-600 transition-all duration-300 z-10"
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Section pour les films du genre "Action" */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-white mb-6">Films d'Action</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {movies
              .filter((movie) => movie.genre_id === 1) // Filtrer par genre_id (1 = Action)
              .map((movie) => (
                <div
                  key={movie.id}
                  className="bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 duration-300"
                >
                  <img
                    src={movie.image_url || "/placeholder.jpg"}
                    alt={movie.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-4 bg-gray-800 bg-opacity-80">
                    <h2 className="text-xl font-semibold text-white">
                      {movie.title}
                    </h2>
                    <p className="text-gray-400 mt-2">{movie.description}</p>
                    <p className="text-gray-300 mt-2">
                      <strong>Année de sortie :</strong> {movie.release_year}
                    </p>
                    <button
                      onClick={() => router.push(`/movie/${movie.id}`)}
                      className="mt-4 bg-white hover:bg-gray-200 text-black py-2 px-4 rounded transition-colors"
                    >
                      Lecture
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Section pour les films du genre 2 */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-white mb-6">
            Films de Comédie
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {movies
              .filter((movie) => movie.genre_id === 2) // Filtrer par genre_id (2 = Comédie)
              .map((movie) => (
                <div
                  key={movie.id}
                  className="bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 duration-300"
                >
                  <img
                    src={movie.image_url || "/placeholder.jpg"}
                    alt={movie.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-4 bg-gray-800 bg-opacity-80">
                    <h2 className="text-xl font-semibold text-white">
                      {movie.title}
                    </h2>
                    <p className="text-gray-400 mt-2">{movie.description}</p>
                    <p className="text-gray-300 mt-2">
                      <strong>Année de sortie :</strong> {movie.release_year}
                    </p>
                    <button
                      onClick={() => router.push(`/movie/${movie.id}`)}
                      className="mt-4 bg-white hover:bg-gray-200 text-black py-2 px-4 rounded transition-colors"
                    >
                      Lecture
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Section pour les films du genre 3 */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-white mb-6">Films de Drame</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {movies
              .filter((movie) => movie.genre_id === 3) // Filtrer par genre_id (3 = Drame)
              .map((movie) => (
                <div
                  key={movie.id}
                  className="bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 duration-300"
                >
                  <img
                    src={movie.image_url || "/placeholder.jpg"}
                    alt={movie.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-4 bg-gray-800 bg-opacity-80">
                    <h2 className="text-xl font-semibold text-white">
                      {movie.title}
                    </h2>
                    <p className="text-gray-400 mt-2">{movie.description}</p>
                    <p className="text-gray-300 mt-2">
                      <strong>Année de sortie :</strong> {movie.release_year}
                    </p>
                    <button
                      onClick={() => router.push(`/movie/${movie.id}`)}
                      className="mt-4 bg-white hover:bg-gray-200 text-black py-2 px-4 rounded transition-colors"
                    >
                      Lecture
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Section pour les films du genre 4 */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-white mb-6">
            Films de Science-fiction
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {movies
              .filter((movie) => movie.genre_id === 4) // Filtrer par genre_id (4 = Science-fiction)
              .map((movie) => (
                <div
                  key={movie.id}
                  className="bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 duration-300"
                >
                  <img
                    src={movie.image_url || "/placeholder.jpg"}
                    alt={movie.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-4 bg-gray-800 bg-opacity-80">
                    <h2 className="text-xl font-semibold text-white">
                      {movie.title}
                    </h2>
                    <p className="text-gray-400 mt-2">{movie.description}</p>
                    <p className="text-gray-300 mt-2">
                      <strong>Année de sortie :</strong> {movie.release_year}
                    </p>
                    <button
                      onClick={() => router.push(`/movie/${movie.id}`)}
                      className="mt-4 bg-white hover:bg-gray-200 text-black py-2 px-4 rounded transition-colors"
                    >
                      Lecture
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
