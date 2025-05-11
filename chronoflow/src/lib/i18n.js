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
          // Features
          "features.title": "Fonctionnalités clés",
          "features.timerTitle": "Timer intelligent",
          "features.timerDesc": "Démarrez, arrêtez et suivez votre temps facilement.",
          "features.tasksTitle": "Gestion des tâches",
          "features.tasksDesc": "Organisez vos tâches et priorisez vos journées.",
          "features.statsTitle": "Statistiques visuelles",
          "features.statsDesc": "Visualisez vos progrès avec des graphiques clairs.",
          "features.calendarTitle": "Intégration Google Calendar",
          "features.calendarDesc": "Synchronisez vos événements et tâches.",
          "features.securityTitle": "Sauvegarde sécurisée",
          "features.securityDesc": "Vos données sont protégées et sauvegardées.",
          // Hero
          "hero.title": "Gérez votre temps et vos tâches efficacement avec ChronoFlow",
          "hero.subtitle": "ChronoFlow est la solution moderne pour organiser vos journées, suivre vos projets et booster votre productivité. Profitez d'une interface intuitive, d'une sécurité optimale et d'une gestion du temps simplifiée, où que vous soyez.",
          // How it works
          "howitworks.title": "Comment ça marche ?",
          "howitworks.step1Title": "Démarrez le timer",
          "howitworks.step1Desc": "Lancez votre session de travail en un clic.",
          "howitworks.step2Title": "Ajoutez vos tâches",
          "howitworks.step2Desc": "Notez et organisez vos tâches à accomplir.",
          "howitworks.step3Title": "Analysez vos progrès",
          "howitworks.step3Desc": "Consultez vos statistiques et améliorez-vous.",
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
          // Features
          "features.title": "Key Features",
          "features.timerTitle": "Smart Timer",
          "features.timerDesc": "Start, stop, and track your time easily.",
          "features.tasksTitle": "Task Management",
          "features.tasksDesc": "Organize your tasks and prioritize your days.",
          "features.statsTitle": "Visual Statistics",
          "features.statsDesc": "See your progress with clear charts.",
          "features.calendarTitle": "Google Calendar Integration",
          "features.calendarDesc": "Sync your events and tasks.",
          "features.securityTitle": "Secure Backup",
          "features.securityDesc": "Your data is protected and backed up.",
          // Hero
          "hero.title": "Manage your time and tasks efficiently with ChronoFlow",
          "hero.subtitle": "ChronoFlow is the modern solution to organize your days, track your projects, and boost your productivity. Enjoy an intuitive interface, optimal security, and simplified time management—anywhere, anytime.",
          // How it works
          "howitworks.title": "How does it work?",
          "howitworks.step1Title": "Start the timer",
          "howitworks.step1Desc": "Launch your work session in one click.",
          "howitworks.step2Title": "Add your tasks",
          "howitworks.step2Desc": "Write down and organize your tasks to accomplish.",
          "howitworks.step3Title": "Analyze your progress",
          "howitworks.step3Desc": "Check your stats and improve yourself.",
        },
      },
    },
    lng: "fr",
    fallbackLng: "fr",
    interpolation: { escapeValue: false },
  });

export default i18n;
