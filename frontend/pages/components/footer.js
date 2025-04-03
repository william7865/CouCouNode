import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 px-16 py-12 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h6 className="text-white mb-4">Autobotsecrption</h6>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/investisseurs" className="hover:text-white">
                  Relations investisseurs
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:text-white">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Nous contacter
                </Link>
              </li>
              <li>
                <Link href="/codeservice" className="hover:text-white">
                  Code de service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h6 className="text-white mb-4">Centre d'aide</h6>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/recrutement" className="hover:text-white">
                  Recrutement
                </Link>
              </li>
              <li>
                <Link href="/legales" className="hover:text-white">
                  Informations légales
                </Link>
              </li>
              <li>
                <Link href="/pub" className="hover:text-white">
                  Choix liés à la pub
                </Link>
              </li>
              <li>
                <Link href="/cadeaux" className="hover:text-white">
                  Cartes cadeaux
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h6 className="text-white mb-4">Boutique</h6>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cookies" className="hover:text-white">
                  Préférences de cookies
                </Link>
              </li>
              <li>
                <Link href="/presse" className="hover:text-white">
                  Presse
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h6 className="text-white mb-4">Juridique</h6>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/conditions" className="hover:text-white">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/mentions" className="hover:text-white">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-sm">
          <div className="text-gray-600">
            © 2025 Streamtflix - Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
}
