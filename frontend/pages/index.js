import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "./components/header";
import Footer from "./components/footer";
import "/src/app/globals.css";

export default function Home() {
  const { token } = useContext(AuthContext); // Accès au token d'authentification
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]); // Pour stocker les séries récupérées

  useEffect(() => {
    // Redirection si l'utilisateur n'est pas connecté
    if (!token) {
      router.push("/login");
    }

    // Fonction pour récupérer les films depuis l'API
    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:3001/movies"); // Appel à l'API pour récupérer les films
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // Parse la réponse JSON
        setMovies(data); // Stocke les films dans l'état local
      } catch (error) {
        console.error("Erreur lors de la récupération des films:", error);
      }
    };

    fetchMovies(); // Appel de la fonction pour récupérer les films

    // Fonction pour récupérer les séries depuis l'API
    const fetchSeries = async () => {
      try {
        const response = await fetch("http://localhost:3001/series"); // Appel à l'API pour récupérer les séries
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // Parse la réponse JSON
        setSeries(data); // Stocke les séries dans l'état local
      } catch (error) {
        console.error("Erreur lors de la récupération des séries:", error);
      }
    };

    fetchSeries(); // Appel de la fonction pour récupérer les séries
  }, [token]);

  if (!token) return <p>Redirection en cours...</p>;

  return (
    <div>
      <Header />
      <h1>Accueil</h1>
      <p className="bg-gray-50">Bienvenue sur votre page d'accueil.</p>

      {/* Afficher les films récupérés */}
      <div>
        <h2>Liste des films</h2>
        <ul>
          {movies.length > 0 ? (
            movies.map((movie) => (
              <li key={movie.id}>
                <h3>{movie.title}</h3>
                <p>{movie.description}</p>
                <p>
                  <strong>Année de sortie:</strong> {movie.release_year}
                </p>
              </li>
            ))
          ) : (
            <p>Aucun film trouvé.</p>
          )}
        </ul>
      </div>

      {/* Afficher les séries récupérées */}
      <div>
        <h2>Liste des séries</h2>
        <ul>
          {series.length > 0 ? (
            series.map((serie) => (
              <li key={serie.id}>
                <h3>{serie.title}</h3>
                <p>{serie.description}</p>
                <p>
                  <strong>Année de sortie:</strong> {serie.release_year}
                </p>
              </li>
            ))
          ) : (
            <p>Aucune série trouvée.</p>
          )}
        </ul>
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("token"); // Supprime le token
          window.location.reload(); // Recharge la page pour forcer la déconnexion
        }}
      >
        Déconnexion
      </button>
      <Footer />
    </div>
  );
}
