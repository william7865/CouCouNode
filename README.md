# 🎬 Streamflix - Boilerplate API & Frontend

Ce projet est une application avec une API en Node.js et un frontend en Next.js.

## 🚀 Installation & Lancement

### 1 Cloner le projet

```bash
git clone https://github.com/william7865/CouCouNode
cd CoucouNode
```

### 2 Installer les dépendances

```bash
cd api
npm install
```

```bash
cd ../frontend
npm install
```

### 3 Configurer le .env ou en crée un

3.1 :

```bash
cd api
touch .env
```

3.2 :

mettre :

```bash
DB_HOST=[localhost]
DB_USER=[Nom_User]
DB_PASSWORD=[Mot_De_Passe_DB]
DB_NAME=[Nom_DB]
DB_PORT=[Port_Du_DB]
SECRET_KEY=[secret]
```

### 4 Crée la BDD

script de la BDD dans bdd/init.sql

Copier/Coller puis l'insérer dans le logiciel (DBeaver ou PG admin 4)

### 5 Lancer le projet en lançant l'API et le Frontend

API :

```bash
cd api
npx nodemon
```

FrontEnd :

```bash
cd frontend
npm run dev
```

### 6 Se rediriger vers le port

http://localhost:3000
