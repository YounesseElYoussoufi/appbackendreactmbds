# Étape 1 : Choisir l'image de base
FROM node:18

# Étape 2 : Définir le répertoire de travail
WORKDIR /usr/src/app

# Étape 3 : Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install

# Étape 5 : Copier tous les fichiers du backend dans l'image Docker
COPY . .

# Étape 6 : Exposer le port sur lequel le serveur écoute
EXPOSE 8010

# Étape 7 : Démarrer le serveur Node.js
CMD ["npm", "start"]
