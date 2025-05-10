import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: {
          // Ajoute tes clés/valeurs ici
          "header.product": "Produit",
          "header.pricing": "Tarifs",
          "header.resources": "Ressources",
          "header.dashboard": "Tableau de bord",
          "header.login": "Connexion",
          "header.logout": "Se déconnecter",
        },
      },
      en: {
        translation: {
          "header.product": "Product",
          "header.pricing": "Pricing",
          "header.resources": "Resources",
          "header.dashboard": "Dashboard",
          "header.login": "Login",
          "header.logout": "Logout",
        },
      },
    },
    lng: "fr",
    fallbackLng: "fr",
    interpolation: { escapeValue: false },
  });

export default i18n;
