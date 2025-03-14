import Link from "next/link";

export default function Header() {
  return (
    <header style={{ padding: "1rem", background: "#eee" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <img src="/logo.png" alt="Logo" style={{ height: "40px" }} />
        </div>

        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Link href="/">Accueil</Link>
          <Link href="/movie">Film</Link>
          <Link href="/series">Série</Link>
          <Link href="/news">Nouveautés</Link>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/profile">Profil</Link>
          <Link href="/settings">Paramètres</Link>
          <Link href="/login">Déconnexion</Link>
        </div>
      </nav>
    </header>
  );
}