import { useEffect, useState, useContext, useRef } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "../pages/header";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

const featuredSerie = {
  title: "Prison Break",
  year: 2005,
  rating: "16+",
  genre: ["Action", "Drame", "Thriller"],
  image: "/images/prison-break.jpg",
  video: "/videos/prison-break-trailer.mp4",
  description: "Un homme fait évader son frère, condamné à mort pour un crime qu'il n'a pas commis, en infiltrant la prison où il est détenu.",
  detailedDescription: "Cette série culte mêle suspense, action et rebondissements avec un scénario ingénieux autour d'un plan d'évasion minutieux. Wentworth Miller et Dominic Purcell livrent des performances mémorables.",
  cast: ["Wentworth Miller", "Dominic Purcell", "Sarah Wayne Callies"],
  seasons: 5,
  episodes: 90,
  themes: "Évasion, Fraternité, Justice",
  moods: ["Tendu", "Haletant", "Émotionnel"],
  trailer: "https://www.youtube.com/watch?v=AL9zLctDJaU",
  fullSerie: "https://www.netflix.com/title/70140425",
  creator: "Paul Scheuring",
};

const categories = [
  { 
    id: 1, 
    name: "Action", 
    series: [
      { title: "Game of Thrones", image: "/images/got.jpg", video: "/videos/got-trailer.mp4", description: "Conflits sanglants pour le trône de fer dans les Sept Royaumes.", cast: ["Kit Harington", "Emilia Clarke"], rating: "18+", genre: ["Action", "Fantasy"], year: 2011, seasons: 8, episodes: 73, trailer: "https://www.youtube.com/watch?v=KPLWWIOCOOQ", fullSerie: "https://www.hbo.com/game-of-thrones", duration: "55m", creator: "David Benioff, D.B. Weiss" },
      { title: "Daredevil", image: "/images/daredevil.jpg", video: "/videos/daredevil-trailer.mp4", description: "Un avocat aveugle combat le crime la nuit dans Hell's Kitchen.", cast: ["Charlie Cox", "Vincent D'Onofrio"], rating: "18+", genre: ["Action", "Super-héros"], year: 2015, seasons: 3, episodes: 39, trailer: "https://www.youtube.com/watch?v=jAy6NJ_D5vU", fullSerie: "https://www.netflix.com/title/80018294", duration: "55m", creator: "Drew Goddard" },
      { title: "SWAT", image: "/images/swat.jpg", video: "/videos/swat-trailer.mp4", description: "Une unité d'élite de la police de Los Angeles gère les situations critiques.", cast: ["Shemar Moore", "Stephanie Sigman"], rating: "16+", genre: ["Action", "Policier"], year: 2017, seasons: 6, episodes: 100, trailer: "https://www.youtube.com/watch?v=B3Kq4A7nT64", fullSerie: "https://www.netflix.com/title/80241576", duration: "45m", creator: "Aaron Rahsaan Thomas" },
      { title: "The Witcher", image: "/images/witcher.jpg", video: "/videos/witcher-trailer.mp4", description: "Un chasseur de monstres mutant parcourt un monde rempli de dangers.", cast: ["Henry Cavill", "Anya Chalotra"], rating: "16+", genre: ["Action", "Fantasy"], year: 2019, seasons: 3, episodes: 24, trailer: "https://www.youtube.com/watch?v=ndl1W4ltcmg", fullSerie: "https://www.netflix.com/title/80189685", duration: "60m", creator: "Lauren Schmidt Hissrich" },
      { title: "Peaky Blinders", image: "/images/peaky_blinders.jpg", video: "/videos/peaky-blinders-trailer.mp4", description: "Un gang familial règne sur Birmingham dans l'Angleterre des années 1920.", cast: ["Cillian Murphy", "Tom Hardy"], rating: "18+", genre: ["Action", "Drame"], year: 2013, seasons: 6, episodes: 36, trailer: "https://www.youtube.com/watch?v=oVzVdvGIC7U", fullSerie: "https://www.netflix.com/title/80002479", duration: "55m", creator: "Steven Knight" }
    ]
  },
  { 
    id: 2, 
    name: "Drame", 
    series: [
      { title: "Breaking Bad", image: "/images/breaking-bad.jpg", video: "/videos/breaking-bad-trailer.mp4", description: "Un professeur de chimie devient baron de la drogue après un diagnostic de cancer.", cast: ["Bryan Cranston", "Aaron Paul"], rating: "18+", genre: ["Drame", "Thriller"], year: 2008, seasons: 5, episodes: 62, trailer: "https://www.youtube.com/watch?v=HhesaQXLuRY", fullSerie: "https://www.netflix.com/title/70143836", duration: "45m", creator: "Vince Gilligan" },
      { title: "Narcos", image: "/images/narcos.jpg", video: "/videos/narcos-trailer.mp4", description: "L'ascension et la chute du célèbre baron de la drogue Pablo Escobar.", cast: ["Wagner Moura", "Pedro Pascal"], rating: "18+", genre: ["Drame", "Crime"], year: 2015, seasons: 3, episodes: 30, trailer: "https://www.youtube.com/watch?v=xl8zdCY-abw", fullSerie: "https://www.netflix.com/title/80025172", duration: "50m", creator: "Carlo Bernard" },
      { title: "Money Heist", image: "/images/money-heist.jpg", video: "/videos/money-heist-trailer.mp4", description: "Un génie du crime organise le braquage le plus ambitieux de l'histoire de l'Espagne.", cast: ["Úrsula Corberó", "Álvaro Morte"], rating: "18+", genre: ["Drame", "Thriller"], year: 2017, seasons: 5, episodes: 41, trailer: "https://www.youtube.com/watch?v=3y-6iaveY6c", fullSerie: "https://www.netflix.com/title/80192098", duration: "45m", creator: "Álex Pina" },
      { title: "Squid Game", image: "/images/squid_game.jpg", video: "/videos/squid-game-trailer.mp4", description: "Des joueurs endettés risquent leur vie dans des jeux d'enfants mortels pour un énorme prix.", cast: ["Lee Jung-jae", "Jung Ho-yeon"], rating: "18+", genre: ["Drame", "Survival"], year: 2021, seasons: 1, episodes: 9, trailer: "https://www.youtube.com/watch?v=oqxAJKy0ii4", fullSerie: "https://www.netflix.com/title/81040344", duration: "55m", creator: "Hwang Dong-hyuk" },
      { title: "The Walking Dead", image: "/images/walking_dead.jpg", video: "/videos/walking-dead-trailer.mp4", description: "Des survivants tentent de rester en vie dans un monde ravagé par une apocalypse zombie.", cast: ["Andrew Lincoln", "Norman Reedus"], rating: "18+", genre: ["Drame", "Horreur"], year: 2010, seasons: 11, episodes: 177, trailer: "https://www.youtube.com/watch?v=R1v0uFms68U", fullSerie: "https://www.netflix.com/title/70177057", duration: "45m", creator: "Frank Darabont" }
    ]
  },
  { 
    id: 3, 
    name: "Classique", 
    series: [
      { title: "Friends", image: "/images/friends.jpg", video: "/videos/friends-trailer.mp4", description: "Les péripéties de six amis new-yorkais unis par l'amitié.", cast: ["Jennifer Aniston", "Courteney Cox"], rating: "12+", genre: ["Comédie", "Classique"], year: 1994, seasons: 10, episodes: 236, trailer: "https://www.youtube.com/watch?v=IEEbUzffzrk", fullSerie: "https://www.netflix.com/title/70153404", duration: "25m", creator: "David Crane, Marta Kauffman" },
      { title: "The Sopranos", image: "/images/sopranos.jpg", video: "/videos/sopranos-trailer.mp4", description: "La vie d'un patron de la mafia new-jerseyaise qui consulte un psychiatre.", cast: ["James Gandolfini", "Edie Falco"], rating: "18+", genre: ["Drame", "Crime"], year: 1999, seasons: 6, episodes: 86, trailer: "https://www.youtube.com/watch?v=1X3A5vRZtGQ", fullSerie: "https://www.hbo.com/the-sopranos", duration: "55m", creator: "David Chase" },
      { title: "The X-Files", image: "/images/xfiles.jpg", video: "/videos/xfiles-trailer.mp4", description: "Deux agents du FBI enquêtent sur des phénomènes paranormaux.", cast: ["David Duchovny", "Gillian Anderson"], rating: "16+", genre: ["Sci-Fi", "Mystère"], year: 1993, seasons: 11, episodes: 218, trailer: "https://www.youtube.com/watch?v=KKziOmsJxzE", fullSerie: "https://www.primevideo.com/detail/0S3Q1QZQZQZQZQZQZQZQZQZQZQZQZQZ/", duration: "45m", creator: "Chris Carter" },
      { title: "Twin Peaks", image: "/images/twin-peaks.jpg", video: "/videos/twin-peaks-trailer.mp4", description: "Un agent du FBI enquête sur le meurtre d'une lycéenne dans une petite ville.", cast: ["Kyle MacLachlan", "Sherilyn Fenn"], rating: "16+", genre: ["Mystère", "Drame"], year: 1990, seasons: 3, episodes: 48, trailer: "https://www.youtube.com/watch?v=hs1HoLs4SD0", fullSerie: "https://www.netflix.com/title/70136120", duration: "45m", creator: "David Lynch" },
      { title: "The Wire", image: "/images/wire.jpg", video: "/videos/wire-trailer.mp4", description: "La police et les trafiquants de drogue à Baltimore, vus de tous les angles.", cast: ["Dominic West", "Idris Elba"], rating: "18+", genre: ["Drame", "Policier"], year: 2002, seasons: 5, episodes: 60, trailer: "https://www.youtube.com/watch?v=9qK-VGjMr8g", fullSerie: "https://www.hbo.com/the-wire", duration: "60m", creator: "David Simon" }
    ]
  }
];

