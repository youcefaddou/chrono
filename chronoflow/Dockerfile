# Utilise une image Node officielle pour builder l'app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm run build

# Utilise une image nginx pour servir l'app statique
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Copie une config nginx custom si besoin (optionnel)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
