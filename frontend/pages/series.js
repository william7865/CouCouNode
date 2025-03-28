import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "./header";

export default function SeriesPage() {
  const { token } = useContext(AuthContext); // Accès au token d'authentification
  const router = useRouter();
  const [series, setSeries] = useState([]); // État pour stocker les séries

  useEffect(() => {
    // Redirection si l'utilisateur n'est pas connecté
    if (!token) {
      router.push("/login");
    }

    // Fonction pour récupérer les séries depuis l'API
    const fetchSeries = async () => {
      try {
        const response = await fetch("http://localhost:3001/series", {
          headers: {
            Authorization: `Bearer ${token}`, // Ajoutez le token si nécessaire
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // Parse la réponse JSON
        setSeries(data); // Stocke les séries dans l'état local
      } catch (error) {
        console.error("Erreur lors de la récupération des séries :", error);
      }
    };

    fetchSeries(); // Appel de la fonction pour récupérer les séries
  }, [token]);

  if (!token) return <p>Redirection en cours...</p>;

  return (
    <div>
      <Header />
      <h1>Liste des Séries</h1>
      <div>
        {series.length > 0 ? (
          series.map((serie) => (
            <div key={serie.id} style={{ marginBottom: "20px" }}>
              <h2>{serie.title}</h2>
              <p>{serie.description}</p>
              <p>
                <strong>Année de sortie :</strong> {serie.release_year}
              </p>
            </div>
          ))
        ) : (
          <p>Aucune série trouvée.</p>
        )}
      </div>
    </div>
  );
}