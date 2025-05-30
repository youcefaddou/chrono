import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import logo from "../../assets/logo.png";
import flagFr from "../../assets/france.png";
import flagEn from "../../assets/eng.png";
import "./Header.css";

const navLinks = [
  { to: "/product", label: "header.product" },
  { to: "/pricing", label: "header.pricing" },
  { to: "/ressources", label: "header.resources" },
];

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef();
  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/en/dashboard";

  const showFlag = i18n.language.startsWith("fr") ? flagEn : flagFr;
  const nextLang = i18n.language.startsWith("fr") ? "en" : "fr";

  const handleLangSwitch = () => {
    handleLang(nextLang);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseJwt(token);
      setUser(decoded);
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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

  const handleLang = (lng) => {
    const path = location.pathname;
    if (lng === "en") {
      if (!path.startsWith("/en")) {
        // Redirige dashboard vers /en/dashboard
        if (path === "/dashboard") {
          navigate("/en/dashboard");
        } else {
          navigate("/en" + (path === "/" ? "" : path));
        }
      }
    } else {
      if (path.startsWith("/en")) {
        // Redirige /en/dashboard vers /dashboard
        if (path === "/en/dashboard") {
          navigate("/dashboard");
        } else {
          navigate(path.replace(/^\/en/, "") || "/");
        }
      }
    }
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <header className={`header-sticky${isDashboard ? " dashboard-header" : ""}`} aria-label="Barre de navigation principale">
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
        <div className="flex items-center gap-2 ml-auto">
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
                  onClick={handleLogin}
                  className="header-btn header-btn-main"
                >
                  {t("header.login")}
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
          </ul>
          <button
            onClick={handleLangSwitch}
            className="header-lang-btn"
            aria-label={nextLang === "fr" ? "Français" : "English"}
          >
            <img src={showFlag} alt={nextLang} className="header-flag" />
          </button>
        </div>
      </nav>
    </header>
  );
}
