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
          // Footer
          "footer.product": "Produit",
          "footer.pricing": "Tarifs",
          "footer.resources": "Ressources",
          "footer.help": "Aide",
          "footer.faq": "FAQ",
          "footer.contact": "Contact",
          "footer.legal": "Légal",
          "footer.legalNotice": "Mentions légales",
          "footer.privacyPolicy": "Politique de confidentialité",
          "footer.terms": "Conditions d'utilisation",
          "footer.rights": "Tous droits réservés.",
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
          // Footer
          "footer.product": "Product",
          "footer.pricing": "Pricing",
          "footer.resources": "Resources",
          "footer.help": "Help",
          "footer.faq": "FAQ",
          "footer.contact": "Contact",
          "footer.legal": "Legal",
          "footer.legalNotice": "Legal Notice",
          "footer.privacyPolicy": "Privacy Policy",
          "footer.terms": "Terms of Service",
          "footer.rights": "All rights reserved.",
        },
      },
    },
    lng: "fr",
    fallbackLng: "fr",
    interpolation: { escapeValue: false },
  });

export default i18n;
