import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "./components/header";
import Footer from "./components/footer";

export default function NouveautePage() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const [episodes, setEpisodes] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!token) router.push("/login");

    const fetchEpisodes = async () => {
      try {
        const res = await fetch("http://localhost:3001/episodes/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEpisodes(data);
      } catch (error) {
        console.error("Error fetching episodes:", error);
      }
    };

    fetchEpisodes();
  }, [token]);

  // Barre de recherche
  const filteredEpisodes = episodes.filter((ep) =>
    ep.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black to-space-800 text-white">
      <Header />
      <div className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="animate-galaxy-rotate h-full w-full bg-[url('/galaxy-pattern.png')] bg-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-space-900/50" />
        </div>

        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-neon-400 to-cyan-400">
              Explorer les Nouveautés
            </h1>
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Rechercher dans l'espace des nouveautés..."
                className="w-full px-6 py-4 rounded-full bg-space-700/50 backdrop-blur-lg border border-neon-400/30 focus:outline-none focus:ring-2 focus:ring-neon-400"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-4 top-3">
                <button className="p-2 bg-neon-400 rounded-full hover:scale-110 transition-transform">
                  <svg
                    className="w-6 h-6 text-space-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4 mb-12">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-3 rounded-lg ${
              viewMode === "grid"
                ? "bg-neon-400 text-space-900"
                : "bg-space-700"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-3 rounded-lg ${
              viewMode === "list"
                ? "bg-neon-400 text-space-900"
                : "bg-space-700"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredEpisodes.map((episode) => (
              <div
                key={episode.id}
                className="group relative bg-space-700 rounded-2xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl"
              >
                <div className="relative h-64">
                  <img
                    src={episode.image_url || "/placeholder-space.jpg"}
                    alt={episode.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold mb-2">{episode.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-neon-300">
                      <span>{new Date(episode.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{episode.duration} min</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-neon-400/20 text-neon-400 rounded-full text-sm">
                      Saison {episode.season}
                    </span>
                    <span className="px-3 py-1 bg-cyan-400/20 text-cyan-400 rounded-full text-sm">
                      Épisode {episode.episode_number}
                    </span>
                  </div>
                  <p className="text-gray-300 line-clamp-2">
                    {episode.description}
                  </p>
                </div>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-neon-400 rounded-full hover:rotate-90 transition-transform">
                    <svg
                      className="w-6 h-6 text-space-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEpisodes.map((episode) => (
              <div
                key={episode.id}
                className="group bg-space-700 rounded-xl p-6 flex gap-6 items-center hover:bg-space-600 transition-colors"
              >
                <div className="relative w-32 h-32 flex-shrink-0">
                  <img
                    src={episode.image_url || "/placeholder-space.jpg"}
                    alt={episode.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                    <svg
                      className="w-12 h-12 text-neon-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-xl font-bold">{episode.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                    <span>{new Date(episode.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{episode.duration} min</span>
                    <span>•</span>
                    <span>Saison {episode.season}</span>
                  </div>
                  <p className="text-gray-400 line-clamp-2">
                    {episode.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
