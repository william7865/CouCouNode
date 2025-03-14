// pages/series/[id].js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function SeriesDetails() {
  const [serie, setSerie] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;  // Ne fait pas la requête si l'id n'est pas disponible
    const fetchSerie = async () => {
      const response = await fetch(`http://localhost:5000/api/series/${id}`);
      const data = await response.json();
      setSerie(data);
    };
    
    fetchSerie();
  }, [id]);

  if (!serie) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      <h1>{serie.title}</h1>
      <p>{serie.description}</p>
      <div>
        {serie.episodes.map((episode) => (
          <div key={episode.id}>
            <h3>{episode.title}</h3>
            <p>Durée: {episode.duration} minutes</p>
          </div>
        ))}
      </div>
    </div>
  );
}
