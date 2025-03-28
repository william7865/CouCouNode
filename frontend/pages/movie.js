import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "./header";

export default function MoviePage() {
  const { token } = useContext(AuthContext); // Accès au token d'authentification
  const router = useRouter();
  const [movies, setMovies] = useState([]); // État pour stocker les films

  useEffect(() => {
    // Redirection si l'utilisateur n'est pas connecté
    if (!token) {
      router.push("/login");
    }

    // Fonction pour récupérer les films depuis l'API
    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:3001/movies", {
          headers: {
            Authorization: `Bearer ${token}`, // Ajoutez le token si nécessaire
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // Parse la réponse JSON
        setMovies(data); // Stocke les films dans l'état local
      } catch (error) {
        console.error("Erreur lors de la récupération des films :", error);
      }
    };

    fetchMovies(); // Appel de la fonction pour récupérer les films
  }, [token]);

  if (!token) return <p>Redirection en cours...</p>;

  return (
    <div>
      <Header />
      <h1>Liste des Films</h1>
      <div>
        {movies.length > 0 ? (
          movies.map((movie) => (
            <div key={movie.id} style={{ marginBottom: "20px" }}>
              <h2>{movie.title}</h2>
              <p>{movie.description}</p>
              <p>
                <strong>Année de sortie :</strong> {movie.release_year}
              </p>
            </div>
          ))
        ) : (
          <p>Aucun film trouvé.</p>
        )}
      </div>
    </div>
  );
}
