import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "./header";

export default function MoviePage() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const [movies, setMovies] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0); // Pour suivre l'index du film actuel

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

        setMovies(data); // Mettre à jour l'état avec les films non triés
      } catch (error) {
        console.error("Erreur lors de la récupération des films :", error);
      }
    };

    fetchMovies();
  }, [token]);

  // Trouver le film le plus récent
  const mostRecentMovie = movies.reduce((latest, movie) => {
    return !latest || movie.release_year > latest.release_year ? movie : latest;
  }, null);

  if (!token)
    return (
      <p className="text-center text-lg text-gray-600">
        Redirection en cours...
      </p>
    );

  // Fonction pour faire défiler les films à gauche
  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? movies.length - 1 : prevIndex - 1
    );
  };

  // Fonction pour faire défiler les films à droite
  const handleNextClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === movies.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
                backgroundSize: "cover", // Permet à l'image de couvrir toute la zone
                backgroundPosition: "center", // Centre l'image
                width: "100%", // Largeur pleine
                height: "100vh", // Hauteur complète de l'écran
              }}
            >
              {/* Conteneur texte avec fond semi-transparent */}
              <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-start p-6">
                <h2 className="text-5xl font-bold text-white mb-6">
                  {mostRecentMovie.title}
                </h2>
                <p className="text-white text-lg mb-6">
                  {mostRecentMovie.description}
                </p>
                <p className="text-gray-300">
                  <strong>Année de sortie :</strong>{" "}
                  {mostRecentMovie.release_year}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Carrousel des films */}
        <div className="relative max-w-5xl mx-auto">
          {/* Conteneur du carrousel */}
          <div className="flex overflow-x-hidden">
            {/* Bouton gauche */}
            <button
              onClick={handlePrevClick}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-600 transition-all duration-300 z-10"
            >
              &lt;
            </button>

            {/* Contenu du carrousel */}
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {movies.length > 0 ? (
                movies.map((movie) => (
                  <div
                    key={movie.id}
                    className="min-w-full sm:w-1/3 lg:w-1/4 xl:w-1/5 p-4"
                  >
                    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 duration-300">
                      <img
                        src={movie.image_url || "/placeholder.jpg"}
                        alt={movie.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="p-4 bg-white bg-opacity-70">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {movie.title}
                        </h2>
                        <p className="text-gray-700 mt-2">
                          {movie.description}
                        </p>
                        <p className="text-gray-600 mt-2">
                          <strong>Année de sortie :</strong>{" "}
                          {movie.release_year}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 col-span-3">
                  Aucun film trouvé.
                </p>
              )}
            </div>

            {/* Bouton droit */}
            <button
              onClick={handleNextClick}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-600 transition-all duration-300 z-10"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
