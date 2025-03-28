import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => router.pathname === path;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        padding: "1rem",
        backgroundColor: isScrolled ? "rgba(0, 0, 0, 0.7)" : "#141414",
        zIndex: 1000,
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <img src="/logo.png" alt="Logo" style={{ height: "40px" }} />
        </div>

        <div style={{ display: "flex", gap: "1.5rem", color: "#fff" }}>
          <Link
            href="/"
            style={{ borderBottom: isActive("/") ? "2px solid white" : "none" }}
          >
            Accueil
          </Link>
          <Link
            href="/movie"
            style={{
              borderBottom: isActive("/movie") ? "2px solid white" : "none",
            }}
          >
            Film
          </Link>
          <Link
            href="/series"
            style={{
              borderBottom: isActive("/series") ? "2px solid white" : "none",
            }}
          >
            Série
          </Link>
          <Link
            href="/news"
            style={{
              borderBottom: isActive("/news") ? "2px solid white" : "none",
            }}
          >
            Nouveautés
          </Link>
        </div>

        <div style={{ display: "flex", gap: "1rem", color: "#fff" }}>
          <Link
            href="/account"
            style={{
              borderBottom: isActive("/account") ? "2px solid white" : "none",
            }}
          >
            Compte
          </Link>
          <Link
            href="/settings"
            style={{
              borderBottom: isActive("/settings") ? "2px solid white" : "none",
            }}
          >
            Paramètres
          </Link>
          <Link
            href="/login"
            style={{
              borderBottom: isActive("/login") ? "2px solid white" : "none",
            }}
          >
            Déconnexion
          </Link>
        </div>
      </nav>
    </header>
  );
}
