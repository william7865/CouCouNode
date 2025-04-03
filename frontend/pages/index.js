import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "./components/header";
import Footer from "./components/footer";
import "/src/app/globals.css";

export default function Home() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:3001/movies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des films:", error);
      }
    };

    const fetchSeries = async () => {
      try {
        const response = await fetch("http://localhost:3001/series", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSeries(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des séries:", error);
      }
    };

    fetchMovies();
    fetchSeries();
  }, [token, router]);

  if (!token) return <p>Redirection en cours...</p>;

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="absolute inset-0 z-0">
        <div className="relative h-screen w-full">
          <img
            src="/images/brooklyn99.jpg"
            alt="Background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        </div>
      </div>

      <div className="relative z-10">
        <Header />
        <div className="container mx-auto px-4 pt-40 pb-24 text-center">
          <h1 className="text-6xl font-bold mb-4 tracking-tighter">
            TOP 10 DES PLANS
            <span className="block text-6xl font-bold mb-4 text-cyan-400">
              CETTE SEMAINE
            </span>
          </h1>
        </div>
        <div className="container mx-auto px-4 py-8 relative z-10 bg-black/90 backdrop-blur-sm">
          {/* Section Films */}
          <div className="mb-16">
            <div className="flex items-baseline gap-4 mb-8">
              <h2 className="text-3xl font-bold border-l-4 border-cyan-400 pl-3">
                TOP 10 DES PLANS
              </h2>
              <span className="text-cyan-400 font-semibold text-xl">
                PLEASURE
              </span>
            </div>

            {movies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {movies.slice(0, 10).map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-gray-900 rounded-xl shadow-xl overflow-hidden transform transition hover:scale-105 hover:shadow-2xl"
                  >
                    {movie.image_url ? (
                      <img
                        src={movie.image_url}
                        alt={movie.title}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          e.target.src = "https://picsum.photos/300/200";
                        }}
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-400">Pas d'affiche</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">
                        {movie.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {movie.description}
                      </p>
                      <p className="text-cyan-400 text-sm">
                        {movie.release_year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Aucun film trouvé</p>
            )}
          </div>

          {/* Section Séries */}
          <div className="mb-16">
            <div className="flex items-baseline gap-4 mb-8">
              <h2 className="text-3xl font-bold border-l-4 border-cyan-400  pl-3">
                TOP 10 DES SÉRIES
              </h2>
              <span className="text-cyan-400 font-semibold text-xl">
                NEW EDITION
              </span>
            </div>

            {series.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {series.slice(0, 10).map((serie) => (
                  <div
                    key={serie.id}
                    className="bg-gray-900 rounded-xl shadow-xl overflow-hidden transform transition hover:scale-105 hover:shadow-2xl"
                  >
                    {serie.image_url ? (
                      <img
                        src={serie.image_url}
                        alt={serie.title}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          e.target.src = "https://picsum.photos/300/200";
                        }}
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-400">Pas d'affiche</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">
                        {serie.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {serie.description}
                      </p>
                      <p className="text-cyan-400 text-sm">
                        {serie.release_year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Aucune série trouvée</p>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
