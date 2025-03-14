import { useEffect, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "./header";
import "/src/app/globals.css";

export default function Home() {
  const { token } = useContext(AuthContext);
  const router = useRouter();

  // Redirige vers /login si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token]);

  if (!token) return <p>Redirection en cours...</p>;

  return (
    <div>
      <Header />
      <h1>Accueil</h1>
      <p class="bg-gray-50">Bienvenue sur votre page d'accueil.</p>
      <button
        onClick={() => {
          localStorage.removeItem("token"); // Supprime le token
          window.location.reload(); // Recharge la page pour forcer la déconnexion
        }}
      >
        Se Déconnecter
      </button>
    </div>
  );
}
