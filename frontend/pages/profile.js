import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "./header";
import "/src/app/globals.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  // Etat pour gérer les champs du formulaire de film
  const [movie, setMovie] = useState({
    title: "",
    description: "",
    release_year: "",
  });
  const [movieMessage, setMovieMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const response = await fetch("http://localhost:3001/profile", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Erreur lors de la récupération du profil");
        } else {
          setUser(data.user);
        }
      } catch (err) {
        setError("Erreur lors de la récupération des données.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Ajout de la fonction handleMovieChange
  const handleMovieChange = (e) => {
    const { name, value } = e.target;
    setMovie((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const newMovie = {
        ...movie,
        user_id: user.id,
        last_active: new Date().toISOString(),
        release_year: parseInt(movie.release_year, 10),
      };
      const response = await fetch("http://localhost:3001/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMovie),
      });

      const contentType = response.headers.get("Content-Type") || "";
      let data;
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = { error: await response.text() };
      }
      console.log("Réponse du backend:", data);
      if (!response.ok) {
        setMovieMessage(data.error || "Erreur lors de l'ajout du film.");
      } else {
        setMovieMessage("Film ajouté avec succès !");
        setMovie({ title: "", description: "", release_year: "" });
      }
    } catch (err) {
      console.error(err);
      setMovieMessage("Erreur lors de l'ajout du film.");
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
          Chargement...
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
          Erreur : {error}
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
          <h1 className="text-2xl font-bold text-center mb-4">Profil</h1>
          <p className="mb-2">
            <span className="font-bold">Nom complet :</span> {user.full_name}
          </p>
          <p className="mb-2">
            <span className="font-bold">Email :</span> {user.email}
          </p>
          <p className="mb-2">
            <span className="font-bold">Date de naissance :</span>{" "}
            {user.birth_date}
          </p>
          <p className="mb-2">
            <span className="font-bold">Rôle :</span> {user.role}
          </p>
          <p className="mb-2">
            <span className="font-bold">Statut :</span> {user.status}
          </p>
        </div>
        {user.role === "admin" && (
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 mt-8">
            <h2 className="text-2xl font-bold text-center mb-4">
              Ajouter un film
            </h2>
            <form onSubmit={handleAddMovie}>
              <div className="mb-4">
                <label className="block mb-2">Titre</label>
                <input
                  type="text"
                  name="title"
                  value={movie.title}
                  onChange={handleMovieChange}
                  className="w-full p-2 rounded bg-gray-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Description</label>
                <textarea
                  name="description"
                  value={movie.description}
                  onChange={handleMovieChange}
                  className="w-full p-2 rounded bg-gray-700"
                  required
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Année de sortie</label>
                <input
                  type="number"
                  name="release_year"
                  value={movie.release_year}
                  onChange={handleMovieChange}
                  className="w-full p-2 rounded bg-gray-700"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
              >
                Ajouter le film
              </button>
            </form>
            {movieMessage && <p className="mt-4 text-center">{movieMessage}</p>}
          </div>
        )}
      </div>
    </>
  );
}
