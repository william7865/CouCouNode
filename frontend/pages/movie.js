import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "./header";

export default function MoviePage() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const [movies, setMovies] = useState([]);

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
        setMovies(data); // Les films sont déjà triés par année de sortie
      } catch (error) {
        console.error("Erreur lors de la récupération des films :", error);
      }
    };

    fetchMovies();
  }, [token]);

  if (!token)
    return (
      <p className="text-center text-lg text-gray-600">
        Redirection en cours...
      </p>
    );

  const [latestMovie, ...otherMovies] = movies;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-6">
        {/* Film le plus récent */}
        {latestMovie && (
          <div
            className="relative bg-cover bg-center h-96 rounded-lg shadow-lg mb-8"
            style={{
              backgroundImage: `url(${
                latestMovie.image_url || "/placeholder.jpg"
              })`,
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-start p-6 rounded-lg">
              <h1 className="text-4xl font-bold text-white mb-4">
                {latestMovie.title}
              </h1>
              <p className="text-white text-lg mb-4">
                {latestMovie.description}
              </p>
              <p className="text-gray-300">
                <strong>Année de sortie :</strong> {latestMovie.release_year}
              </p>
            </div>
          </div>
        )}

        {/* Liste des autres films */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Autres Films
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherMovies.length > 0 ? (
            otherMovies.map((movie) => (
              <div key={movie.id} className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-900">
                  {movie.title}
                </h2>
                <p className="text-gray-700 mt-2">{movie.description}</p>
                <p className="text-gray-600 mt-2">
                  <strong>Année de sortie :</strong> {movie.release_year}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-3">
              Aucun film trouvé.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
