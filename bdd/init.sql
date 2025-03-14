CREATE DATABASE streaming_service;
USE streaming_service;

CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name VARCHAR(255),
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active',
    role ENUM('admin', 'user') DEFAULT 'user'
);

CREATE TABLE Profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    amount DECIMAL(6,2),
    payment_date DATETIME,
    status ENUM('active', 'inactive'),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    last_active DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    amount DECIMAL(6,2),
    payment_date DATETIME,
    status ENUM('pending', 'completed', 'failed'),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Genres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    genre_name VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255),
    description TEXT,
    release_year YEAR,
    last_active DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Series (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    release_year YEAR,
    rating DECIMAL(2,1),
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE Episodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    series_id INT,
    season INT,
    episode INT,
    title VARCHAR(255),
    duration INT,
    release_date DATE,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (series_id) REFERENCES Series(id) ON DELETE CASCADE
);

CREATE TABLE Watch_History (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT,
    content_id INT,
    watched_at DATETIME,
    progress INT,
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
);

CREATE TABLE Watchlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT,
    content_id INT,
    added_at DATETIME,
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
);

CREATE TABLE Subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    plan VARCHAR(50),
    price DECIMAL(6,2),
    status ENUM('active', 'canceled', 'pending'),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT,
    status ENUM('sent', 'pending'),
    sent_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
