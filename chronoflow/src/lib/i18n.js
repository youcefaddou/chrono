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
          // FAQ
          "faq.title": "Questions fréquemment posées",
          "faq.subtitle": "Trouvez rapidement les réponses à vos questions sur ChronoFlow",
          "faq.question1": "Comment fonctionne ChronoFlow ?",
          "faq.answer1": "ChronoFlow vous permet de gérer votre temps et vos tâches simplement. Démarrez le timer pour suivre votre temps de travail, créez et organisez vos tâches, puis consultez vos statistiques pour améliorer votre productivité. Tout est conçu pour être intuitif et efficace.",
          "faq.question2": "Mes données sont-elles protégées ?",
          "faq.answer2": "Oui, vos données sont stockées en Europe et protégées conformément au RGPD. Nous utilisons des protocoles de sécurité avancés et vos informations personnelles ne sont jamais partagées avec des tiers.",
          "faq.question3": "Comment contacter l'équipe ?",
          "faq.answer3": "Vous pouvez nous écrire via la page Contact ou par email à contact.chronoflow@gmail.com. Notre équipe vous répond généralement sous 24h.",
          "faq.question4": "Puis-je synchroniser ChronoFlow avec Google Calendar ?",
          "faq.answer4": "Absolument ! ChronoFlow offre une intégration complète avec Google Calendar. Vous pouvez synchroniser vos événements, créer des tâches directement depuis vos rendez-vous et suivre le temps passé sur chaque activité calendaire.",
          "faq.question5": "ChronoFlow est-il gratuit ?",
          "faq.answer5": "ChronoFlow propose une version gratuite avec les fonctionnalités essentielles : timer, gestion de tâches de base et statistiques simples. Pour des fonctionnalités avancées comme l'intégration Google Calendar, les rapports détaillés et la collaboration en équipe, nous proposons des plans premium abordables.",          "faq.noAnswer": "Vous ne trouvez pas votre réponse ?",
          "faq.contactTeam": "Notre équipe est là pour vous aider. N'hésitez pas à nous contacter !",
          "faq.contactButton": "Nous contacter",
          // Home components
          "home.faq.title": "Questions Fréquentes",
          "home.faq.subtitle": "Découvrez les réponses aux questions les plus courantes sur ChronoFlow",
          "home.faq.question1": "ChronoFlow est-il disponible en anglais ?",
          "home.faq.answer1": "Oui, vous pouvez cliquer sur le drapeau et profiter des fonctionnalités en anglais. L'interface s'adapte automatiquement à votre langue préférée.",
          "home.faq.question2": "Mes données sont-elles sécurisées ?",
          "home.faq.answer2": "Vos données sont stockées en Europe et protégées selon les normes RGPD. Nous utilisons un chiffrement de bout en bout et des serveurs sécurisés pour garantir la confidentialité de vos informations.",
          "home.faq.question3": "Puis-je connecter mon Google Calendar ?",
          "home.faq.answer3": "Oui, l'intégration Google Calendar est disponible pour synchroniser vos événements. Vous pouvez importer vos rendez-vous et synchroniser automatiquement votre planning.",
          "home.faq.moreQuestions": "Vous avez d'autres questions ?",
          "home.faq.contactUs": "Nous contacter",
          "home.testimonials.title": "Ils utilisent ChronoFlow",
          "home.testimonials.testimonial1.text": "\"ChronoFlow m'aide à rester concentré et à mieux gérer mes journées.\"",
          "home.testimonials.testimonial1.name": "Alice, Freelance",
          "home.testimonials.testimonial2.text": "\"L'interface est super intuitive, je recommande à 100%.\"",
          "home.testimonials.testimonial2.name": "Karim, Étudiant",
          "home.testimonials.testimonial3.text": "\"Les statistiques sont top pour suivre mes progrès.\"",
          "home.testimonials.testimonial3.name": "Sophie, Manager",
          "home.cta.title": "Prêt à booster votre productivité ?",
          "home.cta.subtitle": "Essayez ChronoFlow gratuitement dès aujourd'hui.",
          "home.cta.button": "Créer un compte",
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
          // FAQ
          "faq.title": "Frequently Asked Questions",
          "faq.subtitle": "Find quick answers to your questions about ChronoFlow",
          "faq.question1": "How does ChronoFlow work?",
          "faq.answer1": "ChronoFlow allows you to manage your time and tasks simply. Start the timer to track your work time, create and organize your tasks, then check your statistics to improve your productivity. Everything is designed to be intuitive and efficient.",
          "faq.question2": "Is my data protected?",
          "faq.answer2": "Yes, your data is stored in Europe and protected in accordance with GDPR. We use advanced security protocols and your personal information is never shared with third parties.",
          "faq.question3": "How can I contact the team?",
          "faq.answer3": "You can write to us via the Contact page or by email at contact.chronoflow@gmail.com. Our team usually responds within 24 hours.",
          "faq.question4": "Can I sync ChronoFlow with Google Calendar?",
          "faq.answer4": "Absolutely! ChronoFlow offers complete integration with Google Calendar. You can sync your events, create tasks directly from your appointments, and track time spent on each calendar activity.",
          "faq.question5": "Is ChronoFlow free?",
          "faq.answer5": "ChronoFlow offers a free version with essential features: timer, basic task management, and simple statistics. For advanced features like Google Calendar integration, detailed reports, and team collaboration, we offer affordable premium plans.",          "faq.noAnswer": "Can't find your answer?",
          "faq.contactTeam": "Our team is here to help you. Don't hesitate to contact us!",
          "faq.contactButton": "Contact us",
          // Home components
          "home.faq.title": "Frequently Asked Questions",
          "home.faq.subtitle": "Find answers to the most common questions about ChronoFlow",
          "home.faq.question1": "Is ChronoFlow available in English?",
          "home.faq.answer1": "Yes, you can click on the flag and enjoy the features in English. The interface automatically adapts to your preferred language.",
          "home.faq.question2": "Is my data secure?",
          "home.faq.answer2": "Your data is stored in Europe and protected according to GDPR standards. We use end-to-end encryption and secure servers to ensure the confidentiality of your information.",
          "home.faq.question3": "Can I connect my Google Calendar?",
          "home.faq.answer3": "Yes, Google Calendar integration is available to synchronize your events. You can import your appointments and automatically sync your schedule.",
          "home.faq.moreQuestions": "Have more questions?",
          "home.faq.contactUs": "Contact us",
          "home.testimonials.title": "They use ChronoFlow",
          "home.testimonials.testimonial1.text": "\"ChronoFlow helps me stay focused and better manage my days.\"",
          "home.testimonials.testimonial1.name": "Alice, Freelancer",
          "home.testimonials.testimonial2.text": "\"The interface is super intuitive, I recommend it 100%.\"",
          "home.testimonials.testimonial2.name": "Karim, Student",
          "home.testimonials.testimonial3.text": "\"The statistics are great for tracking my progress.\"",
          "home.testimonials.testimonial3.name": "Sophie, Manager",
          "home.cta.title": "Ready to boost your productivity?",
          "home.cta.subtitle": "Try ChronoFlow for free today.",
          "home.cta.button": "Create an account",
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
