# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


npm create vite@latest chronoflow -- --template react
npm install @vitejs/plugin-react
cd chronoflow
npm install
npm run dev
npm install -D tailwindcss postcss autoprefixer
npm install @supabase/supabase-js
npm install next-auth @supabase/auth-helpers-nextjs
npm install @stripe/stripe-js
npm install date-fns
npm install react-hook-form zod
npm install -D eslint prettier eslint-config-prettier eslint-plugin-react
npm install i18next react-i18next
npm install @hookform/resolvers zod
npm install jspdf jspdf-autotable chart.js
npm install animejs

supabase functions deploy update-task-durations  

docker build -t chronoflow .

## Déploiement et utilisation avec Docker

### 1. Cloner le projet sur un autre PC

```sh
git clone <url-du-repo>
cd chronoflow
```

### 2. Construire l'image Docker

```sh
docker build -t chronoflow .
```

### 3. Lancer le conteneur

```sh
docker run -p 3000:80 chronoflow
```

- Accède à l'application sur http://localhost:3000

### 4. (Optionnel) Arrêter et supprimer le conteneur

Pour voir les conteneurs en cours :
```sh
docker ps
```
Pour arrêter un conteneur :
```sh
docker stop <container_id>
```
Pour supprimer un conteneur :
```sh
docker rm <container_id>
```

### Remarques

- Tu dois avoir Docker Desktop installé et lancé.
- Si tu modifies le code, rebuild l'image (`docker build ...`) pour voir les changements.
- Les dépendances sont installées automatiquement lors du build Docker.
- Pour le développement local, utilise `npm run dev` sans Docker.