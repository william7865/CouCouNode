// pages/movies/[id].js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function MovieDetails() {
  const [movie, setMovie] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;  // Ne fait pas la requête si l'id n'est pas disponible
    const fetchMovie = async () => {
      const response = await fetch(`http://localhost:5000/api/movies/${id}`);
      const data = await response.json();
      setMovie(data);
    };
    
    fetchMovie();
  }, [id]);

  if (!movie) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      <h1>{movie.title}</h1>
      <p>{movie.description}</p>
      <video controls>
        <source src={`http://localhost:5000/videos/${movie.id}`} type="video/mp4" />
      </video>
    </div>
  );
}
