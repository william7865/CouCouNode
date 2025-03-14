import { useState } from "react";
import { useRouter } from "next/router";
import "/src/app/globals.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:3001/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        birth_date: birthDate,
      }),
    });

    if (response.ok) {
      router.push("/login");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <header className="mb-6">
        <img src="/logo.svg" alt="Streamflix" className="w-32" />
      </header>

      <form
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-96"
        onSubmit={handleRegister}
      >
        <h1 className="text-2xl font-bold text-center mb-2">
          Commencez votre essai gratuit
        </h1>
        <p className="text-gray-400 text-center mb-6">
          Créez votre compte en quelques secondes
        </p>

        <div className="flex flex-col mb-4">
          <label className="text-sm mb-1">Adresse email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col mb-4">
          <label className="text-sm mb-1">Nom complet</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col mb-4">
          <label className="text-sm mb-1">Date de naissance</label>
          <input
            type="date"
            required
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col mb-6 relative">
          <label className="text-sm mb-1">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-400"
          >
            👁
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-bold text-white transition"
        >
          Commencer l'aventure
        </button>

        <div className="text-center my-4 text-gray-400">OU</div>

        <button
          type="button"
          className="w-full flex items-center justify-center bg-white text-black p-2 rounded shadow hover:bg-gray-200 transition"
        >
          <img src="/google-icon.svg" alt="Google" className="w-5 mr-2" />
          Continuer avec Google
        </button>

        <p className="text-center text-gray-400 mt-4">
          Déjà membre ?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Se connecter
          </a>
        </p>
      </form>
    </div>
  );
}
