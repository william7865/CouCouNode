import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "./header";
import "/src/app/globals.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
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
      </div>
    </>
  );
}
