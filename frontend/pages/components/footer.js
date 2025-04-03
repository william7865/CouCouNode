import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 px-16 py-12 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h6 className="text-white mb-4">Autobotsecrption</h6>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/investisseurs">
                  <a className="hover:text-white">Relations investisseurs</a>
                </Link>
              </li>
              <li>
                <Link href="/confidentialite">
                  <a className="hover:text-white">Confidentialité</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="hover:text-white">Nous contacter</a>
                </Link>
              </li>
              <li>
                <Link href="/codeservice">
                  <a className="hover:text-white">Code de service</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h6 className="text-white mb-4">Centre d'aide</h6>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/recrutement">
                  <a className="hover:text-white">Recrutement</a>
                </Link>
              </li>
              <li>
                <Link href="/legales">
                  <a className="hover:text-white">Informations légales</a>
                </Link>
              </li>
              <li>
                <Link href="/pub">
                  <a className="hover:text-white">Choix liés à la pub</a>
                </Link>
              </li>
              <li>
                <Link href="/cadeaux">
                  <a className="hover:text-white">Cartes cadeaux</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h6 className="text-white mb-4">Boutique</h6>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/boutique">
                  <a className="hover:text-white">Boutique Netflix</a>
                </Link>
              </li>
              <li>
                <Link href="/cookies">
                  <a className="hover:text-white">Préférences de cookies</a>
                </Link>
              </li>
              <li>
                <Link href="/presse">
                  <a className="hover:text-white">Presse</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h6 className="text-white mb-4">Juridique</h6>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/conditions">
                  <a className="hover:text-white">Conditions d'utilisation</a>
                </Link>
              </li>
              <li>
                <Link href="/mentions">
                  <a className="hover:text-white">Mentions légales</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-sm">
          <div className="mb-4">
            <span className="text-white">CONT © GROVE</span> • CANB STREET
          </div>
          <div className="mb-4">
            <span className="text-white">FREE SAVOIR</span> • SEES VOTRE
          </div>
          <div className="mb-4">
            <span className="text-white">INTERNARX</span> • ENJUPE DE RECUMBRED
          </div>
          <div className="text-gray-600">
            © 1997-2005 Netflix, Inc. • Train Merge • UNIOR AMATE RIVELANT
          </div>
        </div>
      </div>
    </footer>
  );
}
