-- Supprimer les anciens types si ils existent
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS profile_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS notification_status CASCADE;

-- Supprimer les anciennes tables si elles existent
DROP TABLE IF EXISTS Watch_History CASCADE;
DROP TABLE IF EXISTS Watchlists CASCADE;
DROP TABLE IF EXISTS Episodes CASCADE;
DROP TABLE IF EXISTS Series CASCADE;
DROP TABLE IF EXISTS Movies CASCADE;
DROP TABLE IF EXISTS Genres CASCADE;
DROP TABLE IF EXISTS Notifications CASCADE;
DROP TABLE IF EXISTS Subscriptions CASCADE;
DROP TABLE IF EXISTS Payments CASCADE;
DROP TABLE IF EXISTS Devices CASCADE;
DROP TABLE IF EXISTS Profiles CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

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
    name VARCHAR(100),
    status profile_status DEFAULT 'active'
);

CREATE TABLE Devices (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Payments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    amount DECIMAL(6,2),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status payment_status
);

CREATE TABLE Subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    plan VARCHAR(50),
    price DECIMAL(6,2),
    status subscription_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    message TEXT,
    status notification_status DEFAULT 'pending',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Genres (
    id SERIAL PRIMARY KEY,
    genre_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE Movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    release_year INTEGER,
    genre_id INT REFERENCES Genres(id) ON DELETE SET NULL,
    image_url VARCHAR(255),  -- Ajouter le champ image_url pour les films
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Series (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    release_year INTEGER,
    rating DECIMAL(2,1),
    genre_id INT REFERENCES Genres(id) ON DELETE SET NULL,
    image_url VARCHAR(255),  -- Ajouter le champ image_url pour les séries
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Episodes (
    id SERIAL PRIMARY KEY,
    series_id INT REFERENCES Series(id) ON DELETE CASCADE,
    season INT NOT NULL,
    episode INT NOT NULL,
    title VARCHAR(255),
    duration INT,
    release_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Watch_History (
    id SERIAL PRIMARY KEY,
    profile_id INT REFERENCES Profiles(id) ON DELETE CASCADE,
    content_id INT NOT NULL,
    content_type VARCHAR(50) CHECK (content_type IN ('movie', 'series')),
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INT
);

CREATE TABLE Watchlists (
    id SERIAL PRIMARY KEY,
    profile_id INT REFERENCES Profiles(id) ON DELETE CASCADE,
    content_id INT NOT NULL,
    content_type VARCHAR(50) CHECK (content_type IN ('movie', 'series')),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la fonction trigger pour ajouter un abonnement par défaut lors de la création d'un utilisateur
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO Subscriptions (user_id, plan, price, status) 
    VALUES (NEW.id, 'free trial', 0, 'active');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger après insertion d'un utilisateur
DROP TRIGGER IF EXISTS create_subscription_after_user_insert ON Users;
CREATE TRIGGER create_subscription_after_user_insert
AFTER INSERT ON Users
FOR EACH ROW
EXECUTE FUNCTION create_default_subscription();

-- Fonction pour limiter le nombre de profils par utilisateur à 3
CREATE OR REPLACE FUNCTION limit_profiles_per_user()
RETURNS TRIGGER AS $$
DECLARE
    profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM Profiles WHERE user_id = NEW.user_id;
    IF profile_count >= 2 THEN
         RAISE EXCEPTION 'Un utilisateur ne peut créer que 2 profiles maximum';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour appliquer la limite lors d'une insertion dans Profiles
DROP TRIGGER IF EXISTS limit_profiles_trigger ON Profiles;
CREATE TRIGGER limit_profiles_trigger
BEFORE INSERT ON Profiles
FOR EACH ROW
EXECUTE FUNCTION limit_profiles_per_user();

-- Insertion d'un compte admin
INSERT INTO Users (email, password, full_name, role)
VALUES ('admin@example.com', '$2b$10$qxqMRCkBr5ATk1E7vbkp9uVSDY7xmWoCrwSPclG.BlYZkrUx9FfrW', 'Administrateur', 'admin');

-- Ajout de genres
INSERT INTO Genres (genre_name) VALUES 
('Action'), 
('Comédie'), 
('Drame'), 
('Science-fiction'), 
('Horreur');

-- Ajout de films avec image_url
INSERT INTO Movies (title, description, release_year, genre_id, image_url) VALUES 
('Inception', 'Un voleur qui manipule les rêves doit accomplir une mission impossible.', 2010, 4, 'https://example.com/images/inception.jpg'), 
('The Dark Knight', 'Batman affronte le Joker à Gotham City.', 2008, 1, 'https://example.com/images/dark_knight.jpg'), 
('Interstellar', 'Un voyage spatial pour sauver l''humanité.', 2014, 4, 'https://example.com/images/interstellar.jpg'), 
('Parasite', 'Une famille pauvre infiltre une famille riche.', 2019, 3, 'https://example.com/images/parasite.jpg');

-- Ajout de séries avec image_url
INSERT INTO Series (title, description, release_year, rating, genre_id, image_url) VALUES 
('Breaking Bad', 'Un professeur de chimie devient un baron de la drogue.', 2008, 9.5, 3, 'https://example.com/images/breaking_bad.jpg'), 
('Stranger Things', 'Un groupe d''enfants découvre des phénomènes paranormaux.', 2016, 8.7, 4, 'https://example.com/images/stranger_things.jpg'), 
('Game of Thrones', 'Lutte pour le trône de fer dans un royaume fantastique.', 2011, 9.3, 3, 'https://example.com/images/game_of_thrones.jpg');

-- Ajout d'épisodes
INSERT INTO Episodes (series_id, season, episode, title, duration, release_date) VALUES 
(1, 1, 1, 'Pilot', 58, '2008-01-20'),
(2, 1, 1, 'Chapter One: The Vanishing of Will Byers', 47, '2016-07-15'),
(3, 1, 1, 'Winter Is Coming', 62, '2011-04-17');