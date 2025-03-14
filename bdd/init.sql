-- Supprimer les anciennes tables si elles existent
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Profiles CASCADE;
DROP TABLE IF EXISTS Devices CASCADE;
DROP TABLE IF EXISTS Payments CASCADE;
DROP TABLE IF EXISTS Genres CASCADE;
DROP TABLE IF EXISTS Movies CASCADE;
DROP TABLE IF EXISTS Series CASCADE;
DROP TABLE IF EXISTS Episodes CASCADE;
DROP TABLE IF EXISTS Watch_History CASCADE;
DROP TABLE IF EXISTS Watchlists CASCADE;
DROP TABLE IF EXISTS Subscriptions CASCADE;
DROP TABLE IF EXISTS Notifications CASCADE;

-- Créer les types ENUM
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE profile_status AS ENUM ('active', 'inactive');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'pending');
CREATE TYPE notification_status AS ENUM ('sent', 'pending');

-- Créer les tables
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name VARCHAR(255),
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status user_status DEFAULT 'active',
    role user_role DEFAULT 'user'
);

CREATE TABLE Profiles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    amount DECIMAL(6,2),
    payment_date TIMESTAMP,
    status profile_status
);

CREATE TABLE Devices (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    last_active TIMESTAMP
);

CREATE TABLE Payments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    amount DECIMAL(6,2),
    payment_date TIMESTAMP,
    status payment_status
);

CREATE TABLE Genres (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    genre_name VARCHAR(255)
);

CREATE TABLE Movies (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    release_year INTEGER,
    last_active TIMESTAMP
);

CREATE TABLE Series (
    id SERIAL PRIMARY KEY,
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    release_year INTEGER,
    release_year INTEGER,
    rating DECIMAL(2,1),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE Episodes (
    id SERIAL PRIMARY KEY,
    series_id INT REFERENCES Series(id) ON DELETE CASCADE,
    season INT,
    episode INT,
    title VARCHAR(255),
    duration INT,
    release_date DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE Watch_History (
    id SERIAL PRIMARY KEY,
    profile_id INT REFERENCES Profiles(id) ON DELETE CASCADE,
    content_id INT,
    watched_at TIMESTAMP,
    progress INT
);

CREATE TABLE Watchlists (
    id SERIAL PRIMARY KEY,
    profile_id INT REFERENCES Profiles(id) ON DELETE CASCADE,
    content_id INT,
    added_at TIMESTAMP
);

CREATE TABLE Subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    plan VARCHAR(50),
    price DECIMAL(6,2),
    status subscription_status,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE Notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    message TEXT,
    status notification_status,
    sent_at TIMESTAMP
);
-- Insertion d'un compte admin
INSERT INTO Users (email, password, full_name, role)
VALUES ('admin@example.com', '$2b$10$qxqMRCkBr5ATk1E7vbkp9uVSDY7xmWoCrwSPclG.BlYZkrUx9FfrW', 'Administrateur', 'admin');
-- Mot de passe : 123