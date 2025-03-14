import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "./header";
import "/src/app/globals.css";

export default function Home() {
  const { token } = useContext(AuthContext); // Accès au token d'authentification
  const router = useRouter();
  const [movies, setMovies] = useState([]); // Pour stocker les films récupérés

  useEffect(() => {
    // Redirection si l'utilisateur n'est pas connecté
    if (!token) {
      router.push("/login");
    }

    // Fonction pour récupérer les films depuis l'API
    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:3001/movies"); // Appel à l'API pour récupérer les films
        const data = await response.json(); // Parse la réponse JSON
        setMovies(data); // Stocke les films dans l'état local
      } catch (error) {
        console.error("Erreur lors de la récupération des films:", error);
      }
    };

    fetchMovies(); // Appel de la fonction pour récupérer les films
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

      <button
        onClick={() => {
          localStorage.removeItem("token"); // Supprime le token
          window.location.reload(); // Recharge la page pour forcer la déconnexion
        }}
      >
        Déconnexion
      </button>
    </div>
  );
}
