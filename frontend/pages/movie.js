<<<<<<< HEAD
import { useEffect, useState, useContext } from "react";
=======
import { useEffect, useState, useContext, useRef } from "react";
>>>>>>> Shun
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "../pages/header";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

const featuredMovie = {
  title: "Training Day",
  year: 2001,
  rating: "16+",
  genre: ["Crime", "Drama", "Thriller"],
  image: "/images/training-day.jpg",
  video: "/videos/training-day.mp4",
  description: "Jake Hoyt, jeune policier idéaliste, passe une journée sous la supervision du détective Alonzo Harris, un vétéran des narcotiques aux méthodes douteuses.",
  detailedDescription: "Ce qui commence comme une simple initiation se transforme en une descente dans un monde de corruption et de violence. Denzel Washington livre une performance légendaire dans ce thriller haletant.",
  cast: ["Denzel Washington", "Ethan Hawke", "Scott Glenn"],
  duration: "2h 2min",
  themes: "Corruption, Justice, Trahison",
  moods: ["Intense", "Suspense", "Émotionnel"],
  trailer: "https://www.youtube.com/watch?v=-Mh7gluxRGc",
  fullMovie: "https://www.amazon.com/Training-Day-Denzel-Washington/dp/B003QSJVGW",
  director: "Antoine Fuqua",
  writer: "David Ayer",
};

const categories = [
<<<<<<< HEAD
  {
    id: 1,
    name: "Action",
    films: [
      { title: "Mad Max: Fury Road", image: "/images/madmax.jpg" },
      { title: "John Wick", image: "/images/johnwick.jpg" },
      { title: "Avengers: Endgame", image: "/images/avengers.jpg" },
    ],
  },
  {
    id: 2,
    name: "Suspense",
    films: [
      { title: "Inception", image: "/images/inception.jpg" },
      { title: "Gone Girl", image: "/images/gonegirl.jpg" },
      { title: "Shutter Island", image: "/images/shutterisland.jpg" },
    ],
  },
  {
    id: 3,
    name: "Comédie",
    films: [
      { title: "Superbad", image: "/images/superbad.jpg" },
      { title: "Dumb and Dumber", image: "/images/dumbdumber.jpg" },
      { title: "Step Brothers", image: "/images/stepbrothers.jpg" },
    ],
  },
=======
  { id: 1, name: "Action", films: [
    { title: "Bad Boys II", image: "/images/badboys2.jpg", video: "/videos/badboys2.mp4", description: "Une équipe de policiers fait face à un trafic de drogue.", cast: ["Will Smith", "Martin Lawrence"], rating: "16+", genre: ["Action", "Comedy"], year: 2003, trailer: "https://www.youtube.com/watch?v=jKCj3XuPG8M", fullMovie: "https://www.netflix.com/title/60034572", duration: "2h 28m", director: "Michael Bay", writer: "George Gallo, Ronald Bass" },
    { title: "2 Fast 2 Furious", image: "/images/fast2.jpg", video: "/videos/fast2.mp4", description: "Course-poursuite entre policiers et criminels sur les routes.", cast: ["Paul Walker", "Tyrese Gibson"], rating: "12+", genre: ["Action", "Crime"], year: 2003, trailer: "https://www.youtube.com/watch?v=F_VIM03DXWI", fullMovie: "https://www.amazon.com/2-Fast-2-Furious-Paul-Walker/dp/B000JLQ3F2", duration: "1h 47m", director: "John Singleton", writer: "Gary Scott Thompson" },
    { title: "John Wick", image: "/images/johnwick.jpg", video: "/videos/johnwick.mp4", description: "Un ancien assassin revient pour se venger de ceux qui lui ont pris tout.", cast: ["Keanu Reeves"], rating: "16+", genre: ["Action", "Thriller"], year: 2014, trailer: "https://www.youtube.com/watch?v=2AUmvWm5ZDQ", fullMovie: "https://www.netflix.com/title/70305703", duration: "1h 41m", director: "Chad Stahelski", writer: "Derek Kolstad" },
    { title: "Avengers: Endgame", image: "/images/avengers.jpg", video: "/videos/avengers.mp4", description: "Les Avengers unissent leurs forces pour affronter Thanos.", cast: ["Robert Downey Jr.", "Chris Hemsworth"], rating: "12+", genre: ["Action", "Sci-Fi"], year: 2019, trailer: "https://www.youtube.com/watch?v=TcMBFSGVi1c", fullMovie: "https://www.disneyplus.com/fr-fr/movies/avengers-endgame/aRbVJUb2h2Rf", duration: "3h 2m", director: "Anthony Russo, Joe Russo", writer: "Christopher Markus, Stephen McFeely" },
    { title: "Gladiator", image: "/images/gladiator.jpg", video: "/videos/gladiator.mp4", description: "Un général romain trahi devient un gladiateur.", cast: ["Russell Crowe"], rating: "15+", genre: ["Action", "Drama"], year: 2000, trailer: "https://www.youtube.com/watch?v=owK1qxDselE", fullMovie: "https://www.amazon.com/Gladiator-Russell-Crowe/dp/B002VA9L7A", duration: "2h 35m", director: "Ridley Scott", writer: "David Franzoni, John Logan" }
  ]},
  { id: 2, name: "Science-Fiction", films: [
    { title: "Star Wars: L'Empire contre-attaque", image: "/images/star_wars.jpg", video: "/videos/empire_strikes_back.mp4", description: "Les rebelles fuient l'Empire galactique tandis que Luke Skywalker apprend les voies de la Force.", cast: ["Mark Hamill", "Harrison Ford", "Carrie Fisher"], rating: "12+", genre: ["Sci-Fi", "Aventure"], year: 1980, trailer: "https://www.youtube.com/watch?v=JNwNXF9Y6kY", fullMovie: "https://www.disneyplus.com/fr-fr/movies/star-wars-lempire-contre-attaque/5eIVy0q7Q1WH", duration: "2h 4m", director: "Irvin Kershner", writer: "Leigh Brackett, Lawrence Kasdan" },
    { title: "The Matrix", image: "/images/matrix.jpg", video: "/videos/matrix.mp4", description: "Un hacker découvre la vérité sur la réalité.", cast: ["Keanu Reeves", "Laurence Fishburne"], rating: "12+", genre: ["Sci-Fi", "Action"], year: 1999, trailer: "https://www.youtube.com/watch?v=vKQi3bBA1y8", fullMovie: "https://www.netflix.com/title/20557937", duration: "2h 16m", director: "Lana Wachowski, Lilly Wachowski", writer: "Lana Wachowski, Lilly Wachowski" },
    { title: "Je suis une légende", image: "/images/je_suis_une_legende.jpg", video: "/videos/je_suis_une_legende.mp4", description: "Le dernier homme vivant lutte pour survivre.", cast: ["Will Smith"], rating: "12+", genre: ["Sci-Fi", "Drama"], year: 2007, trailer: "https://www.youtube.com/watch?v=dtKMEAXyPkg", fullMovie: "https://www.amazon.com/I-Am-Legend-Will-Smith/dp/B0013LPQ7Q", duration: "1h 40m", director: "Francis Lawrence", writer: "Mark Protosevich" },
    { title: "Retour vers le futur", image: "/images/back_to_the_future.jpg", video: "/videos/back_to_the_future.mp4", description: "Un adolescent voyage accidentellement dans le passé et doit s'assurer que ses parents se rencontrent.", cast: ["Michael J. Fox", "Christopher Lloyd"], rating: "12+", genre: ["Sci-Fi", "Comédie"], year: 1985, trailer: "https://www.youtube.com/watch?v=qvsgGtivCgs", fullMovie: "https://www.amazon.com/Retour-vers-le-futur-Michael-Fox/dp/B00H3J1V8C", duration: "1h 56m", director: "Robert Zemeckis", writer: "Robert Zemeckis, Bob Gale" },
    { title: "Blade Runner 2049", image: "/images/bladerunner2049.jpg", video: "/videos/bladerunner2049.mp4", description: "Un agent de la police futuriste part à la recherche d'un mystère.", cast: ["Ryan Gosling", "Harrison Ford"], rating: "16+", genre: ["Sci-Fi", "Thriller"], year: 2017, trailer: "https://www.youtube.com/watch?v=gCcx85zbxz4", fullMovie: "https://www.amazon.com/Blade-Runner-2049-Ryan-Gosling/dp/B075SQZJ5Q", duration: "2h 44m", director: "Denis Villeneuve", writer: "Hampton Fancher, Michael Green" }
  ]},
  { id: 3, name: "Classiques", films: [
    { title: "Les Évadés", image: "/images/les_evades.jpg", video: "/videos/les_evades.mp4", description: "L'histoire de deux prisonniers qui forment une amitié improbable.", year: 1994, rating: "16+", trailer: "https://www.youtube.com/watch?v=6hB3S9bIaco", fullMovie: "https://www.amazon.com/Shawshank-Redemption-Tim-Robbins/dp/B0091X4HQA", duration: "2h 22m", director: "Frank Darabont", writer: "Stephen King, Frank Darabont", cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"], genre: ["Drame", "Crime"] },
    { title: "Sister Act 2", image: "/images/sister_act_2.jpg", video: "/videos/sister_act_2.mp4", description: "Un professeur de musique réveille l'esprit d'un groupe d'étudiantes.", year: 1993, rating: "12+", trailer: "https://www.youtube.com/watch?v=_QcgjGyRnuw", fullMovie: "https://www.disneyplus.com/fr-fr/movies/sister-act-2-back-in-the-habit/6fPX4nZx6X4F", duration: "1h 47m", director: "Bill Duke", writer: "Paul Rudnick", cast: ["Whoopi Goldberg", "Lauryn Hill", "Maggie Smith"], genre: ["Comédie", "Musical"] },
    { title: "The Dark Knight", image: "/images/dark_knight_2008.jpg", video: "/videos/dark_knight.mp4", description: "Batman fait face au Joker, un criminel chaotique.", year: 2008, rating: "13+", trailer: "https://www.youtube.com/watch?v=EXeTwQWrcwY", fullMovie: "https://www.amazon.com/Dark-Knight-Christian-Bale/dp/B001GZ6QC4", duration: "2h 32m", director: "Christopher Nolan", writer: "Jonathan Nolan, Christopher Nolan", cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"], genre: ["Action", "Crime", "Drame"] },
    { title: "Titanic", image: "/images/titanic.jpg", video: "/videos/titanic.mp4", description: "Une histoire d'amour tragique à bord du célèbre paquebot.", year: 1997, rating: "12+", trailer: "https://www.youtube.com/watch?v=kVrqfYjkTdQ", fullMovie: "https://www.amazon.com/Titanic-Leonardo-DiCaprio/dp/B002GJZ4Z0", duration: "3h 14m", director: "James Cameron", writer: "James Cameron", cast: ["Leonardo DiCaprio", "Kate Winslet", "Billy Zane"], genre: ["Drame", "Romance", "Historique"] },
    { title: "Terminator 2", image: "/images/terminator2.jpg", video: "/videos/terminator2.mp4", description: "Un cyborg revient du futur pour protéger un jeune garçon.", year: 1991, rating: "16+", trailer: "https://www.youtube.com/watch?v=7QXDPzx71jQ", fullMovie: "https://www.amazon.com/Terminator-2-Judgment-Day-Arnold-Schwarzenegger/dp/B002LVUKF6", duration: "2h 17m", director: "James Cameron", writer: "James Cameron, William Wisher Jr.", cast: ["Arnold Schwarzenegger", "Linda Hamilton", "Edward Furlong"], genre: ["Action", "Science-fiction", "Thriller"] }
  ]},
>>>>>>> Shun
];

function MoviePage() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const { ref, inView } = useInView({ threshold: 0.5 });
  const [showVideo, setShowVideo] = useState(false);
  const [hoveredMovie, setHoveredMovie] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
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

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  const handleVideoReady = () => {
    setIsVideoReady(true);
  };

  if (!token) return <p>Redirection en cours...</p>;

  return (
    <div className="bg-black min-h-screen text-white">
      <Header />
<<<<<<< HEAD
      <h1 className="text-3xl font-bold text-center my-6">Films</h1>
      {categories.map((category) => (
        <div key={category.id} className="mb-6 px-4">
          <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
          <div className="flex space-x-4 overflow-x-auto p-2">
            {category.films.map((film, index) => (
              <Link
                key={index}
                href={`/movie/${film.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <img
                  src={film.image}
                  alt={film.title}
                  className="w-40 h-60 object-cover rounded-lg cursor-pointer"
                />
              </Link>
            ))}
=======
      
      {/* Section Film Vedette - Style Netflix */}
      <div ref={ref} className="relative w-full h-[100vh] flex items-end md:items-center overflow-hidden">
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/0 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/80 z-10"></div>
        
        {/* Image de fond */}
        <img 
          src={featuredMovie.image} 
          alt={featuredMovie.title} 
          className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${showVideo ? 'opacity-0' : 'opacity-100'}`}
        />
        
        {/* Vidéo avec transition fluide */}
        <div className={`absolute w-full h-full transition-opacity duration-1000 ${showVideo && isVideoReady ? 'opacity-100' : 'opacity-0'}`}>
          <video 
            ref={videoRef}
            src={featuredMovie.video} 
            autoPlay 
            playsInline
            muted={!inView}
            className="w-full h-full object-cover"
            onCanPlayThrough={handleVideoReady}
          />
        </div>

        {/* Contenu texte */}
        <div className="p-6 md:p-12 relative z-20 w-full max-w-4xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-2 drop-shadow-lg">{featuredMovie.title}</h1>
          <div className="flex items-center space-x-4 mb-4">
            <span>{featuredMovie.year}</span>
            <span className="border px-2 py-1 text-xs">{featuredMovie.rating}</span>
            <span>{featuredMovie.duration}</span>
          </div>
          <p className="text-lg text-gray-100 mb-6 max-w-2xl">{featuredMovie.description}</p>
          
          <div className="flex space-x-4">
            <Link href={featuredMovie.fullMovie} target="_blank" rel="noopener noreferrer">
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
>>>>>>> Shun
          </div>
        </div>
      </div>

      {/* Section des catégories */}
      {categories.map((category) => (
        <section key={category.id} className="py-8 px-4 md:px-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{category.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {category.films.map((movie, index) => (
              <div 
                key={index} 
                className="relative group cursor-pointer" 
                onClick={() => handleMovieClick(movie)}
                onMouseEnter={() => setHoveredMovie(movie.title)}
                onMouseLeave={() => setHoveredMovie(null)}
              >
                <div className="aspect-w-2 aspect-h-3 w-full overflow-hidden rounded-lg bg-gray-900">
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className={`w-full h-full object-cover transition-all duration-300 ${hoveredMovie === movie.title ? 'transform scale-110' : ''}`}
                  />
                </div>
                <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                  <div>
                    <p className="text-white font-semibold">{movie.title}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-300">
                      <span>{movie.year}</span>
                      <span className="border px-1">{movie.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      
      {/* Modal des détails du film */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-white mb-2">{selectedMovie.title}</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <span>{selectedMovie.year}</span>
                  <span className="border px-2 py-1 text-xs">{selectedMovie.rating}</span>
                  <span>{selectedMovie.duration}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p><strong className="text-gray-400">Réalisateur:</strong> {selectedMovie.director}</p>
                    <p><strong className="text-gray-400">Scénariste:</strong> {selectedMovie.writer}</p>
                    <p><strong className="text-gray-400">Distribution:</strong> {selectedMovie.cast.join(", ")}</p>
                  </div>
                  <div>
                    <p><strong className="text-gray-400">Genres:</strong> {selectedMovie.genre.join(", ")}</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-6"><strong className="text-gray-400">Synopsis:</strong> {selectedMovie.description}</p>

                <div className="flex space-x-4">
                  {selectedMovie.fullMovie && (
                    <a
                      href={selectedMovie.fullMovie}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md transition-all duration-200 transform hover:scale-105"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Voir le film complet
                    </a>
                  )}
                  {selectedMovie.trailer && (
                    <a 
                      href={selectedMovie.trailer} 
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
                    src={selectedMovie.image} 
                    alt={selectedMovie.title} 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={() => setSelectedMovie(null)}
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

      {/* Plus d'infos pour Training Day */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-white mb-2">{featuredMovie.title}</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <span>{featuredMovie.year}</span>
                  <span className="border px-2 py-1 text-xs">{featuredMovie.rating}</span>
                  <span>{featuredMovie.duration}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p><strong className="text-gray-400">Réalisateur:</strong> {featuredMovie.director}</p>
                    <p><strong className="text-gray-400">Scénariste:</strong> {featuredMovie.writer}</p>
                    <p><strong className="text-gray-400">Distribution:</strong> {featuredMovie.cast.join(", ")}</p>
                  </div>
                  <div>
                    <p><strong className="text-gray-400">Genres:</strong> {featuredMovie.genre.join(", ")}</p>
                    <p><strong className="text-gray-400">Thèmes:</strong> {featuredMovie.themes}</p>
                    <p><strong className="text-gray-400">Ambiance:</strong> {featuredMovie.moods.join(", ")}</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-6">{featuredMovie.detailedDescription}</p>

                <div className="flex space-x-4">
                  <Link href={featuredMovie.fullMovie} target="_blank" rel="noopener noreferrer">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md flex items-center space-x-2 transition-all duration-200 transform hover:scale-105">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Voir le film complet</span>
                    </button>
                  </Link>
                  <a 
                    href={featuredMovie.trailer} 
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
                    src={featuredMovie.image} 
                    alt={featuredMovie.title} 
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
<<<<<<< HEAD
=======

export default MoviePage;
>>>>>>> Shun
