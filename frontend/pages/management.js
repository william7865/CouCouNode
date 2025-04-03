import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Footer from "./components/footer";
import "/src/app/globals.css";

// États initiaux internes
const initialMovie = {
  title: "",
  description: "",
  release_year: "",
  genre_id: "",
  image_url: "",
};

const initialSerie = {
  title: "",
  description: "",
  detailed_description: "",
  release_year: "",
  rating: "",
  genre_id: "",
  image_url: "",
};

export default function Account() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [movie, setMovie] = useState(initialMovie);
  const [serie, setSerie] = useState(initialSerie);
  const [serieMessage, setSerieMessage] = useState("");
  const [movieMessage, setMovieMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState({});
  const router = useRouter();

  // gestion générique de l'update d'un input
  const handleChange = (setter, state) => (e) =>
    setter({ ...state, [e.target.name]: e.target.value });

  // fonction générique pour l'ajout de contenu
  const handleAddContent = async (url, content, setMessage, resetState) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(content),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Erreur lors de l'ajout du contenu.");
      } else {
        setMessage("Contenu ajouté avec succès !");
        resetState();
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout :", err);
      setMessage("Erreur lors de l'ajout du contenu.");
    }
  };

  const handleAddMovie = (e) => {
    e.preventDefault();
    handleAddContent(
      "http://localhost:3001/movies",
      movie,
      setMovieMessage,
      () => setMovie(initialMovie)
    );
  };

  const handleAddSerie = (e) => {
    e.preventDefault();
    handleAddContent(
      "http://localhost:3001/series",
      serie,
      setSerieMessage,
      () => setSerie(initialSerie)
    );
  };

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");
      try {
        const response = await fetch("http://localhost:3001/account", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Erreur lors de la récupération du compte");
        } else setUser(data.user);
      } catch (err) {
        setError("Erreur lors de la récupération des données.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // Récupération des genres
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("http://localhost:3001/genres");
        if (response.ok) {
          const data = await response.json();
          setGenres(data);
        } else console.error("Erreur lors de la récupération des genres");
      } catch (err) {
        console.error("Erreur lors de la récupération des genres", err);
      }
    })();
  }, []);

  // Récupération des utilisateurs pour l'admin
  useEffect(() => {
    (async () => {
      if (user && user.role === "admin") {
        const token = localStorage.getItem("token");
        try {
          const response = await fetch("http://localhost:3001/users", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (response.ok) setUsers(data.users);
          else console.error("Erreur lors de la récupération des utilisateurs");
        } catch (err) {
          console.error("Erreur lors de la récupération des utilisateurs", err);
        }
      }
    })();
  }, [user]);

  // Initialisation des statuts d'abonnement
  useEffect(() => {
    if (users.length > 0) {
      const subs = {};
      users.forEach((u) => (subs[u.id] = u.subscription_status));
      setUserSubscriptions(subs);
    }
  }, [users]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Confirmer la suppression de cet utilisateur ?"))
      return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:3001/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) alert(data.error || "Erreur lors de la suppression");
      else {
        alert("Utilisateur supprimé avec succès");
        setUsers(users.filter((u) => u.id !== userId));
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de l'utilisateur");
    }
  };

  const handleUpdateUserSubscription = async (userId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:3001/subscription/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: userSubscriptions[userId] }),
        }
      );
      const text = await response.text();
      let data = {};
      if (text) data = JSON.parse(text);
      if (!response.ok) alert(data.error || "Erreur lors de la mise à jour");
      else alert("Abonnement mis à jour pour l'utilisateur " + userId);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour de l'abonnement");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Chargement...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Erreur : {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <img
          src="/images/logo-streamflix.png"
          alt="Streamflix"
          onClick={() => router.push("/")}
          className="h-16 w-40 cursor-pointer"
        />
        <div className="mb-8">
          <button
            className="text-gray-300 hover:text-white"
            onClick={() => router.push("/")}
          >
            ← Retour à Streamflix
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Navigation */}
          <div className="col-span-1">
            <h2 className="text-xl font-bold mb-4">Présentation</h2>
            <ul className="space-y-2 text-gray-400">
              <li
                className="hover:text-white cursor-pointer"
                onClick={() => router.push("/account")}
              >
                Abonnement
              </li>
              <li
                className="hover:text-white cursor-pointer"
                onClick={() => router.push("/security")}
              >
                Sécurité
              </li>
              <li
                className="hover:text-white cursor-pointer"
                onClick={() => router.push("/profiles")}
              >
                Profils
              </li>
              {user.role === "admin" && (
                <li
                  className="hover:text-white cursor-pointer"
                  onClick={() => router.push("/management")}
                >
                  Gestion
                </li>
              )}
            </ul>
          </div>
          {/* Contenu de gestion */}
          <div className="col-span-3">
            <h2 className="text-4xl font-bold mb-2">Gestion</h2>
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Administration Rapide
              </h3>
              <ul className="space-y-4">
                <li className="border-b border-gray-700 pb-4">
                  <button
                    className="text-blue-400 hover:text-blue-300"
                    onClick={() => router.push("/management/new-content")}
                  >
                    Ajouter / Modifier le contenu
                  </button>
                </li>
                <li className="border-b border-gray-700 pb-4">
                  <button
                    className="text-blue-400 hover:text-blue-300"
                    onClick={() => router.push("/management/payments")}
                  >
                    Gérer les paiements
                  </button>
                </li>
                <li className="border-b border-gray-700 pb-4">
                  <button
                    className="text-blue-400 hover:text-blue-300"
                    onClick={() => router.push("/management/network-stats")}
                  >
                    Statistiques du réseau
                  </button>
                </li>
                <li className="border-b border-gray-700 pb-4">
                  <button
                    className="text-blue-400 hover:text-blue-300"
                    onClick={() => router.push("/management/access")}
                  >
                    Gérer les accès et appareils
                  </button>
                </li>
              </ul>
            </div>
            <ul className="space-y-4 mt-8">
              {/* Section : Gérer les utilisateurs */}
              <li className="border-b border-gray-700 pb-4">
                <div className="p-8 rounded-lg border border-gray-700">
                  <h2 className="text-2xl font-bold mb-4">
                    Gérer les utilisateurs
                  </h2>
                  {users.length > 0 ? (
                    <ul className="space-y-4">
                      {users.map((u) => (
                        <li
                          key={u.id}
                          className="p-4 border border-gray-700 rounded"
                        >
                          <div className="flex flex-col space-y-2">
                            <p>
                              <span className="font-bold">Email :</span>{" "}
                              {u.email}
                            </p>
                            <p>
                              <span className="font-bold">Nom complet :</span>{" "}
                              {u.full_name}
                            </p>
                            <div className="flex flex-col gap-2">
                              <span>
                                <span className="font-bold">Abonnement :</span>{" "}
                                {userSubscriptions[u.id]}
                              </span>
                              <select
                                value={userSubscriptions[u.id]}
                                onChange={(e) =>
                                  setUserSubscriptions({
                                    ...userSubscriptions,
                                    [u.id]: e.target.value,
                                  })
                                }
                                className="bg-gray-700 text-white px-3 py-1 rounded"
                              >
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="canceled">Canceled</option>
                              </select>
                              <button
                                onClick={() =>
                                  handleUpdateUserSubscription(u.id)
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded self-start"
                              >
                                Modifier l'abonnement
                              </button>
                            </div>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded self-start"
                            >
                              Supprimer
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Aucun utilisateur trouvé.</p>
                  )}
                </div>
              </li>
              {/* Section : Ajouter un film */}
              <li className="border-b border-gray-700 pb-4">
                <div className="p-8 rounded-lg border border-gray-700">
                  <h2 className="text-2xl font-bold mb-6">Ajouter un film</h2>
                  <form onSubmit={handleAddMovie} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Titre du film
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={movie.title}
                            onChange={handleChange(setMovie, movie)}
                            className="w-full px-4 py-2.5 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600"
                            placeholder="Titre original"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Année de sortie
                          </label>
                          <input
                            type="number"
                            name="release_year"
                            value={movie.release_year}
                            onChange={handleChange(setMovie, movie)}
                            className="w-full px-4 py-2.5 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600"
                            min="1900"
                            max="2100"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Genre
                          </label>
                          <select
                            name="genre_id"
                            value={movie.genre_id}
                            onChange={handleChange(setMovie, movie)}
                            className="w-full px-4 py-2.5 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600"
                            required
                          >
                            <option value="">Sélectionner un genre</option>
                            {genres.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.genre_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Aperçu de l'image
                        </label>
                        <div className="aspect-w-2 aspect-h-3 bg-gray-900 rounded-lg border-dashed border border-gray-700 overflow-hidden">
                          {movie.image_url ? (
                            <img
                              src={movie.image_url}
                              alt="Aperçu"
                              className="object-cover w-full h-full"
                              onError={(e) =>
                                (e.target.src =
                                  "https://via.placeholder.com/300x450?text=Image+non+disponible")
                              }
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                              <svg
                                className="w-12 h-12 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-sm">URL de l'affiche</span>
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          name="image_url"
                          value={movie.image_url}
                          onChange={handleChange(setMovie, movie)}
                          className="mt-2 w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600"
                          placeholder="Coller le lien de l'image ici"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={movie.description}
                        onChange={handleChange(setMovie, movie)}
                        className="w-full px-4 py-2.5 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600"
                        rows="4"
                        placeholder="Synopsis..."
                        required
                      ></textarea>
                    </div>
                    {movieMessage && (
                      <div className="text-sm text-gray-400">
                        {movieMessage}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Publier le film
                    </button>
                  </form>
                </div>
              </li>
              {/* Section : Ajouter une série */}
              <li className="border-b border-gray-700 pb-4">
                <div className="p-8 rounded-lg border border-gray-700">
                  <h2 className="text-2xl font-bold mb-6">Ajouter une série</h2>
                  <form onSubmit={handleAddSerie} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Titre de la série
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={serie.title}
                            onChange={handleChange(setSerie, serie)}
                            className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600"
                            placeholder="Titre original"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Année de sortie
                          </label>
                          <input
                            type="number"
                            name="release_year"
                            value={serie.release_year}
                            onChange={handleChange(setSerie, serie)}
                            className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600"
                            min="1900"
                            max="2100"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Genre
                          </label>
                          <select
                            name="genre_id"
                            value={serie.genre_id}
                            onChange={handleChange(setSerie, serie)}
                            className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600"
                            required
                          >
                            <option value="">Sélectionner un genre</option>
                            {genres.map((genre) => (
                              <option key={genre.id} value={genre.id}>
                                {genre.genre_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Aperçu de l'image
                        </label>
                        <div className="aspect-w-2 aspect-h-3 bg-gray-900 rounded-lg border-dashed border border-gray-700 overflow-hidden">
                          {serie.image_url ? (
                            <img
                              src={serie.image_url}
                              alt="Aperçu"
                              className="object-cover w-full h-full"
                              onError={(e) =>
                                (e.target.src =
                                  "https://via.placeholder.com/300x450?text=Image+non+disponible")
                              }
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                              <svg
                                className="w-12 h-12 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-sm">URL de l'affiche</span>
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          name="image_url"
                          value={serie.image_url}
                          onChange={handleChange(setSerie, serie)}
                          className="mt-2 w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600"
                          placeholder="Coller le lien de l'image ici"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={serie.description}
                        onChange={handleChange(setSerie, serie)}
                        className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600"
                        rows="4"
                        placeholder="Synopsis de la série..."
                        required
                      ></textarea>
                    </div>
                    {serieMessage && (
                      <div className="text-sm text-gray-400">
                        {serieMessage}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Publier la série
                    </button>
                  </form>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
