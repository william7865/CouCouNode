-- Créez la base de données et connectez-vous ensuite via la commande psql : \c streaming_service
CREATE DATABASE streaming_service;
-- Ensuite, connectez-vous avec : \c streaming_service

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name VARCHAR(255),
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user'))
);

CREATE TABLE Profiles (
    id SERIAL PRIMARY KEY,
    user_id INT,
    amount DECIMAL(6,2),
    payment_date TIMESTAMP,
    status TEXT CHECK (status IN ('active', 'inactive')),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Devices (
    id SERIAL PRIMARY KEY,
    user_id INT,
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    last_active TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Payments (
    id SERIAL PRIMARY KEY,
    user_id INT,
    amount DECIMAL(6,2),
    payment_date TIMESTAMP,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Genres (
    id SERIAL PRIMARY KEY,
    user_id INT,
    genre_name VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Movies (
    id SERIAL PRIMARY KEY,
    user_id INT,
    title VARCHAR(255),
    description TEXT,
    release_year INTEGER,
    last_active TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Series (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    release_year INTEGER,
    rating DECIMAL(2,1),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE Episodes (
    id SERIAL PRIMARY KEY,
    series_id INT,
    season INT,
    episode INT,
    title VARCHAR(255),
    duration INT,
    release_date DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (series_id) REFERENCES Series(id) ON DELETE CASCADE
);

CREATE TABLE Watch_History (
    id SERIAL PRIMARY KEY,
    profile_id INT,
    content_id INT,
    watched_at TIMESTAMP,
    progress INT,
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
);

CREATE TABLE Watchlists (
    id SERIAL PRIMARY KEY,
    profile_id INT,
    content_id INT,
    added_at TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
);

CREATE TABLE Subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT,
    plan VARCHAR(50),
    price DECIMAL(6,2),
    status TEXT CHECK (status IN ('active', 'canceled', 'pending')),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Notifications (
    id SERIAL PRIMARY KEY,
    user_id INT,
    message TEXT,
    status TEXT CHECK (status IN ('sent', 'pending')),
    sent_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
-- Insertion d'un compte admin
INSERT INTO Users (email, password, full_name, role)
VALUES ('admin@example.com', '$2b$10$qxqMRCkBr5ATk1E7vbkp9uVSDY7xmWoCrwSPclG.BlYZkrUx9FfrW', 'Administrateur', 'admin');
-- Mot de passe : 123