function SeriePage() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const { ref, inView } = useInView({ threshold: 0.5 });
  const [showVideo, setShowVideo] = useState(false);
  const [hoveredSerie, setHoveredSerie] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSerie, setSelectedSerie] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token]);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        setShowVideo(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setShowVideo(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        videoRef.current.muted = true;
      }
    }
  }, [inView]);

  useEffect(() => {
    if (showVideo && videoRef.current) {
      const video = videoRef.current;
      video.muted = false;
      video.play().catch(e => console.log("Autoplay prevented:", e));
      
      const handleEnded = () => {
        setShowVideo(false);
        video.currentTime = 0;
      };
      
      video.addEventListener('ended', handleEnded);
      return () => {
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, [showVideo]);

  const handleSerieClick = (serie) => {
    setSelectedSerie(serie);
  };

  const handleVideoReady = () => {
    setIsVideoReady(true);
  };

  if (!token) return <p>Redirection en cours...</p>;

  return (
    <div className="bg-black min-h-screen text-white">
      <Header />
      
      {/* Section Série Vedette */}
      <div ref={ref} className="relative w-full h-[100vh] flex items-end md:items-center overflow-hidden">
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/0 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/80 z-10"></div>
        
        {/* Image de fond */}
        <img 
          src={featuredSerie.image} 
          alt={featuredSerie.title} 
          className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${showVideo ? 'opacity-0' : 'opacity-100'}`}
        />
        
        {/* Vidéo avec transition fluide */}
        <div className={`absolute w-full h-full transition-opacity duration-1000 ${showVideo && isVideoReady ? 'opacity-100' : 'opacity-0'}`}>
          <video 
            ref={videoRef}
            src={featuredSerie.video} 
            autoPlay 
            playsInline
            muted={!inView}
            className="w-full h-full object-cover"
            onCanPlayThrough={handleVideoReady}
          />
        </div>

        {/* Contenu texte */}
        <div className="p-6 md:p-12 relative z-20 w-full max-w-4xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-2 drop-shadow-lg">{featuredSerie.title}</h1>
          <div className="flex items-center space-x-4 mb-4">
            <span>{featuredSerie.year}</span>
            <span className="border px-2 py-1 text-xs">{featuredSerie.rating}</span>
            <span>{featuredSerie.seasons} saisons</span>
          </div>
          <p className="text-lg text-gray-100 mb-6 max-w-2xl">{featuredSerie.description}</p>
          
          <div className="flex space-x-4">
            <Link href={featuredSerie.fullSerie} target="_blank" rel="noopener noreferrer">
              <button className="bg-white hover:bg-opacity-80 text-black px-6 py-3 rounded-md flex items-center space-x-2 transition-all duration-200 transform hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Lecture</span>
              </button>
            </Link>
            <button
              className="bg-gray-600 bg-opacity-70 hover:bg-opacity-90 text-white px-6 py-3 rounded-md flex items-center space-x-2 transition-all duration-200"
              onClick={() => setShowDetails(!showDetails)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Plus d'infos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section des catégories */}
      {categories.map((category) => (
        <section key={category.id} className="py-8 px-4 md:px-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{category.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {category.series.map((serie, index) => (
              <div 
                key={index} 
                className="relative group cursor-pointer" 
                onClick={() => handleSerieClick(serie)}
                onMouseEnter={() => setHoveredSerie(serie.title)}
                onMouseLeave={() => setHoveredSerie(null)}
              >
                <div className="aspect-w-2 aspect-h-3 w-full overflow-hidden rounded-lg bg-gray-900">
                  <img
                    src={serie.image}
                    alt={serie.title}
                    className={`w-full h-full object-cover transition-all duration-300 ${hoveredSerie === serie.title ? 'transform scale-110' : ''}`}
                  />
                </div>
                <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                  <div>
                    <p className="text-white font-semibold">{serie.title}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-300">
                      <span>{serie.year}</span>
                      <span className="border px-1">{serie.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      
      {/* Modal des détails de la série */}
      {selectedSerie && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-white mb-2">{selectedSerie.title}</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <span>{selectedSerie.year}</span>
                  <span className="border px-2 py-1 text-xs">{selectedSerie.rating}</span>
                  <span>{selectedSerie.seasons} saisons</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p><strong className="text-gray-400">Créateur:</strong> {selectedSerie.creator}</p>
                    <p><strong className="text-gray-400">Distribution:</strong> {selectedSerie.cast.join(", ")}</p>
                  </div>
                  <div>
                    <p><strong className="text-gray-400">Genres:</strong> {selectedSerie.genre.join(", ")}</p>
                    <p><strong className="text-gray-400">Durée:</strong> {selectedSerie.duration} par épisode</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-6"><strong className="text-gray-400">Synopsis:</strong> {selectedSerie.description}</p>

                <div className="flex space-x-4">
                  {selectedSerie.fullSerie && (
                    <a
                      href={selectedSerie.fullSerie}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md transition-all duration-200 transform hover:scale-105"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Voir la série
                    </a>
                  )}
                  {selectedSerie.trailer && (
                    <a 
                      href={selectedSerie.trailer} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-md transition-all duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Bande-annonce
                    </a>
                  )}
                </div>
              </div>
              
              <div className="flex-1 flex justify-center">
                <div className="w-full h-80 md:h-96 flex items-center justify-center bg-gray-800 rounded-lg overflow-hidden">
                  <img 
                    src={selectedSerie.image} 
                    alt={selectedSerie.title} 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={() => setSelectedSerie(null)}
              className="mt-6 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-all duration-200 flex items-center ml-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Plus d'infos pour Prison Break */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-white mb-2">{featuredSerie.title}</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <span>{featuredSerie.year}</span>
                  <span className="border px-2 py-1 text-xs">{featuredSerie.rating}</span>
                  <span>{featuredSerie.seasons} saisons</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p><strong className="text-gray-400">Créateur:</strong> {featuredSerie.creator}</p>
                    <p><strong className="text-gray-400">Distribution:</strong> {featuredSerie.cast.join(", ")}</p>
                  </div>
                  <div>
                    <p><strong className="text-gray-400">Genres:</strong> {featuredSerie.genre.join(", ")}</p>
                    <p><strong className="text-gray-400">Thèmes:</strong> {featuredSerie.themes}</p>
                    <p><strong className="text-gray-400">Ambiance:</strong> {featuredSerie.moods.join(", ")}</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-6">{featuredSerie.detailedDescription}</p>

                <div className="flex space-x-4">
                  <Link href={featuredSerie.fullSerie} target="_blank" rel="noopener noreferrer">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md flex items-center space-x-2 transition-all duration-200 transform hover:scale-105">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Voir la série</span>
                    </button>
                  </Link>
                  <a 
                    href={featuredSerie.trailer} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-md flex items-center space-x-2 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Bande-annonce</span>
                  </a>
                </div>
              </div>
              
              <div className="flex-1 flex justify-center">
                <div className="w-full h-80 md:h-96 flex items-center justify-center bg-gray-800 rounded-lg overflow-hidden">
                  <img 
                    src={featuredSerie.image} 
                    alt={featuredSerie.title} 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowDetails(false)}
              className="mt-6 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-all duration-200 flex items-center ml-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeriePage;