import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import Header from "../pages/header";
import Link from "next/link";

const categories = [
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
];

export default function MoviePage() {
  const { token } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token]);

  if (!token) return <p>Redirection en cours...</p>;

  return (
    <div className="bg-black min-h-screen text-white">
      <Header />
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
          </div>
        </div>
      ))}
    </div>
  );
}
