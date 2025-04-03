import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import "/src/app/globals.css";

export default function Account() {
  const [user, setUser] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [movie, setMovie] = useState({
    title: "",
    description: "",
    release_year: "",
    genre_id: "",
    image_url: "",
  });

  const [serie, setSerie] = useState({
    title: "",
    description: "",
    detailed_description: "",
    release_year: "",
    rating: "",
    genre_id: "",
    image_url: "",
  });

  const [serieMessage, setSerieMessage] = useState("");

  const handleSerieChange = (e) => {
    setSerie({
      ...serie,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddSerie = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:3001/series", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(serie),
      });
      const data = await response.json();
      if (!response.ok) {
        setSerieMessage(data.error || "Erreur lors de l'ajout de la série.");
      } else {
        setSerieMessage("Série ajoutée avec succès !");
        setSerie({
          title: "",
          description: "",
          detailed_description: "",
          release_year: "",
          rating: "",
          genre_id: "",
          image_url: "",
        });
      }
    } catch (err) {
      setSerieMessage("Erreur lors de l'ajout de la série.");
    }
  };
  const [movieMessage, setMovieMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchAccount() {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
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
        } else {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Erreur lors de l'appel API:", err);
        setError("Erreur lors de la récupération des données.");
      } finally {
        setLoading(false);
      }
    }
    fetchAccount();
  }, [router]);

  // Récupérer la liste des genres
  useEffect(() => {
    async function fetchGenres() {
      try {
        const response = await fetch("http://localhost:3001/genres");
        if (response.ok) {
          const data = await response.json();
          setGenres(data);
        } else {
          console.error("Erreur lors de la récupération des genres");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des genres", err);
      }
    }
    fetchGenres();
  }, []);

  // Gestion du changement dans les champs du formulaire
  const handleMovieChange = (e) => {
    setMovie({
      ...movie,
      [e.target.name]: e.target.value,
    });
  };

  // Gestion de l'ajout d'un film par l'admin
  const handleAddMovie = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:3001/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(movie),
      });
      const data = await response.json();
      if (!response.ok) {
        setMovieMessage(data.error || "Erreur lors de l'ajout du film.");
      } else {
        setMovieMessage("Film ajouté avec succès !");
        setMovie({
          title: "",
          description: "",
          release_year: "",
          genre_id: "",
          image_url: "",
        });
      }
    } catch (err) {
      setMovieMessage("Erreur lors de l'ajout du film.");
    }
  };

  // Récupérer le statut de l'abonnement
  useEffect(() => {
    async function fetchSubscription() {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:3001/subscription", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setSubscriptionStatus(data.status);
        } else {
          setSubscriptionStatus(
            "Erreur lors de la récupération de l'abonnement"
          );
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de l'abonnement:", err);
        setSubscriptionStatus("Erreur lors de la récupération de l'abonnement");
      }
    }
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
          Chargement...
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
          Erreur : {error}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-red-600">Streamflix</h1>

          <div className="mb-8">
            <button
              className="text-gray-300 hover:text-white"
              onClick={() => router.push("/")}
            >
              ← Retour à Streamflix
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
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
                      onClick={() => router.push("/management/users")}
                    >
                      Gérer les utilisateurs
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
                  <li>
                    <button
                      className="text-blue-400 hover:text-blue-300"
                      onClick={() => router.push("/management/access")}
                    >
                      Gérer les accès et appareils
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">{/* Menu de navigation */}</div>
            <div className="col-span-3">
              {/* Contenu principal */}
              <div className="p-8 rounded-lg border border-gray-700">
                <h2 className="text-2xl font-bold mb-6">
                  Ajouter un nouveau contenu
                </h2>
                {/* Formulaires */}
                <form onSubmit={handleAddMovie} className="space-y-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    Ajouter un film
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Colonne gauche */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Titre du film
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={movie.title}
                          onChange={handleMovieChange}
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
                          onChange={handleMovieChange}
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
                          onChange={handleMovieChange}
                          className="w-full px-4 py-2.5 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600"
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
                    {/* Colonne droite */}
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
                        onChange={handleMovieChange}
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
                      onChange={handleMovieChange}
                      className="w-full px-4 py-2.5 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600"
                      rows="4"
                      placeholder="Synopsis..."
                      required
                    ></textarea>
                  </div>
                  {movieMessage && (
                    <div className="text-sm text-gray-400">{movieMessage}</div>
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
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">{/* Menu de navigation */}</div>
            <div className="col-span-3">
              {/* Contenu principal */}
              <div className="p-8 rounded-lg border border-gray-700">
                <h2 className="text-2xl font-bold mb-6">
                  Ajouter un nouveau contenu
                </h2>
                {/* Formulaires */}
                <form onSubmit={handleAddSerie} className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Ajouter une série
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Colonne gauche */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Titre de la série
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={serie.title}
                          onChange={handleSerieChange}
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
                          onChange={handleSerieChange}
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
                          onChange={handleSerieChange}
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
                    {/* Colonne droite */}
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
                        onChange={handleSerieChange}
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
                      onChange={handleSerieChange}
                      className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600"
                      rows="4"
                      placeholder="Synopsis de la série..."
                      required
                    ></textarea>
                  </div>
                  {serieMessage && (
                    <div className="text-sm text-gray-400">{serieMessage}</div>
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
