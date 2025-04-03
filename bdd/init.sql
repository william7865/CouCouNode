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
DROP TABLE IF EXISTS Movies CASCADE;
DROP TABLE IF EXISTS Genres CASCADE;
DROP TABLE IF EXISTS Notifications CASCADE;
DROP TABLE IF EXISTS Subscriptions CASCADE;
DROP TABLE IF EXISTS Payments CASCADE;
DROP TABLE IF EXISTS Devices CASCADE;
DROP TABLE IF EXISTS Profiles CASCADE;
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS series_categories CASCADE;
DROP TABLE IF EXISTS episodes CASCADE;
DROP TABLE IF EXISTS series CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

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
    user_id INT REFERENCES Users(id) ON DELETE SET NULL,
    genre_id INT REFERENCES Genres(id) ON DELETE SET NULL,
    image_url VARCHAR(255),
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE series (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    detailed_description TEXT,
    release_year INTEGER,
    rating VARCHAR(10),
    genres VARCHAR(255)[],
    actors VARCHAR(255)[],
    seasons INTEGER,
    episode_count INTEGER,
    themes TEXT,
    moods VARCHAR(255)[],
    image_url VARCHAR(255),
    banner_url VARCHAR(255),
    trailer_url VARCHAR(255),
    duration VARCHAR(50),
    creator VARCHAR(255),
    is_featured BOOLEAN DEFAULT false,
    is_netflix_original BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE episodes (
    id SERIAL PRIMARY KEY,
    serie_id INTEGER REFERENCES series(id),
    season_number INTEGER NOT NULL,
    episode_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration VARCHAR(50),
    release_date DATE,
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE series_categories (
    serie_id INTEGER REFERENCES series(id),
    category_id INTEGER REFERENCES categories(id),
    PRIMARY KEY (serie_id, category_id)
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

-- trigger pour ajouter un abonnement par défaut lors de la création d'un utilisateur
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO Subscriptions (user_id, plan, price, status) 
    VALUES (NEW.id, 'free trial', 0, 'active');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trigger après insertion d'un utilisateur
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



-- Insertion des catégories
INSERT INTO categories (id, name, display_name) VALUES 
(1, 'Action', 'Action'),
(2, 'Drame', 'Drame'),
(3, 'Policier', 'Policier'),
(4, 'Comédie', 'Comédie'),
(5, 'Classiques', 'Séries Cultes');

------------------
-- SÉRIES ACTION --
------------------

-- 1. Prison Break
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, is_featured, is_netflix_original
) VALUES (
    'Prison Break',
    'Un homme fait évader son frère, condamné à mort pour un crime qu''il n''a pas commis.',
    'Michael Scofield se fait incarcérer dans le pénitencier d''État de Fox River pour aider son frère Lincoln, condamné à mort, à s''évader.',
    2005, '16+', ARRAY['Thriller', 'Drame'],
    ARRAY['Wentworth Miller', 'Dominic Purcell', 'Sarah Wayne Callies', 'Robert Knepper'],
    5, 90, 'Évasion, Fraternité, Conspiration', ARRAY['Tendu', 'Haletant'],
    '/images/prison-break.jpg', '/images/prison-break-banner.jpg',
    'https://youtu.be/AL9zLctDJaU', '45m', 'Paul Scheuring', true, false
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(1, 1, 1, 'La Grande Évasion (1ère partie)', 'Michael se fait incarcérer.', '45m'),
(1, 1, 2, 'La Grande Évasion (2ème partie)', 'Plan d''évasion commence.', '45m'),
(1, 1, 3, 'Test en cellule', 'Manipulation de Sucre.', '45m'),
(1, 1, 4, 'Poison mortel', 'Nouveaux membres rejoignent.', '45m'),
(1, 1, 5, 'Le Choix du gardien', 'Premiers obstacles.', '45m');

-- 2. The Witcher
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, is_netflix_original
) VALUES (
    'The Witcher',
    'Un chasseur de monstres mutant parcourt un monde dangereux.',
    'Geralt de Riv, un chasseur de monstres, navigue dans un monde corrompu.',
    2019, '16+', ARRAY['Action', 'Fantasy'],
    ARRAY['Henry Cavill', 'Anya Chalotra', 'Freya Allan', 'Joey Batey'],
    3, 24, 'Destin, Monstres, Magie', ARRAY['Sombre', 'Épique'],
    '/images/witcher.jpg', '/images/witcher-banner.jpg',
    'https://youtu.be/ndl1W4ltcmg', '60m', 'Lauren Schmidt Hissrich', true
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(2, 1, 1, 'Le Commencement de la fin', 'Mission cruciale.', '60m'),
(2, 1, 2, 'Les Quatre Marques', 'Rencontre Yennefer.', '60m'),
(2, 1, 3, 'Trahison lunaire', 'Conflit politique.', '60m'),
(2, 1, 4, 'Banquets, bâtards et funérailles', 'Intrigues à la cour.', '60m'),
(2, 1, 5, 'Désirs inassouvis', 'Chasse monstre.', '60m');

-- 3. The Punisher
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, is_netflix_original
) VALUES (
    'The Punisher',
    'Un ancien Marine venge sa famille assassinée.',
    'Frank Castle devient un justicier violent après le meurtre de sa famille.',
    2017, '18+', ARRAY['Action', 'Thriller'],
    ARRAY['Jon Bernthal', 'Ben Barnes', 'Amber Rose Revah', 'Ebon Moss-Bachrach'],
    2, 26, 'Vengeance, Justice', ARRAY['Sombre', 'Violent'],
    '/images/punisher.jpg', '/images/punisher-banner.jpg',
    'https://youtu.be/HwZ5e2GY-3Y', '55m', 'Steve Lightfoot', true
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(3, 1, 1, '3 heures du matin', 'Frank reprend sa guerre.', '55m'),
(3, 1, 2, 'Deux hommes morts', 'Enquête sur complot.', '55m'),
(3, 1, 3, 'Kandahar', 'Flashback militaire.', '55m'),
(3, 1, 4, 'Réserviste', 'Approche de la vérité.', '55m'),
(3, 1, 5, 'Gunner', 'Affrontement ancien collègue.', '55m');

-- 4. Arrow
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Arrow',
    'Un milliardaire devient justicier masqué.',
    'Oliver Queen revient après 5 ans disparu pour devenir un justicier.',
    2012, '12+', ARRAY['Action', 'Super-héros'],
    ARRAY['Stephen Amell', 'Katie Cassidy', 'David Ramsey', 'Emily Bett Rickards'],
    8, 170, 'Justice, Rédemption', ARRAY['Action', 'Dramatique'],
    '/images/arrow.jpg', '/images/arrow-banner.jpg',
    'https://youtu.be/XQS7JkQmlx8', '45m', 'Greg Berlanti'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(4, 1, 1, 'Le Justicier', 'Retour à Starling City.', '45m'),
(4, 1, 2, 'Cible honorée', 'Traque corruption.', '45m'),
(4, 1, 3, 'Lone Gunman', 'Combat tueur à gages.', '45m'),
(4, 1, 4, 'Un innocent', 'Aide accusé.', '45m'),
(4, 1, 5, 'Traqué', 'Poursuite police.', '45m');

-- 5. La Casa de Papel
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, is_netflix_original
) VALUES (
    'La Casa de Papel',
    'Braquage audacieux de la Monnaie espagnole.',
    'Huit voleurs prennent en otages le personnel de la Monnaie royale.',
    2017, '16+', ARRAY['Action', 'Thriller'],
    ARRAY['Úrsula Corberó', 'Álvaro Morte', 'Itziar Ituño', 'Pedro Alonso'],
    5, 41, 'Crime, Résistance', ARRAY['Tendu', 'Haletant'],
    '/images/money-heist.jpg', '/images/money-heist-banner.jpg',
    'https://youtu.be/3y-6iaveY6c', '45m', 'Álex Pina', true
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(5, 1, 1, 'Exécuter le plan', 'Début du braquage.', '45m'),
(5, 1, 2, 'Imprudences', 'Prise d''otages.', '45m'),
(5, 1, 3, 'L''Effet placebo', 'Négociations.', '45m'),
(5, 1, 4, 'Chien de garde', 'Tensions internes.', '45m'),
(5, 1, 5, 'Le Jour de la marmotte', 'Retournement.', '45m');

-- 6. Vikings
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Vikings',
    'Aventures de Ragnar Lothbrok et ses guerriers.',
    'Ragnar Lothbrok mène des raids vikings en Angleterre.',
    2013, '16+', ARRAY['Action', 'Historique'],
    ARRAY['Travis Fimmel', 'Katheryn Winnick', 'Clive Standen', 'Gustaf Skarsgård'],
    6, 89, 'Aventure, Pouvoir', ARRAY['Épique', 'Violent'],
    '/images/vikings.jpg', '/images/vikings-banner.jpg',
    'https://youtu.be/1j2sXLbzm9U', '45m', 'Michael Hirst'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(6, 1, 1, 'Rite de passage', 'Ragnar défie les règles.', '45m'),
(6, 1, 2, 'La Colère des Northmen', 'Premier raid.', '45m'),
(6, 1, 3, 'Dépossédé', 'Retour en Angleterre.', '45m'),
(6, 1, 4, 'Procès', 'Jugement pour désobéissance.', '45m'),
(6, 1, 5, 'Raid', 'Attaque monastère.', '45m');

-----------------
-- SÉRIES DRAME --
-----------------

-- 7. Squid Game
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, is_netflix_original
) VALUES (
    'Squid Game',
    'Jeux mortels pour endettés désespérés.',
    '456 personnes jouent à des jeux d''enfants avec des enjeux mortels.',
    2021, '16+', ARRAY['Drame', 'Survival'],
    ARRAY['Lee Jung-jae', 'Jung Ho-yeon', 'Park Hae-soo', 'Wi Ha-joon'],
    1, 9, 'Survie, Argent', ARRAY['Tendu', 'Violent'],
    '/images/squid-game.jpg', '/images/squid-game-banner.jpg',
    'https://youtu.be/oqxAJKy0ii4', '55m', 'Hwang Dong-hyuk', true
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(7, 1, 1, 'Lumière rouge, lumière verte', 'Jeu 1,2,3 soleil mortel.', '55m'),
(7, 1, 2, 'Enfer', 'Découverte des règles.', '55m'),
(7, 1, 3, 'L''homme avec le parapluie', 'Nouveau jeu annoncé.', '55m'),
(7, 1, 4, 'Faire équipe', 'Formation d''alliances.', '55m'),
(7, 1, 5, 'Un monde juste', 'Tensions croissantes.', '55m');

-- 8. This Is Us
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'This Is Us',
    'Histoire émouvante de la famille Pearson.',
    'Suivi des membres de la famille Pearson à différentes époques.',
    2016, '12+', ARRAY['Drame', 'Familial'],
    ARRAY['Milo Ventimiglia', 'Mandy Moore', 'Sterling K. Brown', 'Chrissy Metz'],
    6, 106, 'Famille, Amour', ARRAY['Émotionnel', 'Inspirant'],
    '/images/this-is-us.jpg', '/images/this-is-us-banner.jpg',
    'https://youtu.be/1XatfYJU3N8', '45m', 'Dan Fogelman'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(8, 1, 1, 'Nous trois', 'Vies entrelacées révélées.', '45m'),
(8, 1, 2, 'Les Triplés', 'Anniversaire des triplets.', '45m'),
(8, 1, 3, 'Kyle', 'Tragédie familiale.', '45m'),
(8, 1, 4, 'La Piscine', 'Souvenirs d''enfance.', '45m'),
(8, 1, 5, 'Le Plan de jeu', 'Père et fils se rapprochent.', '45m');

-- 9. The Walking Dead
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, is_netflix_original
) VALUES (
    'The Walking Dead',
    'Survie dans un monde zombie.',
    'Rick Grimes se réveille dans un monde apocalyptique.',
    2010, '18+', ARRAY['Drame', 'Horreur'],
    ARRAY['Andrew Lincoln', 'Norman Reedus', 'Danai Gurira', 'Melissa McBride'],
    11, 177, 'Survie, Humanité', ARRAY['Sombre', 'Violent'],
    '/images/walking-dead.jpg', '/images/walking-dead-banner.jpg',
    'https://youtu.be/R1v0uFms68U', '45m', 'Frank Darabont', true
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(9, 1, 1, 'Jours passés', 'Réveil dans l''apocalypse.', '67m'),
(9, 1, 2, 'Tripes', 'Survie à Atlanta.', '44m'),
(9, 1, 3, 'Dis-le aux grenouilles', 'Retour au camp.', '44m'),
(9, 1, 4, 'Vatos', 'Rencontre inattendue.', '44m'),
(9, 1, 5, 'Feu sauvage', 'Décision cruciale.', '44m');

-- 10. Power
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Power',
    'Double vie d''un baron de la drogue.',
    'James "Ghost" St. Patrick tente de quitter le crime.',
    2014, '18+', ARRAY['Drame', 'Crime'],
    ARRAY['Omari Hardwick', 'Lela Loren', 'Naturi Naughton', 'Joseph Sikora'],
    6, 63, 'Crime, Rédemption', ARRAY['Tendu', 'Dramatique'],
    '/images/power.jpg', '/images/power-banner.jpg',
    'https://youtu.be/JxWfvtnHtS0', '50m', 'Courtney Kemp'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(10, 1, 1, 'Pas si différent', 'Équilibre double vie.', '50m'),
(10, 1, 2, 'Qui tu es', 'Rapprochement procureure.', '50m'),
(10, 1, 3, 'C''est compliqué', 'Protection empire criminel.', '50m'),
(10, 1, 4, 'Qui veux-tu être ?', 'Problèmes s''aggravent.', '50m'),
(10, 1, 5, 'J''ai menti', 'Décision risquée.', '50m');

-- 11. The Crown
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, is_netflix_original
) VALUES (
    'The Crown',
    'Règne de la reine Elizabeth II.',
    'Histoire de la monarchie britannique moderne.',
    2016, '16+', ARRAY['Drame', 'Historique'],
    ARRAY['Claire Foy', 'Olivia Colman', 'Matt Smith', 'Tobias Menzies'],
    5, 50, 'Pouvoir, Devoir', ARRAY['Sérieux', 'Émotionnel'],
    '/images/the-crown.jpg', '/images/the-crown-banner.jpg',
    'https://youtu.be/JWtnJjn6ng0', '60m', 'Peter Morgan', true
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(11, 1, 1, 'Wolferton Splash', 'Mort du roi George VI.', '60m'),
(11, 1, 2, 'Hyde Park Corner', 'Accession au trône.', '60m'),
(11, 1, 3, 'Windsor', 'Installation au château.', '60m'),
(11, 1, 4, 'Act of God', 'Brouillard toxique à Londres.', '60m'),
(11, 1, 5, 'Smoke and Mirrors', 'Préparation couronnement.', '60m');

--------------------
-- SÉRIES POLICIER --
--------------------

-- 12. SWAT
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'SWAT',
    'Unité d''élite de la police de Los Angeles.',
    'Daniel "Hondo" Harrelson dirige une unité SWAT.',
    2017, '16+', ARRAY['Policier', 'Action'],
    ARRAY['Shemar Moore', 'Stephanie Sigman', 'Alex Russell', 'Jay Harrington'],
    6, 100, 'Justice, Équipe', ARRAY['Action', 'Tendu'],
    '/images/swat.jpg', '/images/swat-banner.jpg',
    'https://youtu.be/B3Kq4A7nT64', '45m', 'Aaron Rahsaan Thomas'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(12, 1, 1, 'Nouveau Commandant', 'Hondo prend la tête du SWAT.', '45m'),
(12, 1, 2, 'Cuchillo', 'Traque criminel dangereux.', '45m'),
(12, 1, 3, 'Pamilya', 'Protection famille en danger.', '45m'),
(12, 1, 4, 'Radical', 'Lutte contre extrémistes.', '45m'),
(12, 1, 5, 'Imposters', 'Braquage de banque.', '45m');

-- 13. Luther
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Luther',
    'Inspecteur brillant mais tourmenté.',
    'John Luther résout des affaires horribles à Londres.',
    2010, '16+', ARRAY['Policier', 'Thriller'],
    ARRAY['Idris Elba', 'Ruth Wilson', 'Dermot Crowley', 'Michael Smiley'],
    5, 20, 'Crime, Psychologie', ARRAY['Sombre', 'Tendu'],
    '/images/luther.jpg', '/images/luther-banner.jpg',
    'https://youtu.be/zM0EP7xq-5U', '60m', 'Neil Cross'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(13, 1, 1, 'Premier Cas', 'Enquête sur tueur en série.', '60m'),
(13, 1, 2, 'Tueur d''enfants', 'Traque criminel pédophile.', '60m'),
(13, 1, 3, 'Alice Morgan', 'Rencontre troublante.', '60m'),
(13, 1, 4, 'Accusé', 'Luther suspecté de crime.', '60m'),
(13, 1, 5, 'Affrontement', 'Confrontation finale.', '60m');

-- 14. The Shield
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'The Shield',
    'Unité policière controversée à Los Angeles.',
    'Vic Mackey utilise des méthodes illégales pour combattre le crime.',
    2002, '18+', ARRAY['Policier', 'Thriller'],
    ARRAY['Michael Chiklis', 'Walton Goggins', 'CCH Pounder', 'Jay Karnes'],
    7, 88, 'Corruption, Justice', ARRAY['Brutal', 'Réaliste'],
    '/images/shield.jpg', '/images/shield-banner.jpg',
    'https://youtu.be/G3q07FZQKf8', '45m', 'Shawn Ryan'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(14, 1, 1, 'Nouvelle Équipe', 'Vic Mackey forme son unité.', '45m'),
(14, 1, 2, 'Our Gang', 'Trafic de drogue.', '45m'),
(14, 1, 3, 'The Spread', 'Épidémie MST lycée.', '45m'),
(14, 1, 4, 'Dawg Days', 'Manipulation informateur.', '45m'),
(14, 1, 5, 'Blowback', 'Conséquences passées.', '45m');

-- 15. Chicago PD
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Chicago Police Department',
    'Policiers du district 21 de Chicago.',
    'Unité d''intelligence combat le crime organisé.',
    2014, '16+', ARRAY['Policier', 'Drame'],
    ARRAY['Jason Beghe', 'Sophia Bush', 'Jesse Lee Soffer', 'Marina Squerciati'],
    10, 188, 'Crime, Loyauté', ARRAY['Intense', 'Dramatique'],
    '/images/chicago-pd.jpg', '/images/chicago-pd-banner.jpg',
    'https://youtu.be/oXw4W-9Lw0Y', '45m', 'Dick Wolf'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(15, 1, 1, 'Première Mission', 'Voight traque un tueur.', '45m'),
(15, 1, 2, 'Déshonneur', 'Enquête meurtre policier.', '45m'),
(15, 1, 3, 'Chin Check', 'Informateur en danger.', '45m'),
(15, 1, 4, 'Prise d''otage', 'Membre d''équipe capturé.', '45m'),
(15, 1, 5, 'Tuer le messager', 'Trafiquant d''armes.', '45m');

-- 16. The Wire
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'The Wire',
    'Police et trafiquants à Baltimore.',
    'Exploration réaliste du trafic de drogue.',
    2002, '16+', ARRAY['Policier', 'Drame'],
    ARRAY['Dominic West', 'Idris Elba', 'Michael K. Williams', 'Lance Reddick'],
    5, 60, 'Crime, Société', ARRAY['Réaliste', 'Complexe'],
    '/images/wire.jpg', '/images/wire-banner.jpg',
    'https://youtu.be/9qK-VGjMr8g', '60m', 'David Simon'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(16, 1, 1, 'La Cible', 'McNulty enquête sur Barksdale.', '60m'),
(16, 1, 2, 'L''Équipe', 'Formation unité spéciale.', '60m'),
(16, 1, 3, 'Les Achats', 'Surveillance transactions.', '60m'),
(16, 1, 4, 'Vieux Dossiers', 'Résolution cold case.', '60m'),
(16, 1, 5, 'Le Pager', 'Surveillance électronique.', '60m');

------------------
-- SÉRIES COMÉDIE --
------------------

-- 17. Friends
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Friends',
    'Péripéties de six amis new-yorkais.',
    'Vies personnelles et professionnelles de six amis trentenaires.',
    1994, '12+', ARRAY['Comédie', 'Romance'],
    ARRAY['Jennifer Aniston', 'Courteney Cox', 'Lisa Kudrow', 'Matt LeBlanc', 'Matthew Perry', 'David Schwimmer'],
    10, 236, 'Amitié, Amour', ARRAY['Drôle', 'Léger'],
    '/images/friends.jpg', '/images/friends-banner.jpg',
    'https://youtu.be/IEEbUzffzrk', '25m', 'David Crane, Marta Kauffman'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(17, 1, 1, 'Celui où tout commence', 'Rachel rejoint le groupe.', '25m'),
(17, 1, 2, 'Celui avec l''échographie', 'Soutien à Rachel.', '25m'),
(17, 1, 3, 'Celui avec le pouce', 'Chandler fume à nouveau.', '25m'),
(17, 1, 4, 'Celui avec George Stephanopoulos', 'Match de hockey.', '25m'),
(17, 1, 5, 'Celui avec les lasagnes', 'Rachel cuisine.', '25m');

-- 18. Ma famille d'abord
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Ma famille d''abord',
    'Vie d''une famille afro-américaine.',
    'Michael Kyle élève sa famille avec humour.',
    2001, '10+', ARRAY['Comédie', 'Familial'],
    ARRAY['Damon Wayans', 'Tisha Campbell', 'George O. Gore II', 'Jennifer Freeman'],
    5, 123, 'Famille, Humour', ARRAY['Drôle', 'Chaleureux'],
    '/images/my-wife-and-kids.jpg', '/images/my-wife-and-kids-banner.jpg',
    'https://youtu.be/9Qj3YV4y5Dk', '25m', 'Damon Wayans'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(18, 1, 1, 'Nouvelle Discipline', 'Michael impose ses règles.', '25m'),
(18, 1, 2, 'Premier Amour', 'Claire a un petit ami.', '25m'),
(18, 1, 3, 'La Voiture', 'Junior veut une voiture.', '25m'),
(18, 1, 4, 'Dîner d''affaires', 'Michael impressionne client.', '25m'),
(18, 1, 5, 'Baby-sitter', 'Test nouvelle nounou.', '25m');

-- 19. Le Prince de Bel-Air
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Le Prince de Bel-Air',
    'Adolescent pauvre chez sa riche famille.',
    'Will Smith quitte Philadelphie pour Bel-Air.',
    1990, '10+', ARRAY['Comédie', 'Familial'],
    ARRAY['Will Smith', 'James Avery', 'Alfonso Ribeiro', 'Tatyana Ali'],
    6, 148, 'Famille, Culture', ARRAY['Drôle', 'Nostalgique'],
    '/images/fresh-prince.jpg', '/images/fresh-prince-banner.jpg',
    'https://youtu.be/1nCqRmx3Dnw', '25m', 'Andy Borowitz, Susan Borowitz'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(19, 1, 1, 'L''Arrivée', 'Will débarque à Bel-Air.', '25m'),
(19, 1, 2, 'Bang the Drum, Ashley', 'Aide aux devoirs.', '25m'),
(19, 1, 3, 'Club de gym', 'Adhésion club select.', '25m'),
(19, 1, 4, 'Héros local', 'Sauvetage de Carlton.', '25m'),
(19, 1, 5, 'Who''s the Boss?', 'Conflit pour un job.', '25m');

-- 20. Brooklyn Nine-Nine
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Brooklyn Nine-Nine',
    'Policiers d''un commissariat de Brooklyn.',
    'Jake Peralta s''adapte à un nouveau capitaine strict.',
    2013, '12+', ARRAY['Comédie', 'Policier'],
    ARRAY['Andy Samberg', 'Terry Crews', 'Melissa Fumero', 'Stephanie Beatriz'],
    8, 153, 'Policier, Humour', ARRAY['Drôle', 'Léger'],
    '/images/brooklyn99.jpg', '/images/brooklyn99-banner.jpg',
    'https://youtu.be/sEOuJ4z5aTc', '25m', 'Dan Goor, Michael Schur'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(20, 1, 1, 'Nouveau Capitaine', 'Arrivée de Holt.', '25m'),
(20, 1, 2, 'The Tagger', 'Enquête sur taggeur.', '25m'),
(20, 1, 3, 'The Slump', 'Mauvaise passe professionnelle.', '25m'),
(20, 1, 4, 'M.E. Time', 'Jalousie amoureuse.', '25m'),
(20, 1, 5, 'The Vulture', 'Détective vedette.', '25m');

-- 21. Malcolm
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Malcolm',
    'Jeune surdoué dans une famille dysfonctionnelle.',
    'Malcolm navigue avec sa famille excentrique.',
    2000, '10+', ARRAY['Comédie', 'Familial'],
    ARRAY['Frankie Muniz', 'Jane Kaczmarek', 'Bryan Cranston', 'Christopher Masterson'],
    7, 151, 'Famille, Intelligence', ARRAY['Drôle', 'Tendre'],
    '/images/malcolm.jpg', '/images/malcolm-banner.jpg',
    'https://youtu.be/YJ0q0q3FZxY', '25m', 'Linwood Boomer'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(21, 1, 1, 'Je ne suis pas un monstre', 'Malcolm découvre qu''il est surdoué et intègre une classe spéciale.', '25m'),
(21, 1, 2, 'La Robe rouge', 'Lois cherche le coupable d''un accident impliquant sa robe rouge.', '25m'),
(21, 1, 3, 'Mauvaise conduite', 'Hal tente de prouver qu''il n''est pas un mauvais conducteur.', '25m'),
(21, 1, 4, 'Le Vieil Ami', 'Un ancien camarade de Hal refait surface.', '25m'),
(21, 1, 5, 'Soirée pyjama', 'Malcolm se rend à une soirée pyjama qui tourne mal.', '25m');

-- 22. Breaking Bad (Classiques)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Breaking Bad',
    'Un professeur de chimie devient baron de la drogue après un diagnostic de cancer.',
    'Walter White, professeur de chimie, se lance dans la fabrication de méthamphétamine après un diagnostic de cancer.',
    2008, '16+', ARRAY['Drame', 'Crime'],
    ARRAY['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'Dean Norris'],
    5, 62, 'Transformation, Pouvoir, Conséquences', ARRAY['Tendu', 'Sombre'],
    '/images/breaking-bad.jpg', '/images/breaking-bad-banner.jpg',
    'https://youtu.be/HhesaQXLuRY', '45m', 'Vince Gilligan'
);

-- Épisodes Breaking Bad (Saison 1)
INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(22, 1, 1, 'Chute libre', 'Walter White reçoit un diagnostic de cancer et prend une décision radicale.', '58m'),
(22, 1, 2, 'Le Sac est dans le sac', 'Walter et Jesse tentent de se débarrasser de deux corps encombrants.', '48m'),
(22, 1, 3, 'Et le sac est dans la rivière', 'Walter doit prendre une décision difficile concernant Krazy-8.', '48m'),
(22, 1, 4, 'L''homme du cancer', 'Walter révèle son cancer à sa famille et Skyler cherche des solutions.', '48m'),
(22, 1, 5, 'Matière grise', 'Walter refuse l''aide financière de ses anciens associés.', '48m');

-- 23. Game of Thrones (Classiques)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Game of Thrones',
    'Conflits sanglants pour le trône de fer dans les Sept Royaumes.',
    'Plusieurs familles nobles se disputent le contrôle du Trône de Fer des Sept Couronnes.',
    2011, '16+', ARRAY['Fantasy', 'Drame'],
    ARRAY['Kit Harington', 'Emilia Clarke', 'Peter Dinklage', 'Lena Headey'],
    8, 73, 'Pouvoir, Trahison, Guerre', ARRAY['Épique', 'Violent'],
    '/images/got.jpg', '/images/got-banner.jpg',
    'https://youtu.be/KPLWWIOCOOQ', '55m', 'David Benioff, D.B. Weiss'
);

-- Épisodes Game of Thrones (Saison 1)
INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(23, 1, 1, 'L''hiver vient', 'Lord Stark devient la Main du Roi.', '55m'),
(23, 1, 2, 'La Route royale', 'La famille Stark se rend à Port-Réal.', '55m'),
(23, 1, 3, 'Lord Snow', 'Jon Snow rejoint la Garde de Nuit.', '55m'),
(23, 1, 4, 'Infirmes, Bâtards et Choses brisées', 'Tyrion se rend au Mur.', '55m'),
(23, 1, 5, 'Le Loup et le Lion', 'Ned enquête sur la mort de Jon Arryn.', '55m');

-- 24. Peaky Blinders (Classiques)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Peaky Blinders',
    'Un gang familial règne sur Birmingham dans l''Angleterre des années 1920.',
    'La série suit la famille Shelby, une redoutable organisation criminelle dans l''Angleterre de l''après-Première Guerre mondiale.',
    2013, '16+', ARRAY['Drame', 'Crime'],
    ARRAY['Cillian Murphy', 'Paul Anderson', 'Helen McCrory', 'Tom Hardy'],
    6, 36, 'Pouvoir, Famille, Crime', ARRAY['Sombre', 'Violent'],
    '/images/peaky-blinders.jpg', '/images/peaky-blinders-banner.jpg',
    'https://youtu.be/oVzVdvGIC7U', '55m', 'Steven Knight'
);

-- Épisodes Peaky Blinders (Saison 1)
INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(24, 1, 1, 'Épisode 1', 'Thomas Shelby planifie l''expansion de son empire criminel.', '55m'),
(24, 1, 2, 'Épisode 2', 'Les Shelby affrontent un nouveau rival.', '55m'),
(24, 1, 3, 'Épisode 3', 'Thomas négocie avec des officiels corrompus.', '55m'),
(24, 1, 4, 'Épisode 4', 'Un inspecteur de police se rapproche des Shelby.', '55m'),
(24, 1, 5, 'Épisode 5', 'La famille Shelby est menacée de toutes parts.', '55m');

-- 25. The Sopranos (Classiques)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'The Sopranos',
    'La vie d''un patron de la mafia new-jerseyaise qui consulte un psychiatre.',
    'Tony Soprano, un boss de la mafia du New Jersey, lutte pour équilibrer sa vie criminelle et ses problèmes personnels.',
    1999, '16+', ARRAY['Drame', 'Crime'],
    ARRAY['James Gandolfini', 'Lorraine Bracco', 'Edie Falco', 'Michael Imperioli'],
    6, 86, 'Mafia, Famille, Psychologie', ARRAY['Sombre', 'Complexe'],
    '/images/sopranos.jpg', '/images/sopranos-banner.jpg',
    'https://youtu.be/1X3A5vRZtGQ', '55m', 'David Chase'
);

