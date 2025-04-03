import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import "/src/app/globals.css";

export default function Security() {
  const [user, setUser] = useState(null);
  const [updatedInfo, setUpdatedInfo] = useState({
    email: "",
    full_name: "",
    birth_date: "",
    password: "",
    newPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Récupérer le compte de l'utilisateur via l'endpoint "/account"
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
          setUpdatedInfo({
            email: data.user.email || "",
            full_name: data.user.full_name || "",
            birth_date: data.user.birth_date || "",
            password: "",
            newPassword: "",
          });
        }
      } catch (err) {
        setError("Erreur lors de la récupération des données.");
      }
    }
    fetchAccount();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Soumettre les modifications du compte via l'endpoint "/account"
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    if (updatedInfo.newPassword && !updatedInfo.password) {
      setError(
        "Merci de renseigner votre mot de passe actuel pour changer de mot de passe."
      );
      return;
    }
    try {
      const response = await fetch("http://localhost:3001/account", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedInfo),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(
          data.error || "Erreur lors de la mise à jour des informations."
        );
      } else {
        setMessage("Informations mises à jour avec succès !");
        setUser(data.user);
        setUpdatedInfo({
          email: data.user.email || "",
          full_name: data.user.full_name || "",
          birth_date: data.user.birth_date || "",
          password: "",
          newPassword: "",
        });
      }
    } catch (err) {
      setError("Erreur lors de la mise à jour des informations.");
    }
  };

  if (!user) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
          Chargement du compte...
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
            <div className="md:col-span-3">
              <h1 className="text-4xl font-bold mb-2">Sécurité</h1>
              <p className="mb-6 text-gray-400">
                Gérez les informations de votre compte en toute sécurité. Vous
                pouvez mettre à jour votre email, nom complet, date de naissance
                et mot de passe.
              </p>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              {message && <p className="text-green-500 mb-4">{message}</p>}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={updatedInfo.email}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Nom complet</label>
                  <input
                    type="text"
                    name="full_name"
                    value={updatedInfo.full_name}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Date de naissance</label>
                  <input
                    type="date"
                    name="birth_date"
                    value={updatedInfo.birth_date}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Mot de passe actuel</label>
                  <input
                    type="password"
                    name="password"
                    value={updatedInfo.password}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Votre mot de passe actuel"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Nouveau mot de passe</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={updatedInfo.newPassword}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Votre nouveau mot de passe"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Mettre à jour
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
