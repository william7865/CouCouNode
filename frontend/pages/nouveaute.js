import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "./header";

export default function NouveautePage() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    if (!token || typeof token !== "string") {
      router.push("/login");
      return;
    }

    const fetchLatestEpisodes = async () => {
      try {
        const response = await fetch("http://localhost:3001/episodes/latest", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }

        const data = await response.json();
        setEpisodes(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des nouveautés :", error);
      }
    };

    fetchLatestEpisodes();
  }, [token]);

  return (
    <>
      <Header />
      <main style={{ padding: "2rem", color: "#fff" }}>
        <h1>Nouveautés</h1>
        {episodes.length === 0 ? (
          <p>Aucun épisode récent.</p>
        ) : (
          <ul>
            {episodes.map((ep) => (
              <li key={ep.id}>
                {ep.title} — {ep.date}
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
