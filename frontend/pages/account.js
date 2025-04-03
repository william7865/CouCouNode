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
  const [movieMessage, setMovieMessage] = useState("");
  const router = useRouter();

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

  const handleMovieChange = (e) => {
    setMovie({
      ...movie,
      [e.target.name]: e.target.value,
    });
  };

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

  // Récupération des informations du compte
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

  // Récupération des genres
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

  // Récupération du statut de l'abonnement
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
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Erreur : {error}
      </div>
    );
  }

  return (
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
            <h2 className="text-4xl font-bold mb-2">Compte</h2>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">
                Détails de l'abonnement
              </h3>
              <p className="text-gray-400 mb-2">
                Compte créé le{" "}
                {new Date(user.created_at).toLocaleDateString("fr-FR")}
              </p>
              <p className="text-gray-400 mb-4">
                Statut de l'abonnement :{" "}
                {subscriptionStatus ? subscriptionStatus : "Chargement..."}
              </p>
              <p className="text-gray-400 mb-4">Offre Premium</p>
              <p className="text-gray-400 mb-4">
                Prochain paiement : 18 avril 2025
              </p>
              <p className="text-gray-400 mb-4">
                Compte de l'utilisateur : {user.email}
              </p>
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
                    Partagez Netflix avec quelqu'un qui n'habite pas sous votre
                    toit.
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
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
