CREATE DATABASE streaming_service;
-- Ensuite, connectez-vous avec : \c streaming_service
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
