import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "./header";
import "/src/app/globals.css";

export default function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [newProfileName, setNewProfileName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Récupérer tous les profiles de l'utilisateur
  const fetchProfiles = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("http://localhost:3001/profiles", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la récupération des profiles.");
      } else {
        setProfiles(data.profiles || []);
      }
    } catch (err) {
      setError("Erreur lors de la récupération des profiles.");
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []); // Utilisation d'un tableau de dépendances vide

  // Création d'un nouveau profile
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
        setError(data.error || "Erreur lors de la création du profile.");
        setMessage("");
      } else {
        setMessage("Profile créé avec succès !");
        setError("");
        setNewProfileName("");
        fetchProfiles();
      }
    } catch (err) {
      setError("Erreur lors de la création du profile.");
    }
  };

  // Suppression d'un profile
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
        setError(data.error || "Erreur lors de la suppression du profile.");
      } else {
        setMessage("Profile supprimé avec succès !");
        setError("");
        fetchProfiles();
      }
    } catch (err) {
      setError("Erreur lors de la suppression du profile.");
    }
  };

  // Accéder à un profile (redirection vers la page dédiée)
  const handleAccessProfile = (profileId) => {
    router.push(`/profile/${profileId}`);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Gérer vos Profiles</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {message && <p className="text-green-500 mb-4">{message}</p>}
          <form onSubmit={handleCreateProfile} className="mb-8">
            <label className="block mb-2">Nouveau Profile</label>
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Nom du profile"
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            />
            <button
              type="submit"
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Créer le profile
            </button>
          </form>

          <h2 className="text-2xl font-bold mb-4">Vos Profiles</h2>
          {profiles.length === 0 ? (
            <p>Aucun profile créé.</p>
          ) : (
            <ul>
              {profiles.map((profile) => (
                <li
                  key={profile.id}
                  className="flex items-center justify-between border p-2 mb-2"
                >
                  <span>{profile.name}</span>
                  <div>
                    <button
                      onClick={() => handleAccessProfile(profile.id)}
                      className="mr-2 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded"
                    >
                      Accéder
                    </button>
                    <button
                      onClick={() => handleDeleteProfile(profile.id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded"
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
