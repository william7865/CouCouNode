import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "./components/header";
import "/src/app/globals.css";

export default function Home() {
  const { token, user } = useContext(AuthContext); // Accès au token et au nom de l'utilisateur
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }

    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:3001/movies");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMovies(data.slice(0, 8)); // Limiter à 8 films
      } catch (error) {
        console.error("Erreur lors de la récupération des films:", error);
      }
    };

    const fetchSeries = async () => {
      try {
        const response = await fetch("http://localhost:3001/series");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSeries(data.slice(0, 8)); // Limiter à 8 séries
      } catch (error) {
        console.error("Erreur lors de la récupération des séries:", error);
      }
    };

    fetchMovies();
    fetchSeries();
  }, [token]);

  console.log("Utilisateur :", user);
  console.log("Nom complet :", user?.full_name);

  if (!token) return <p>Redirection en cours...</p>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Message de bienvenue */}

        {/* Section des films */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4 mt-10">Films populaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {movies.length > 0 ? (
              movies.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 duration-300"
                >
                  <img
                    src={movie.image_url || "/placeholder.jpg"}
                    alt={movie.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold">{movie.title}</h3>
                    <p className="text-gray-400 mt-2 text-sm">
                      {movie.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>Aucun film trouvé.</p>
            )}
          </div>
        </div>

        {/* Section des séries */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Séries populaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {series.length > 0 ? (
              series.map((serie) => (
                <div
                  key={serie.id}
                  className="bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 duration-300"
                >
                  <img
                    src={serie.image_url || "/placeholder.jpg"}
                    alt={serie.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold">{serie.title}</h3>
                    <p className="text-gray-400 mt-2 text-sm">
                      {serie.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>Aucune série trouvée.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
