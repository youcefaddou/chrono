import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Détection de la langue à partir de l'URL
function detectLanguageFromPath() {
  if (typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/en")) return "en";
    return "fr";
  }
  return "fr";
}

const initialLang = detectLanguageFromPath();

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
          "hero.cta": "Créer un compte",
          // How it works
          "howitworks.title": "Comment ça marche ?",
          "howitworks.step1Title": "Démarrez le timer",
          "howitworks.step1Desc": "Lancez votre session de travail en un clic.",
          "howitworks.step2Title": "Ajoutez vos tâches",
          "howitworks.step2Desc": "Notez et organisez vos tâches à accomplir.",
          "howitworks.step3Title": "Analysez vos progrès",
          "howitworks.step3Desc": "Consultez vos statistiques et améliorez-vous.",          // Sidebar & Dashboard navigation
          "sidebar.workspace": "Espace de travail",
          "sidebar.organization": "Organisation",
          "sidebar.settings": "Paramètres",
          "sidebar.subscription": "Abonnement",
          // Calendar
          "calendar.today": "Aujourd'hui",
          "calendar.yesterday": "Hier",
          "calendar.thisWeek": "Cette semaine - S{week}",
          "calendar.lastWeek": "Semaine dernière - S{week}",
          "calendar.custom": "Date personnalisée",
          "calendar.next": "Semaine suivante",
          "calendar.prev": "Semaine précédente",
          "calendar.calendar": "Calendrier",
          "calendar.listView": "Liste",
          "calendar.timesheet": "Feuille de temps",
          // Dashboard
          dashboard: {
            welcome: "Bienvenue",
            subtitle: "Voici votre espace personnel.",
            newTask: "Nouvelle tâche",
            viewTasks: "Voir les tâches",
            analytics: "Statistiques",
            settings: "Paramètres",
            tasks: {
              todo: "À faire",
              inProgress: "En cours",
              done: "Terminées",
            },
            activity: {
              title: "Activité récente",
              createdTask: "Nouvelle tâche créée",
              completedTask: "Tâche terminée",
              updatedProfile: "Profil mis à jour",
            },
          },
          // RightPanel
          // "rightPanel.objectives": "Objectifs",
          // "rightPanel.addObjective": "Ajouter un objectif",
          // "rightPanel.noObjectives": "Aucun objectif ajouté.",
          // "rightPanel.favorites": "Favoris", // Favoris désactivés
          // "rightPanel.addFavorite": "Ajouter un favori", // Favoris désactivés
          // "rightPanel.noFavorites": "Aucun favori ajouté.", // Favoris désactivés
          // Task actions
          "task.complete": "Terminer la tâche",
          "task.completed": "Terminée",
          // Timer actions
          "timer.start": "Démarrer",
          "timer.pause": "Pause",
          "timer.resume": "Reprendre",
          "timer.stop": "Arrêter",
          "project.time": "Temps",
          // Settings
          settings: {
            title: 'Paramètres',
            userProfile: 'Profil utilisateur',
            preferences: 'Préférences',
            security: 'Sécurité',
            integrations: 'Intégrations',
            support: 'Support',
            others: 'Autres',
            items: {
              name: 'Nom',
              email: 'Email',
              password: 'Mot de passe',
              language: 'Langue',
              theme: 'Thème',
              notifications: 'Notifications',
              twoFactorAuth: 'Authentification à deux facteurs',
              connectedDevices: 'Appareils connectés',
              loginHistory: 'Historique des connexions',
              connectGoogleCalendar: 'Connecter Google Calendar',
              managePermissions: 'Gérer les autorisations',
              faq: 'FAQ',
              contactSupport: 'Contacter le support',
              documentation: 'Documentation',
              reset: 'Réinitialiser',
              exportData: 'Exporter les données',
              deleteData: 'Supprimer les données',
              save: 'Enregistrer',
              edit: 'Modifier',
              createdAt: 'Créé le',
              lastSignInAt: 'Dernière connexion le',
              oldPassword: 'Ancien mot de passe',
              newPassword: 'Nouveau mot de passe',
              confirmPassword: 'Confirmer le mot de passe',
              changePassword: 'Changer le mot de passe',
            },
          },
          // Google Calendar
          googleCalendar: {
            title: 'Google Calendar',
            description: 'Connecte ton compte Google Calendar pour synchroniser tes tâches.',
            connect: 'Connecter Google Calendar',
            connecting: 'Connexion...',
            connected: 'Google Calendar connecté',
          },
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
          "hero.cta": "Create an account",
          // How it works
          "howitworks.title": "How does it work?",
          "howitworks.step1Title": "Start the timer",
          "howitworks.step1Desc": "Launch your work session in one click.",
          "howitworks.step2Title": "Add your tasks",
          "howitworks.step2Desc": "Write down and organize your tasks to accomplish.",
          "howitworks.step3Title": "Analyze your progress",
          "howitworks.step3Desc": "Check your stats and improve yourself.",          // Sidebar & Dashboard navigation
          "sidebar.workspace": "Workspace",
          "sidebar.organization": "Organization",
          "sidebar.settings": "Settings",
          "sidebar.subscription": "Subscription",
          // Calendar
          "calendar.today": "Today",
          "calendar.yesterday": "Yesterday",
          "calendar.thisWeek": "This week - W{week}",
          "calendar.lastWeek": "Last week - W{week}",
          "calendar.custom": "Custom date",
          "calendar.next": "Next week",
          "calendar.prev": "Previous week",
          "calendar.calendar": "Calendar",
          "calendar.listView": "List view",
          "calendar.timesheet": "Timesheet",
          // Dashboard
          dashboard: {
            welcome: "Welcome",
            subtitle: "Here is your personal dashboard.",
            newTask: "New Task",
            viewTasks: "View Tasks",
            analytics: "Analytics",
            settings: "Settings",
            tasks: {
              todo: "To do",
              inProgress: "In progress",
              done: "Completed",
            },
            activity: {
              title: "Recent Activity",
              createdTask: "Created a new task",
              completedTask: "Completed a task",
              updatedProfile: "Updated profile",
            },
          },
          // RightPanel
          // "rightPanel.objectives": "Objectives",
          // "rightPanel.addObjective": "Add objective",
          // "rightPanel.noObjectives": "No objectives added.",
          // "rightPanel.favorites": "Favorites", // Favoris désactivés
          // "rightPanel.addFavorite": "Add favorite", // Favoris désactivés
          // "rightPanel.noFavorites": "No favorites added.", // Favoris désactivés
          // Task actions
          "task.complete": "Complete task",
          "task.completed": "Completed",
          // Timer actions
          "timer.start": "Start",
          "timer.pause": "Pause",
          "timer.resume": "Resume",
          "timer.stop": "Stop",
          "project.time": "Time",
          // Settings
          settings: {
            title: 'Settings',
            userProfile: 'User Profile',
            preferences: 'Preferences',
            security: 'Security',
            integrations: 'Integrations',
            support: 'Support',
            others: 'Others',
            items: {
              name: 'Name',
              email: 'Email',
              password: 'Password',
              language: 'Language',
              theme: 'Theme',
              notifications: 'Notifications',
              twoFactorAuth: 'Two-Factor Authentication',
              connectedDevices: 'Connected Devices',
              loginHistory: 'Login History',
              connectGoogleCalendar: 'Connect Google Calendar',
              managePermissions: 'Manage permissions',
              faq: 'FAQ',
              contactSupport: 'Contact Support',
              documentation: 'Documentation',
              reset: 'Reset',
              exportData: 'Export Data',
              deleteData: 'Delete Data',
              save: 'Save',
              edit: 'Edit',
              createdAt: 'Created At',
              lastSignInAt: 'Last Sign-In At',
              oldPassword: 'Old password',
              newPassword: 'New password',
              confirmPassword: 'Confirm password',
              changePassword: 'Change password',
            },
          },
          // Google Calendar
          googleCalendar: {
            title: 'Google Calendar',
            description: 'Connect your Google Calendar account to sync your tasks.',
            connect: 'Connect Google Calendar',
            connecting: 'Connecting...',
            connected: 'Google Calendar connected',
          },
        },
      },
    },
    lng: initialLang,
    fallbackLng: "fr",
    interpolation: { escapeValue: false },
  });

// Synchronise la langue i18n avec la route à chaque navigation
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    const lang = detectLanguageFromPath();
    if (i18n.language !== lang) i18n.changeLanguage(lang);
  });
}

export default i18n;
