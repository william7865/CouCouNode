import Link from "next/link";

export default function Header() {
  return (
    <header style={{ padding: "1rem", background: "#eee" }}>
      <nav>
        <Link href="/" style={{ marginRight: "1rem" }}>
          Accueil
        </Link>
        <Link href="/profile" style={{ marginRight: "1rem" }}>
          Profil
        </Link>
        <Link href="/settings">Paramètres</Link>
      </nav>
    </header>
  );
}
