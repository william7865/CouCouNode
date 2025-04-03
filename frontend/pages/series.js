import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "./components/header";

// Données constantes
const categories = [
  { id: 1, name: "Action", displayName: "Action" },
  { id: 2, name: "Drame", displayName: "Drame" },
  { id: 3, name: "Policier", displayName: "Policier" },
  { id: 4, name: "Comédie", displayName: "Comédie" },
  { id: 5, name: "Classiques", displayName: "Séries Cultes" }
];

// Liste des séries classiques
const classicSeries = [
  "Breaking Bad", 
  "Game of Thrones",
  "Peaky Blinders",
  "The Sopranos",
  "Lost",
  "Prison Break"
];

// Composants enfants
const SeriesCard = ({ serie, onClick }) => (
  <div 
    className="group relative aspect-video rounded-md overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:z-10"
    onClick={onClick}
  >
    <img
      src={serie.image_url || "/images/placeholder-series.jpg"}
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
          {serie.netflixUrl && (
            <span className="text-red-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.012-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

const LoadingScreen = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="animate-pulse flex flex-col items-center">
      <div className="w-16 h-16 bg-red-600 rounded-full mb-4"></div>
      <span className="text-white">Chargement...</span>
    </div>
  </div>
);

const CloseButton = ({ onClick }) => (
  <button onClick={onClick} className="text-gray-300 hover:text-white p-1 transition-colors">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
);

// Composant principal
export default function SeriesPage() {
  // États
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const [series, setSeries] = useState([]);
  const [featuredSerie, setFeaturedSerie] = useState(null);
  const [selectedSerie, setSelectedSerie] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [activeTab, setActiveTab] = useState("episodes");
  const [isLoading, setIsLoading] = useState(true);
  const [videoState, setVideoState] = useState({
    isReady: false,
    isPlaying: false,
    isVisible: false,
    isHovered: false,
  });
  const [isMuted, setIsMuted] = useState(true);
  
  // Références
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const timeoutRef = useRef(null);
  const scrollPositionRef = useRef(0);

  // Récupération des séries
  const fetchSeries = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3001/series", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      const formattedData = data.map(serie => ({
        id: serie.id,
        title: serie.title,
        release_year: serie.release_year,
        rating: serie.rating,
        genres: Array.isArray(serie.genres) ? serie.genres : [],
        image_url: serie.image_url || "/images/placeholder-series.jpg",
        banner_url: serie.banner_url || serie.image_url || "/images/placeholder-banner.jpg",
        trailer_url: serie.trailer_url || null,
        description: serie.description || "Description non disponible",
        detailed_description: serie.detailed_description || serie.description || "Description détaillée non disponible",
        cast: Array.isArray(serie.actors) ? serie.actors.join(", ") : "Non disponible",
        seasons: serie.seasons || 1,
        episode_count: serie.episode_count || 0,
        themes: Array.isArray(serie.themes) ? serie.themes : [],
        moods: Array.isArray(serie.moods) ? serie.moods : [],
        creator: serie.creator || "Non disponible",
        isClassic: classicSeries.includes(serie.title) || Boolean(serie.is_classic),
        isFeatured: Boolean(serie.is_featured),
        netflixUrl: serie.netflix_url || null,
        episodes: Array.isArray(serie.episodes) ? serie.episodes.map(ep => ({
          ...ep,
          video_url: ep.video_url || "/videos/default-episode.mp4",
          image_url: ep.image_url || serie.image_url || "/images/placeholder-episode.jpg",
          netflixUrl: ep.netflix_url || null
        })) : Array.from({length: 5}, (_, i) => ({
          id: i+1,
          season_number: 1,
          episode_number: i+1,
          title: `Épisode ${i+1}`,
          description: "Description de l'épisode",
          duration: "45m",
          image_url: serie.image_url || "/images/placeholder-episode.jpg",
          video_url: "/videos/default-episode.mp4"
        })),
        similar_series: data
          .filter(s => s.id !== serie.id && s.genres?.some(g => serie.genres?.includes(g)))
          .slice(0, 3)
          .map(s => ({
            id: s.id,
            title: s.title,
            image_url: s.image_url || "/images/placeholder-series.jpg",
            release_year: s.release_year,
            seasons: s.seasons || 1,
            netflixUrl: s.netflix_url || null
          }))
      }));
      
      setSeries(formattedData);
      const featured = formattedData.find(s => s.isFeatured) || formattedData[0];
      setFeaturedSerie(featured);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching series:", error);
      setIsLoading(false);
    }
  }, [token]);

  // Filtrer les séries par catégorie
  const getSeriesByCategory = useCallback((category) => {
    const isClassicCategory = category.name === "Classiques";
    
    return series
      .filter(serie => {
        if (isClassicCategory) return serie.isClassic && serie.id !== featuredSerie?.id;
        return serie.genres?.includes(category.name) && serie.id !== featuredSerie?.id;
      })
      .slice(0, 5)
      .sort((a, b) => isClassicCategory ? (b.popularity || 0) - (a.popularity || 0) : 0);
  }, [series, featuredSerie]);

  // Gestion du survol de la vidéo
  const handleVideoHover = useCallback((isHovering) => {
    setVideoState(prev => ({ ...prev, isHovered: isHovering }));
  }, []);

  // Basculer le son
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  }, []);

  // Gestion du clic sur un épisode
  const handleEpisodeClick = useCallback((serie, episode) => {
    if (serie.netflixUrl) {
      // Redirection vers Netflix
      window.open(episode.netflixUrl || serie.netflixUrl, '_blank');
    } else {
      // Afficher le lecteur intégré
      setSelectedEpisode(episode);
    }
  }, []);

  // Effets
  useEffect(() => {
    if (!token) router.push("/login");
    else fetchSeries();
  }, [token, router, fetchSeries]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !featuredSerie?.trailer_url) return;

    video.muted = true;
    setIsMuted(true);

    const handleLoadedData = () => {
      setVideoState(prev => ({ ...prev, isReady: true }));
      timeoutRef.current = setTimeout(() => {
        setVideoState(prev => ({ ...prev, isPlaying: true, isVisible: true }));
        video.play().catch(e => console.log("Auto-play prevented:", e));
      }, 3000);
    };

    const handleEnded = () => {
      setVideoState(prev => ({ ...prev, isPlaying: false, isVisible: false }));
      timeoutRef.current = setTimeout(() => {
        if (video) {
          video.currentTime = 0;
          setVideoState(prev => ({ ...prev, isPlaying: true, isVisible: true }));
          video.play().catch(e => console.log("Replay prevented:", e));
        }
      }, 30000);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('ended', handleEnded);
      clearTimeout(timeoutRef.current);
    };
  }, [featuredSerie]);

  // Gestion du scroll pour réinitialiser la vidéo
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      
      // Si on remonte vers le haut et qu'on atteint le haut de page
      if (currentScroll === 0 && scrollPositionRef.current > 0) {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          if (!videoState.isPlaying) {
            videoRef.current.play().catch(e => console.log("Play prevented:", e));
            setVideoState(prev => ({ ...prev, isPlaying: true, isVisible: true }));
          }
        }
      }
      
      scrollPositionRef.current = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [videoState.isPlaying]);

  if (!token || isLoading || !featuredSerie) return <LoadingScreen />;

  return (
    <div className="bg-black text-white min-h-screen">
      <Header className="fixed top-0 w-full z-50 bg-black" />
      
      {/* Modal de la série sélectionnée */}
      {selectedSerie && (
        <div className="fixed inset-0 bg-black/95 z-40 overflow-y-auto pt-16 pb-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex justify-end mb-4">
              <CloseButton onClick={() => setSelectedSerie(null)} />
            </div>

            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
              <div className="relative w-full h-96 overflow-hidden">
                <img 
                  src={selectedSerie.banner_url}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 30%' }}
                  onError={(e) => e.target.src = selectedSerie.image_url}
                  alt={`Bannière ${selectedSerie.title}`}
                />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
              </div>

              <div className="p-6">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {selectedSerie.netflixUrl ? (
                    <button 
                      onClick={() => window.open(selectedSerie.netflixUrl, '_blank')}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded flex items-center gap-2 font-bold transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                      Regarder sur Netflix
                    </button>
                  ) : (
                    <button className="bg-white hover:bg-gray-200 text-black px-6 py-2 rounded flex items-center gap-2 font-bold transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                      Lecture
                    </button>
                  )}
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
                    <button
                      onClick={() => setActiveTab("similar")}
                      className={`pb-4 px-1 font-medium ${activeTab === "similar" ? "text-white border-b-2 border-white" : "text-gray-400 hover:text-white"} transition-colors`}
                    >
                      Séries similaires
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
                        onClick={() => handleEpisodeClick(selectedSerie, episode)}
                      >
                        <div className="w-48 h-32 flex-shrink-0 bg-gray-800 rounded-md overflow-hidden relative">
                          <img
                            src={episode.image_url}
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
                          {selectedSerie.netflixUrl && (
                            <div className="mt-2 flex items-center gap-1 text-sm text-red-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.012-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z" />
                              </svg>
                              <span>Disponible sur Netflix</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">À propos de {selectedSerie.title}</h3>
                        <p className="text-gray-300">{selectedSerie.detailed_description}</p>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold mb-2">Titre :</h4>
                          <p className="text-gray-300">{selectedSerie.title}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Année :</h4>
                          <p className="text-gray-300">{selectedSerie.release_year}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Note :</h4>
                          <p className="text-gray-300">{selectedSerie.rating || "Non disponible"}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Genre :</h4>
                          <p className="text-gray-300">
                            {selectedSerie.genres?.join(", ") || "Non spécifié"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Distribution :</h4>
                        <p className="text-gray-300">{selectedSerie.cast}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Créateur :</h4>
                        <p className="text-gray-300">{selectedSerie.creator}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Saisons :</h4>
                        <p className="text-gray-300">{selectedSerie.seasons}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Épisodes :</h4>
                        <p className="text-gray-300">{selectedSerie.episode_count}</p>
                      </div>
                    </div>
                    
                    {selectedSerie.themes?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Thèmes :</h4>
                        <p className="text-gray-300">{selectedSerie.themes.join(", ")}</p>
                      </div>
                    )}
                    
                    {selectedSerie.moods?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Ambiances :</h4>
                        <p className="text-gray-300">{selectedSerie.moods.join(", ")}</p>
                      </div>
                    )}
                    
                    {selectedSerie.isClassic && (
                      <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-700">
                        <p className="text-yellow-400 font-medium">⭐ Série culte</p>
                      </div>
                    )}
                    
                    {selectedSerie.netflixUrl && (
                      <div className="bg-red-900/30 p-3 rounded-lg border border-red-700 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.012-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z" />
                        </svg>
                        <p className="text-red-400 font-medium">Disponible sur Netflix</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "similar" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Séries similaires</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedSerie.similar_series?.map(serie => (
                        <div 
                          key={serie.id}
                          className="flex gap-4 p-3 hover:bg-gray-800/50 rounded-lg transition cursor-pointer"
                          onClick={() => {
                            const newSelected = series.find(s => s.id === serie.id);
                            if (newSelected) {
                              setSelectedSerie(newSelected);
                              setActiveTab("episodes");
                            }
                          }}
                        >
                          <div className="w-24 h-32 flex-shrink-0 bg-gray-800 rounded-md overflow-hidden">
                            <img
                              src={serie.image_url}
                              className="w-full h-full object-cover"
                              onError={(e) => e.target.src = "/images/placeholder-series.jpg"}
                              alt={`Affiche ${serie.title}`}
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold">{serie.title}</h3>
                            <p className="text-gray-400 text-sm">{serie.release_year}</p>
                            <p className="text-gray-400 text-xs">{serie.seasons} saison{serie.seasons > 1 ? 's' : ''}</p>
                            {serie.netflixUrl && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-red-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.012-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z" />
                                </svg>
                                <span>Netflix</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {(!selectedSerie.similar_series || selectedSerie.similar_series.length === 0) && (
                        <p className="text-gray-400">Aucune série similaire trouvée</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de lecture d'épisode (uniquement pour les séries non-Netflix) */}
      {selectedEpisode && !selectedSerie?.netflixUrl && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button 
              onClick={() => setSelectedEpisode(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 z-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="aspect-video bg-black w-full">
              <video
                controls
                autoPlay
                className="w-full h-full"
                src={selectedEpisode.video_url}
                poster={selectedEpisode.image_url}
                onError={(e) => {
                  e.target.src = "/videos/default-episode.mp4";
                  e.target.poster = "/images/placeholder-episode.jpg";
                }}
              >
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </div>
            
            <div className="mt-4 text-white">
              <h3 className="text-xl font-bold">
                Épisode {selectedEpisode.episode_number}: {selectedEpisode.title}
              </h3>
              <p className="text-gray-300 mt-2">{selectedEpisode.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Section vedette */}
      <div 
        className="relative h-screen w-full pt-16 overflow-hidden"
        ref={videoContainerRef}
        onMouseEnter={() => handleVideoHover(true)}
        onMouseLeave={() => handleVideoHover(false)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
        
        <div className="absolute inset-0">
          <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${videoState.isVisible ? 'opacity-0' : 'opacity-100'}`}>
            <img 
              src={featuredSerie.banner_url}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center center' }}
              onError={(e) => e.target.src = featuredSerie.image_url}
              alt={featuredSerie.title}
            />
          </div>
          
          {featuredSerie.trailer_url && (
            <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${videoState.isVisible ? 'opacity-100' : 'opacity-0'}`}>
              <video
                ref={videoRef}
                muted={isMuted}
                playsInline
                disablePictureInPicture
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center center' }}
                onError={() => setVideoState(prev => ({ ...prev, isVisible: false }))}
              >
                <source src={featuredSerie.trailer_url} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          )}
        </div>
        
        <div className="relative z-20 h-full flex flex-col justify-center pb-32 px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                {featuredSerie.title}
              </h1>
              {featuredSerie.rating && (
                <span className="bg-black/70 px-2 py-1 rounded text-lg border border-gray-600">
                  {featuredSerie.rating}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 mb-4 text-lg">
              <span>{featuredSerie.release_year}</span>
              <span>•</span>
              <span>{featuredSerie.seasons} saison{featuredSerie.seasons > 1 ? 's' : ''}</span>
              {featuredSerie.isClassic && <span className="text-yellow-400">⭐ Culte</span>}
              {featuredSerie.netflixUrl && (
                <span className="flex items-center gap-1 text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.012-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z" />
                  </svg>
                  <span>Netflix</span>
                </span>
              )}
              
              {(videoState.isHovered || videoState.isPlaying) && featuredSerie.trailer_url && (
                <button
                  onClick={toggleMute}
                  className="bg-black/70 rounded-full p-1 hover:bg-black/90 transition-all"
                  aria-label={isMuted ? "Activer le son" : "Désactiver le son"}
                >
                  {isMuted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a7.975 7.975 0 015.657 2.343m0 0a7.975 7.975 0 010 11.314m-11.314 0a7.975 7.975 0 010-11.314m0 0a7.975 7.975 0 015.657-2.343" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            
            <p className="text-xl mb-8">{featuredSerie.description}</p>
            
            <div className="flex gap-4">
              {featuredSerie.netflixUrl ? (
                <button 
                  onClick={() => window.open(featuredSerie.netflixUrl, '_blank')}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 md:px-8 md:py-3 rounded flex items-center gap-2 text-lg font-bold transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  Regarder sur Netflix
                </button>
              ) : (
                <button className="bg-white hover:bg-gray-200 text-black px-6 py-2 md:px-8 md:py-3 rounded flex items-center gap-2 text-lg font-bold transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  Lecture
                </button>
              )}
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

      {/* Liste des séries par catégorie */}
      <div className="relative z-20 px-8 pb-16 -mt-16 space-y-12">
        {categories.map(category => {
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