-- Épisodes The Sopranos (Saison 1)
INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(25, 1, 1, 'Le Soprano', 'Tony a des crises de panique et commence une thérapie.', '55m'),
(25, 1, 2, '46 Long', 'Tony traite un problème avec un camion de whisky volé.', '55m'),
(25, 1, 3, 'Denial, Anger, Acceptance', 'Christopher commet son premier meurtre.', '55m'),
(25, 1, 4, 'Meadowlands', 'Tony doit gérer un problème avec un associé.', '55m'),
(25, 1, 5, 'College', 'Tony emmène Meadow visiter des universités.', '55m');

-- 26. Lost (Classiques)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Lost',
    'Les survivants d''un crash d''avion se retrouvent sur une île mystérieuse.',
    'Les passagers du vol Oceanic 815 survivent à un crash et se retrouvent sur une île apparemment déserte qui recèle de nombreux mystères.',
    2004, '16+', ARRAY['Drame', 'Mystère', 'Aventure'],
    ARRAY['Matthew Fox', 'Evangeline Lilly', 'Josh Holloway', 'Jorge Garcia'],
    6, 121, 'Survie, Mystère, Destin', ARRAY['Mystérieux', 'Haletant'],
    '/images/lost.jpg', '/images/lost-banner.jpg',
    'https://youtu.be/KTu8iDynwNc', '45m', 'J.J. Abrams, Damon Lindelof'
);

-- Épisodes Lost (Saison 1)
INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(26, 1, 1, 'Le Réveil (1ère partie)', 'Le vol Oceanic 815 s''écrase sur une île mystérieuse.', '65m'),
(26, 1, 2, 'Le Réveil (2ème partie)', 'Les survivants explorent l''île et trouvent un message de détresse.', '65m'),
(26, 1, 3, 'La Chasse', 'Jack et Kate poursuivent un mystérieux animal dans la jungle.', '45m'),
(26, 1, 4, 'La Marche funèbre', 'Les survivants organisent des funérailles pour les victimes du crash.', '45m'),
(26, 1, 5, 'La Moustiquaire', 'Claire est attaquée et enlevée par "les Autres".', '45m');

-- Associations série-catégorie
INSERT INTO series_categories (serie_id, category_id) VALUES
-- Action
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1),
-- Drame
(7, 2), (8, 2), (9, 2), (10, 2), (11, 2),
-- Policier
(12, 3), (13, 3), (14, 3), (15, 3), (16, 3),
-- Comédie
(17, 4), (18, 4), (19, 4), (20, 4), (21, 4),
-- Classiques
(22, 5), (23, 5), (24, 5), (25, 5), (26, 5), (1, 5), (9, 5);