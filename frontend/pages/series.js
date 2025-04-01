import { useEffect, useState, useContext, useRef } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "./header";

const CATEGORIES = [
  { id: 1, name: "Action", displayName: "Action" },
  { id: 2, name: "Drame", displayName: "Drame" },
  { id: 3, name: "Policier", displayName: "Policier" },
  { id: 4, name: "Comédie", displayName: "Comédie" },
  { id: 5, name: "Classiques", displayName: "Séries Cultes" }
];

const CLASSIC_SERIES = [
  "Breaking Bad",
  "Game of Thrones",
  "Peaky Blinders",
  "The Sopranos",
  "Lost",
  "Prison Break"
];

function SeriesCard({ serie, onClick }) {
  return (
    <div 
      className="group relative aspect-video rounded-md overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:z-10"
      onClick={onClick}
    >
      <img
        src={serie.image_url}
        className="w-full h-full object-cover group-hover:opacity-70 transition-opacity duration-300"
        onError={(e) => e.target.src = "/images/placeholder-series.jpg"}
        alt={`Affiche ${serie.title}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
        <div>
          <h3 className="font-bold">{serie.title}</h3>
          <div className="flex gap-2 text-xs items-center">
            <span>{serie.release_year}</span>
            <span>•</span>
            <span>{serie.seasons} saison{serie.seasons > 1 ? 's' : ''}</span>
            {serie.isClassic && <span className="text-yellow-400 ml-1">⭐</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SeriesPage() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const [series, setSeries] = useState([]);
  const [featuredSerie, setFeaturedSerie] = useState(null);
  const [selectedSerie, setSelectedSerie] = useState(null);
  const [activeTab, setActiveTab] = useState("episodes");
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!token) router.push("/login");
    
    const fetchSeries = async () => {
      try {
        const response = await fetch("http://localhost:3001/series", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        
        const formattedData = data.map(serie => ({
          ...serie,
          image_url: serie.image_url || "/images/placeholder-series.jpg",
          banner_url: serie.banner_url || serie.image_url || "/images/placeholder-banner.jpg",
          trailer_url: serie.trailer_url || null,
          isClassic: CLASSIC_SERIES.includes(serie.title) || Boolean(serie.isClassic),
          isFeatured: Boolean(serie.isFeatured),
          seasons: serie.seasons || 1
        }));
        
        setSeries(formattedData);
        const featured = formattedData.find(s => s.isFeatured) || formattedData.find(s => s.title === "Prison Break") || formattedData[0];
        setFeaturedSerie(featured);
        setIsLoading(false);

        if (featured?.trailer_url) {
          const video = document.createElement('video');
          video.src = featured.trailer_url;
          video.preload = 'auto';
        }
      } catch (error) {
        console.error("Error:", error);
        setIsLoading(false);
      }
    };

    fetchSeries();
  }, [token, router]);

  useEffect(() => {
    if (featuredSerie?.trailer_url && !isLoading) {
      timeoutRef.current = setTimeout(() => {
        setIsPlayingTrailer(true);
      }, 3000);

      return () => clearTimeout(timeoutRef.current);
    }
  }, [featuredSerie, isLoading]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setIsPlayingTrailer(false);
      timeoutRef.current = setTimeout(() => {
        if (video) {
          video.currentTime = 0;
          setIsPlayingTrailer(true);
          video.play().catch(e => console.log("Auto-play prevented:", e));
        }
      }, 30000);
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
      clearTimeout(timeoutRef.current);
    };
  }, [isPlayingTrailer]);

  const getSeriesByCategory = (category) => {
    const isClassicCategory = category.name === "Classiques";
    
    return series
      .filter(serie => {
        if (isClassicCategory) {
          return serie.isClassic && serie.id !== featuredSerie?.id;
        }
        return (
          serie.genres?.includes(category.name) &&
          !serie.isClassic &&
          serie.id !== featuredSerie?.id
        );
      })
      .slice(0, 5)
      .sort((a, b) => {
        if (isClassicCategory) return (b.popularity || 0) - (a.popularity || 0);
        return 0;
      });
  };

  if (!token || isLoading || !featuredSerie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-red-600 rounded-full mb-4"></div>
          <span className="text-white">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <Header className="fixed top-0 w-full z-50 bg-black" />
      
      {selectedSerie && (
        <div className="fixed inset-0 bg-black/95 z-40 overflow-y-auto pt-16 pb-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setSelectedSerie(null)} 
                className="text-gray-300 hover:text-white p-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
              <div className="relative w-full h-96 overflow-hidden">
                <div className="absolute inset-0">
                  <img 
                    src={selectedSerie.banner_url}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center 30%' }}
                    onError={(e) => e.target.src = selectedSerie.image_url}
                    alt={`Bannière ${selectedSerie.title}`}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
              </div>

              <div className="p-6">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <button className="bg-white hover:bg-gray-200 text-black px-6 py-2 rounded flex items-center gap-2 font-bold transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    Lecture
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-500 bg-opacity-70 px-4 py-2 rounded flex items-center gap-2 font-bold transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ma liste
                  </button>
                </div>

                <div className="border-b border-gray-700 mb-6">
                  <div className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab("episodes")}
                      className={`pb-4 px-1 font-medium ${activeTab === "episodes" ? "text-white border-b-2 border-white" : "text-gray-400 hover:text-white"} transition-colors`}
                    >
                      Épisodes
                    </button>
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`pb-4 px-1 font-medium ${activeTab === "details" ? "text-white border-b-2 border-white" : "text-gray-400 hover:text-white"} transition-colors`}
                    >
                      Détails
                    </button>
                  </div>
                </div>

                {activeTab === "episodes" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Saison {selectedSerie.episodes?.[0]?.season_number || 1}</h2>
                    {selectedSerie.episodes?.map((episode) => (
                      <div 
                        key={episode.id} 
                        className="flex gap-6 p-4 hover:bg-gray-800/50 rounded-lg transition cursor-pointer"
                      >
                        <div className="w-48 h-32 flex-shrink-0 bg-gray-800 rounded-md overflow-hidden relative">
                          <img
                            src={episode.image_url || selectedSerie.image_url}
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.src = "/images/placeholder-episode.jpg"}
                            alt={`Épisode ${episode.episode_number}`}
                          />
                          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                            {episode.duration || '25m'}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            Épisode {episode.episode_number}: {episode.title}
                          </h3>
                          <p className="text-gray-300 mt-2">{episode.description || "Aucune description disponible."}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">À propos de {selectedSerie.title}</h3>
                      <p className="text-gray-300">{selectedSerie.detailed_description || selectedSerie.description || "Aucune description disponible."}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Distribution :</h4>
                        <p className="text-gray-300">{selectedSerie.actors?.join(", ") || "Non disponible"}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Genres :</h4>
                        <p className="text-gray-300">{selectedSerie.genres?.join(", ") || "Non spécifié"}</p>
                      </div>
                    </div>
                    {selectedSerie.isClassic && (
                      <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-700">
                        <p className="text-yellow-400 font-medium">⭐ Série culte</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative h-screen w-full pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
        
        {isPlayingTrailer && featuredSerie.trailer_url ? (
          <div className="absolute inset-0">
            <video
              ref={videoRef}
              autoPlay
              muted
              loop={false}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center center' }}
              onError={() => setIsPlayingTrailer(false)}
            >
              <source src={featuredSerie.trailer_url} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        ) : (
          <div className="absolute inset-0">
            <img 
              src={featuredSerie.banner_url}
              className="w-full h-full object-cover transition-opacity duration-1000"
              style={{ objectPosition: 'center center' }}
              onError={(e) => e.target.src = featuredSerie.image_url}
              alt={featuredSerie.title}
            />
          </div>
        )}
        
        <div className="relative z-20 h-full flex flex-col justify-center pb-32 px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {featuredSerie.title}
            </h1>
            <div className="flex gap-4 mb-4 text-lg">
              <span>{featuredSerie.release_year}</span>
              <span>{featuredSerie.seasons} saison{featuredSerie.seasons > 1 ? 's' : ''}</span>
              {featuredSerie.isClassic && <span className="text-yellow-400">⭐ Culte</span>}
              {featuredSerie.rating && <span>{featuredSerie.rating}</span>}
            </div>
            <p className="text-xl mb-8">{featuredSerie.description}</p>
            <div className="flex gap-4">
              <button 
                className="bg-white hover:bg-gray-200 text-black px-6 py-2 md:px-8 md:py-3 rounded flex items-center gap-2 text-lg font-bold transition-colors"
                onClick={() => {
                  if (isPlayingTrailer && videoRef.current) {
                    videoRef.current.pause();
                  }
                  // Ajouter ici la logique pour lancer la lecture du premier épisode
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
                Lecture
              </button>
              <button 
                onClick={() => setSelectedSerie(featuredSerie)} 
                className="bg-gray-600 hover:bg-gray-500 bg-opacity-70 px-6 py-2 md:px-8 md:py-3 rounded flex items-center gap-2 text-lg font-bold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Plus d'infos
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative h-32 bg-gradient-to-t from-black via-black to-transparent -mt-32 z-10" />

      <div className="relative z-20 px-8 pb-16 -mt-16 space-y-12">
        {CATEGORIES.map(category => {
          const categorySeries = getSeriesByCategory(category);
          if (categorySeries.length === 0) return null;
          
          return (
            <div key={category.id} className="space-y-4">
              <h2 className="text-2xl font-bold">
                {category.displayName}
                {category.name === "Classiques" && " ⭐"}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {categorySeries.map(serie => (
                  <SeriesCard 
                    key={serie.id} 
                    serie={serie} 
                    onClick={() => setSelectedSerie(serie)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}