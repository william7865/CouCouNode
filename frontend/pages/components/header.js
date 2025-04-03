import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => router.pathname === path;

  return (
    <header
      className={`fixed w-full top-0 left-0 p-4 z-50 ${
        isScrolled ? "bg-black/90" : "bg-[#141414]"
      } transition-colors duration-300`}
    >
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <img
            src="/images/logo-streamflix.png"
            alt="Streamflix"
            onClick={() => router.push("/")}
            className="h-12 w-48 object-contain transform scale-200 cursor-pointer"
          />

          <div className="flex gap-6 text-white">
            <Link
              href="/"
              className={`pb-1 ${
                isActive("/") ? "border-b-2 border-white" : "hover:opacity-75"
              }`}
            >
              Accueil
            </Link>
            <Link
              href="/series"
              className={`pb-1 ${
                isActive("/series")
                  ? "border-b-2 border-white"
                  : "hover:opacity-75"
              }`}
            >
              Séries
            </Link>
            <Link
              href="/movie"
              className={`pb-1 ${
                isActive("/movie")
                  ? "border-b-2 border-white"
                  : "hover:opacity-75"
              }`}
            >
              Films
            </Link>
            <Link
              href="/nouveaute"
              className={`pb-1 ${
                isActive("/nouveaute")
                  ? "border-b-2 border-white"
                  : "hover:opacity-75"
              }`}
            >
              Nouveautés les plus regardées
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6 text-white">
          <Link href="/account" className="hover:opacity-75">
            Compte
          </Link>
        </div>
      </nav>
    </header>
  );
}
