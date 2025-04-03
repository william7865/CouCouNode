import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "./header";
import "/src/app/globals.css";

export default function Account() {
  const [user, setUser] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState({
    title: "",
    description: "",
    release_year: "",
    image_url: "",
  });
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

  // Nouvelle fonction pour récupérer le statut de l'abonnement
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
          setSubscriptionStatus(data.status); // Assurez-vous que l'API renvoie bien une propriété "status"
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

  // Nouvelle fonction pour gérer l'ajout d'un film
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
        body: JSON.stringify(movie), // Inclut image_url
      });
      const data = await response.json();
      if (response.ok) {
        setMovieMessage("Film ajouté avec succès !");
        setMovie({
          title: "",
          description: "",
          release_year: "",
          image_url: "",
        }); // Réinitialiser le formulaire
      } else {
        setMovieMessage(data.error || "Erreur lors de l'ajout du film.");
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout du film:", err);
      setMovieMessage("Erreur lors de l'ajout du film.");
    }
  };

  const handleMovieChange = (e) => {
    const { name, value } = e.target;
    setMovie((prevMovie) => ({
      ...prevMovie,
      [name]: value,
    }));
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
            <button className="text-gray-300 hover:text-white">
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
                  onClick={() => router.push("/devices")}
                >
                  Appareils
                </li>
                <li
                  className="hover:text-white cursor-pointer"
                  onClick={() => router.push("/profiles")}
                >
                  Profils
                </li>
              </ul>
            </div>

            <div className="col-span-3">
              <h2 className="text-2xl font-bold mb-6">Compte</h2>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">
                  Détails de l'abonnement
                </h3>
                <p className="text-gray-400 mb-2">
                  Abonnement débuté en avril 2020
                </p>
                <p className="text-gray-400 mb-4">
                  Statut de l'abonnement :{" "}
                  {subscriptionStatus ? subscriptionStatus : "Chargement..."}
                </p>
                <p className="text-gray-400 mb-4">Offre Premium</p>
                <p className="text-gray-400 mb-4">
                  Prochain paiement : 18 avril 2025
                </p>
                <p className="text-gray-400 mb-4">{user.email}</p>
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
                  Gérer l'abonnement
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
                <ul className="space-y-4">
                  <li className="border-b border-gray-700 pb-4">
                    <button className="text-blue-400 hover:text-blue-300">
                      Changer d'offre
                    </button>
                  </li>
                  <li className="border-b border-gray-700 pb-4">
                    <button className="text-blue-400 hover:text-blue-300">
                      Gérer votre mode de paiement
                    </button>
                  </li>
                  <li className="border-b border-gray-700 pb-4">
                    <button className="text-blue-400 hover:text-blue-300">
                      Acheter une option abonné supplémentaire
                    </button>
                    <p className="text-gray-400 text-sm mt-1">
                      Partagez Netflix avec quelqu'un qui n'habite pas sous
                      votre toit.
                    </p>
                  </li>
                  <li className="border-b border-gray-700 pb-4">
                    <button className="text-blue-400 hover:text-blue-300">
                      Nombre du réseau
                    </button>
                  </li>
                  <li>
                    <button className="text-blue-400 hover:text-blue-300">
                      Gérer les accès et les appareils
                    </button>
                  </li>
                </ul>
              </div>

              {user.role === "admin" && (
                <div className="bg-gray-800 p-6 rounded-lg mt-8">
                  <h2 className="text-xl font-bold mb-4">
                    Ajouter un film (Admin)
                  </h2>
                  <form onSubmit={handleAddMovie}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block mb-2 text-gray-400">
                          Titre
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={movie.title}
                          onChange={handleMovieChange}
                          className="w-full p-2 rounded bg-gray-700 text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-gray-400">
                          Année de sortie
                        </label>
                        <input
                          type="number"
                          name="release_year"
                          value={movie.release_year}
                          onChange={handleMovieChange}
                          className="w-full p-2 rounded bg-gray-700 text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-gray-400">
                          URL de l'image
                        </label>
                        <input
                          type="text"
                          name="image_url"
                          value={movie.image_url}
                          onChange={handleMovieChange}
                          className="w-full p-2 rounded bg-gray-700 text-white"
                          placeholder="http://example.com/image.jpg"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block mb-2 text-gray-400">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={movie.description}
                        onChange={handleMovieChange}
                        className="w-full p-2 rounded bg-gray-700 text-white"
                        required
                        rows="4"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                    >
                      Ajouter le film
                    </button>
                    {movieMessage && (
                      <p className="mt-4 text-red-400">{movieMessage}</p>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
