import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";
import flagFr from "../../assets/france.png";
import flagEn from "../../assets/eng.png";
import "./Header.css";

const navLinks = [
  { to: "/product", label: "header.product" },
  { to: "/pricing", label: "header.pricing" },
  { to: "/ressources", label: "header.resources" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navRef = useRef();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Ferme le menu si on clique en dehors du header/nav
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleLang = (lng) => i18n.changeLanguage(lng);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleLogin = async (provider) => {
    if (provider === "email") {
      window.location.href = "/login";
    } else {
      await supabase.auth.signInWithOAuth({ provider });
    }
  };

  return (
    <header className="header-sticky" aria-label="Barre de navigation principale">
      <nav className="header-nav" ref={navRef}>
        <div className="header-logo-title">
          <Link to="/">
            <img src={logo} alt="Logo ChronoFlow" className="header-logo" />
          </Link>
        </div>
        <button
          className="header-burger"
          aria-label="Ouvrir le menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="header-burger-bar"></span>
          <span className="header-burger-bar"></span>
          <span className="header-burger-bar"></span>
        </button>
        <ul
          className={`header-links ${menuOpen ? "header-links-open" : ""}`}
          aria-label="Liens de navigation"
        >
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`header-link${location.pathname === link.to ? " header-link-active" : ""}`}
              >
                {t(link.label)}
              </Link>
            </li>
          ))}
          {user && (
            <li>
              <Link
                to="/dashboard"
                className={`header-link${location.pathname === "/dashboard" ? " header-link-active" : ""}`}
              >
                {t("header.dashboard")}
              </Link>
            </li>
          )}
          {!user && (
            <li className="header-login-row">
              <button
                onClick={() => handleLogin("email")}
                className="header-btn header-btn-main"
              >
                {t("header.login")}
              </button>
              <button
                onClick={() => handleLogin("google")}
                className="header-btn header-btn-google"
              >
                Google
              </button>
              <button
                onClick={() => handleLogin("github")}
                className="header-btn header-btn-github"
              >
                GitHub
              </button>
            </li>
          )}
          {user && (
            <li>
              <button
                onClick={handleLogout}
                className="header-btn header-btn-logout"
              >
                {t("header.logout")}
              </button>
            </li>
          )}
          <li className="header-lang">
            <button
              onClick={() => handleLang("fr")}
              className="header-lang-btn"
              aria-label="Français"
            >
              <img src={flagFr} alt="Français" className="header-flag" />
            </button>
            <button
              onClick={() => handleLang("en")}
              className="header-lang-btn"
              aria-label="Anglais"
            >
              <img src={flagEn} alt="English" className="header-flag" />
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
