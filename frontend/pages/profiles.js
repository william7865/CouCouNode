import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import "/src/app/globals.css";

export default function Profiles() {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProfileName, setNewProfileName] = useState("");
  const [message, setMessage] = useState("");
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [editingProfileName, setEditingProfileName] = useState("");
  const router = useRouter();

  // Récupérer l'utilisateur
  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const res = await fetch("http://localhost:3001/account", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Erreur lors de la récupération du compte");
        } else {
          setUser(data.user);
        }
      } catch (err) {
        setError("Erreur lors de la récupération des données.");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  // Récupérer tous les profils de l'utilisateur
  useEffect(() => {
    async function fetchProfiles() {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const response = await fetch("http://localhost:3001/profiles", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Erreur lors de la récupération des profils");
        } else {
          setProfiles(data.profiles);
        }
      } catch (err) {
        setError("Erreur lors de la récupération des données.");
      }
    }
    fetchProfiles();
  }, [router]);

  // Création d'un nouveau profil
  const handleCreateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("http://localhost:3001/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newProfileName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la création du profil.");
        setMessage("");
      } else {
        setMessage("Profil créé avec succès !");
        setError("");
        setNewProfileName("");
        setProfiles((prev) => [...prev, data.profile]);
      }
    } catch (err) {
      setError("Erreur lors de la création du profil.");
    }
  };

  // Suppression d'un profil
  const handleDeleteProfile = async (profileId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/profiles/${profileId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la suppression du profil.");
      } else {
        setMessage("Profil supprimé avec succès !");
        setError("");
        setProfiles((prev) =>
          prev.filter((profile) => profile.id !== profileId)
        );
      }
    } catch (err) {
      setError("Erreur lors de la suppression du profil.");
    }
  };

  // Démarrer la modification d'un profil
  const startEditing = (profile) => {
    setEditingProfileId(profile.id);
    setEditingProfileName(profile.name);
  };

  // Annuler la modification
  const cancelEditing = () => {
    setEditingProfileId(null);
    setEditingProfileName("");
  };

  // Sauvegarder la modification du profil
  const handleEditProfile = async (profileId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/profiles/${profileId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editingProfileName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la modification du profil.");
      } else {
        setMessage("Profil modifié avec succès !");
        setError("");
        setProfiles((prev) =>
          prev.map((profile) =>
            profile.id === profileId
              ? { ...profile, name: editingProfileName }
              : profile
          )
        );
        cancelEditing();
      }
    } catch (err) {
      setError("Erreur lors de la modification du profil.");
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
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
            <h2 className="text-2xl font-bold mb-6">Profils</h2>
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">
                Contrôle parental et permissions
              </h3>
              <ul className="space-y-4">
                <li className="border-b border-gray-700 pb-4">
                  <button className="text-blue-400 hover:text-blue-300">
                    Ajuster le contrôle parental
                  </button>
                  <p className="text-gray-400 text-sm mt-1">
                    Définissez la catégorie d'âge, bloquez des titres
                  </p>
                </li>
                <li className="border-b border-gray-700 pb-4">
                  <button className="text-blue-400 hover:text-blue-300">
                    Transférer un profil
                  </button>
                  <p className="text-gray-400 text-sm mt-1">
                    Copiez un profil vers un autre compte
                  </p>
                </li>
              </ul>
            </div>
            {message && <p className="text-green-500 mb-4">{message}</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleCreateProfile} className="mb-8">
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-2">
                  Ajouter un profil
                </h3>
                <p className="text-gray-400 mb-4">
                  Ajoutez jusqu'à 2 profils pour les personnes qui vivent avec
                  vous.
                </p>
              </div>
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Nom du profil"
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
              <button
                type="submit"
                className="mt-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                + Ajouter un profil
              </button>
            </form>
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Liste des profils</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {profiles.map((profile) => (
                  <div key={profile.id} className="text-center">
                    {editingProfileId === profile.id ? (
                      <>
                        <input
                          type="text"
                          value={editingProfileName}
                          onChange={(e) =>
                            setEditingProfileName(e.target.value)
                          }
                          className="w-full p-2 rounded bg-gray-700 text-white mb-2"
                        />
                        <button
                          onClick={() => handleEditProfile(profile.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded mr-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-24 h-24 bg-gray-700 rounded mx-auto mb-2 flex items-center justify-center text-2xl">
                          {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-white">{profile.name}</p>
                        <div className="flex justify-center space-x-2 mt-2">
                          <button
                            onClick={() => startEditing(profile)}
                            className="mt-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-2 rounded"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18.5 3.5a2.121 2.121 0 113 3L12 14l-4 1 1-4 9.5-9.5z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteProfile(profile.id)}
                            className="mt-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-2 rounded"
                          >
                            {/* Icône de suppression (corbeille) */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m0 0a1 1 0 011 1v2H9V4a1 1 0 011-1z"
                              />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                    <p className="text-gray-400 text-sm mt-1">Votre profil</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
