// components/Header.js
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
            src="/logo.png"
            alt="NETFLIX"
            className="h-8 w-32 object-contain"
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
              href="/films"
              className={`pb-1 ${
                isActive("/films")
                  ? "border-b-2 border-white"
                  : "hover:opacity-75"
              }`}
            >
              Films
            </Link>
            <Link
              href="/nouveautes"
              className={`pb-1 ${
                isActive("/nouveautes")
                  ? "border-b-2 border-white"
                  : "hover:opacity-75"
              }`}
            >
              Nouveautés les plus regardées
            </Link>
            <Link
              href="/maliste"
              className={`pb-1 ${
                isActive("/maliste")
                  ? "border-b-2 border-white"
                  : "hover:opacity-75"
              }`}
            >
              Ma liste
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6 text-white">
          <button className="hover:opacity-75">
            <span className="material-icons">language</span>
            Explorer par langue
          </button>
          <Link href="/compte" className="hover:opacity-75">
            Compte
          </Link>
        </div>
      </nav>
    </header>
  );
}
