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
    netflix_url VARCHAR(255),
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

-- 1. Prison Break (Netflix)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, is_featured, is_netflix_original, netflix_url
) VALUES (
    'Prison Break',
    'Un homme fait évader son frère, condamné à mort pour un crime qu''il n''a pas commis.',
    'Michael Scofield se fait incarcérer dans le pénitencier d''État de Fox River pour aider son frère Lincoln, condamné à mort, à s''évader.',
    2005, '16+', ARRAY['Thriller', 'Drame'],
    ARRAY['Wentworth Miller', 'Dominic Purcell', 'Sarah Wayne Callies', 'Robert Knepper'],
    5, 90, 'Évasion, Fraternité, Conspiration', ARRAY['Tendu', 'Haletant'],
    '/images/prison-break.jpg', '/images/prison-break-banner.jpg',
    '/videos/prison-break.mp4', '45m', 'Paul Scheuring', true, false,
    'https://www.netflix.com/title/70140425'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration, netflix_url) VALUES
(1, 1, 1, 'La Grande Évasion', 'Michael se fait incarcérer pour mettre en œuvre son plan d''évasion.', '45m', 'https://www.netflix.com/watch/70140425'),
(1, 1, 2, 'Allen', 'Michael recrute Sucre comme allié dans son plan complexe.', '45m', 'https://www.netflix.com/watch/70140426'),
(1, 1, 3, 'Mise à l''épreuve', 'Michael teste les réactions des gardiens et des autres détenus.', '45m', 'https://www.netflix.com/watch/70140427'),
(1, 1, 4, 'Alchimie', 'Un incident met en péril le plan soigneusement élaboré.', '45m', 'https://www.netflix.com/watch/70140428'),
(1, 1, 5, 'Le transfert', 'Le plan d''évasion commence à prendre forme avec des complications.', '45m', 'https://www.netflix.com/watch/70140429');

-- 2. The Witcher (Netflix)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, is_netflix_original, netflix_url
) VALUES (
    'The Witcher',
    'Un chasseur de monstres mutant parcourt un monde dangereux.',
    'Geralt de Riv, un chasseur de monstres, navigue dans un monde corrompu où les humains sont souvent plus mauvais que les créatures qu''il traque.',
    2019, '16+', ARRAY['Action', 'Fantasy'],
    ARRAY['Henry Cavill', 'Anya Chalotra', 'Freya Allan', 'Joey Batey'],
    3, 24, 'Destin, Monstres, Magie', ARRAY['Sombre', 'Épique'],
    '/images/witcher.jpg', '/images/witcher-banner.jpg',
    'https://youtu.be/ndl1W4ltcmg', '60m', 'Lauren Schmidt Hissrich', true,
    'https://www.netflix.com/title/80189685'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration, netflix_url) VALUES
(2, 1, 1, 'Le début de la fin', 'Geralt est impliqué dans un conflit politique complexe.', '60m', 'https://www.netflix.com/watch/80189685'),
(2, 1, 2, 'Quatre Marks', 'Première rencontre entre Geralt et Yennefer.', '60m', 'https://www.netflix.com/watch/80189686'),
(2, 1, 3, 'Lune de Trahison', 'Geralt découvre un complot à la cour royale.', '60m', 'https://www.netflix.com/watch/80189687'),
(2, 1, 4, 'Des banquets, des bâtards et des obsèques', 'Intrigues politiques à la cour de Cintra.', '60m', 'https://www.netflix.com/watch/80189688'),
(2, 1, 5, 'Désirs inassouvis', 'Geralt traque un djinn dangereux.', '60m', 'https://www.netflix.com/watch/80189689');

-- 3. The Punisher
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'The Punisher',
    'Un ancien Marine venge sa famille assassinée.',
    'Frank Castle devient un justicier violent après le meurtre de sa famille, traquant ceux qu''il tient pour responsables.',
    2017, '18+', ARRAY['Action', 'Thriller'],
    ARRAY['Jon Bernthal', 'Ben Barnes', 'Amber Rose Revah', 'Ebon Moss-Bachrach'],
    2, 26, 'Vengeance, Justice', ARRAY['Sombre', 'Violent'],
    '/images/punisher.jpg', '/images/punisher-banner.jpg',
    'https://youtu.be/HwZ5e2GY-3Y', '55m', 'Steve Lightfoot'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(3, 1, 1, '3 heures du matin', 'Frank reprend sa guerre contre le crime.', '55m'),
(3, 1, 2, 'Deux hommes morts', 'Frank enquête sur un complot gouvernemental.', '55m'),
(3, 1, 3, 'Kandahar', 'Flashback sur le passé militaire de Frank.', '55m'),
(3, 1, 4, 'Ravitaillement', 'Frank se rapproche de la vérité.', '55m'),
(3, 1, 5, 'Gunner', 'Confrontation avec un ancien collègue.', '55m');

-- 4. Arrow
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Arrow',
    'Un milliardaire devient justicier masqué.',
    'Oliver Queen, présumé mort, revient après 5 ans sur une île déserte pour devenir un justicier masqué dans sa ville natale.',
    2012, '12+', ARRAY['Action', 'Super-héros'],
    ARRAY['Stephen Amell', 'Katie Cassidy', 'David Ramsey', 'Emily Bett Rickards'],
    8, 170, 'Justice, Rédemption', ARRAY['Action', 'Dramatique'],
    '/images/arrow.jpg', '/images/arrow-banner.jpg',
    'https://youtu.be/XQS7JkQmlx8', '45m', 'Greg Berlanti'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(4, 1, 1, 'Le Naufragé', 'Oliver Queen revient à Starling City.', '45m'),
(4, 1, 2, 'La Promesse', 'Oliver commence sa mission secrète.', '45m'),
(4, 1, 3, 'Tireurs solitaires', 'Oliver affronte un tueur à gages.', '45m'),
(4, 1, 4, 'Un homme innocent', 'Oliver aide un homme accusé à tort.', '45m'),
(4, 1, 5, 'Le Second Archer', 'Un nouvel archer apparaît en ville.', '45m');

-- 5. La Casa de Papel (Netflix)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, is_netflix_original, netflix_url
) VALUES (
    'La Casa de Papel',
    'Braquage audacieux de la Monnaie espagnole.',
    'Huit voleurs prennent en otages le personnel de la Monnaie royale dans un braquage sans précédent.',
    2017, '16+', ARRAY['Action', 'Thriller'],
    ARRAY['Úrsula Corberó', 'Álvaro Morte', 'Itziar Ituño', 'Pedro Alonso'],
    5, 41, 'Crime, Résistance', ARRAY['Tendu', 'Haletant'],
    '/images/money-heist.jpg', '/images/money-heist-banner.jpg',
    'https://youtu.be/3y-6iaveY6c', '45m', 'Álex Pina', true,
    'https://www.netflix.com/title/80192098'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration, netflix_url) VALUES
(5, 1, 1, 'Episode 1', 'Le Professeur recrute Tokyo pour le braquage.', '45m', 'https://www.netflix.com/watch/80192098'),
(5, 1, 2, 'Episode 2', 'Prise de contrôle de la Monnaie royale.', '45m', 'https://www.netflix.com/watch/80192099'),
(5, 1, 3, 'Episode 3', 'Négociations tendues avec la police.', '45m', 'https://www.netflix.com/watch/80192100'),
(5, 1, 4, 'Episode 4', 'Relations complexes entre otages et ravisseurs.', '45m', 'https://www.netflix.com/watch/80192101'),
(5, 1, 5, 'Episode 5', 'Retournement de situation inattendu.', '45m', 'https://www.netflix.com/watch/80192102');

-- 6. Vikings (Netflix)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, netflix_url
) VALUES (
    'Vikings',
    'Aventures de Ragnar Lothbrok et ses guerriers.',
    'Ragnar Lothbrok, un fermier devenu guerrier, mène des raids vikings en Angleterre contre la volonté de son jarl.',
    2013, '16+', ARRAY['Action', 'Historique'],
    ARRAY['Travis Fimmel', 'Katheryn Winnick', 'Clive Standen', 'Gustaf Skarsgård'],
    6, 89, 'Aventure, Pouvoir', ARRAY['Épique', 'Violent'],
    '/images/vikings.jpg', '/images/vikings-banner.jpg',
    'https://youtu.be/1j2sXLbzm9U', '45m', 'Michael Hirst',
    'https://www.netflix.com/title/70301870'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration, netflix_url) VALUES
(6, 1, 1, 'Cap à l''ouest', 'Ragnar défie l''autorité en proposant une nouvelle route.', '45m', 'https://www.netflix.com/watch/70301870'),
(6, 1, 2, 'L''expédition', 'Premier raid en Angleterre.', '45m', 'https://www.netflix.com/watch/70301871'),
(6, 1, 3, 'La pêche miraculeuse', 'Retour en Angleterre avec de nouvelles intentions.', '45m', 'https://www.netflix.com/watch/70301872'),
(6, 1, 4, 'Justice est faite', 'Conséquences de la désobéissance de Ragnar.', '45m', 'https://www.netflix.com/watch/70301873'),
(6, 1, 5, 'Raid', 'Attaque spectaculaire contre un monastère.', '45m', 'https://www.netflix.com/watch/70301874');

--------------------
-- SÉRIES DRAME --
--------------------

-- 7. Squid Game (Netflix)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, is_netflix_original, netflix_url
) VALUES (
    'Squid Game',
    'Jeux mortels pour endettés désespérés.',
    '456 personnes, toutes en difficulté financière, acceptent de participer à des jeux d''enfants avec des enjeux mortels pour une récompense alléchante.',
    2021, '16+', ARRAY['Drame', 'Survival'],
    ARRAY['Lee Jung-jae', 'Jung Ho-yeon', 'Park Hae-soo', 'Wi Ha-joon'],
    1, 9, 'Survie, Argent', ARRAY['Tendu', 'Violent'],
    '/images/squid-game.jpg', '/images/squid-game-banner.jpg',
    'https://youtu.be/oqxAJKy0ii4', '55m', 'Hwang Dong-hyuk', true,
    'https://www.netflix.com/title/81040344'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration, netflix_url) VALUES
(7, 1, 1, 'Un, deux, trois, soleil', 'Premier jeu mortel : 1,2,3 soleil.', '55m', 'https://www.netflix.com/watch/81040344'),
(7, 1, 2, 'Enfer', 'Découverte des règles impitoyables.', '55m', 'https://www.netflix.com/watch/81040345'),
(7, 1, 3, 'L''Homme au parapluie', 'Nouveau jeu annoncé.', '55m', 'https://www.netflix.com/watch/81040346'),
(7, 1, 4, 'L''Équipe avant tout', 'Formation d''alliances stratégiques.', '55m', 'https://www.netflix.com/watch/81040347'),
(7, 1, 5, 'Un monde juste', 'Tensions croissantes entre participants.', '55m', 'https://www.netflix.com/watch/81040348');

-- 8. The Walking Dead (Netflix)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, netflix_url
) VALUES (
    'The Walking Dead',
    'Survie dans un monde zombie.',
    'Rick Grimes, shérif adjoint, se réveille d''un coma pour découvrir un monde apocalyptique ravagé par des zombies.',
    2010, '18+', ARRAY['Drame', 'Horreur'],
    ARRAY['Andrew Lincoln', 'Norman Reedus', 'Danai Gurira', 'Melissa McBride'],
    11, 177, 'Survie, Humanité', ARRAY['Sombre', 'Violent'],
    '/images/walking-dead.jpg', '/images/walking-dead-banner.jpg',
    'https://youtu.be/R1v0uFms68U', '45m', 'Frank Darabont',
    'https://www.netflix.com/title/70177057'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration, netflix_url) VALUES
(8, 1, 1, 'Passé décomposé', 'Rick se réveille dans un monde ravagé.', '67m', 'https://www.netflix.com/watch/70177057'),
(8, 1, 2, 'Tripes', 'Rick découvre l''horreur à Atlanta.', '44m', 'https://www.netflix.com/watch/70177058'),
(8, 1, 3, 'T''as qu''à discuter avec les grenouilles', 'Retour au camp avec de mauvaises nouvelles.', '44m', 'https://www.netflix.com/watch/70177059'),
(8, 1, 4, 'Le Gang', 'Rencontre avec d''autres survivants.', '44m', 'https://www.netflix.com/watch/70177060'),
(8, 1, 5, 'Feux de forêt', 'Décision cruciale pour la survie.', '44m', 'https://www.netflix.com/watch/70177061');

-- 9. This Is Us
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'This Is Us',
    'Histoire émouvante de la famille Pearson.',
    'Suivi des membres de la famille Pearson à différentes époques de leur vie.',
    2016, '12+', ARRAY['Drame', 'Familial'],
    ARRAY['Milo Ventimiglia', 'Mandy Moore', 'Sterling K. Brown', 'Chrissy Metz'],
    6, 106, 'Famille, Amour', ARRAY['Émotionnel', 'Inspirant'],
    '/images/this-is-us.jpg', '/images/this-is-us-banner.jpg',
    'https://youtu.be/1XatfYJU3N8', '45m', 'Dan Fogelman'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(9, 1, 1, 'L''Anniversaire', 'Vies entrelacées des membres de la famille Pearson.', '45m'),
(9, 1, 2, 'Nouveaux horizons', 'Anniversaire des triplets Pearson.', '45m'),
(9, 1, 3, 'Baby Blues', 'Tragédie familiale passée.', '45m'),
(9, 1, 4, 'La Piscine', 'Souvenirs d''enfance estivaux.', '45m'),
(9, 1, 5, 'Match décisif', 'Père et fils se rapprochent.', '45m');

-- 10. Power (Netflix)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, netflix_url
) VALUES (
    'Power',
    'Double vie d''un baron de la drogue.',
    'James "Ghost" St. Patrick tente de quitter le crime pour se concentrer sur son entreprise légitime.',
    2014, '18+', ARRAY['Drame', 'Crime'],
    ARRAY['Omari Hardwick', 'Lela Loren', 'Naturi Naughton', 'Joseph Sikora'],
    6, 63, 'Crime, Rédemption', ARRAY['Tendu', 'Dramatique'],
    '/images/power.jpg', '/images/power-banner.jpg',
    'https://youtu.be/JxWfvtnHtS0', '50m', 'Courtney Kemp',
    'https://www.netflix.com/title/70298433'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration, netflix_url) VALUES
(10, 1, 1, 'Pas exactement comme prévu', 'Ghost équilibre ses deux vies.', '50m', 'https://www.netflix.com/watch/70298433'),
(10, 1, 2, 'Peu importe ce qu''il est', 'Rapprochement avec une procureure.', '50m', 'https://www.netflix.com/watch/70298434'),
(10, 1, 3, 'C''est du vrai', 'Protection de son empire criminel.', '50m', 'https://www.netflix.com/watch/70298435'),
(10, 1, 4, 'Qui es-tu ?', 'Problèmes qui s''aggravent.', '50m', 'https://www.netflix.com/watch/70298436'),
(10, 1, 5, 'Double vie', 'Décision risquée pour Ghost.', '50m', 'https://www.netflix.com/watch/70298437');

-- 11. The Crown (Netflix)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, is_netflix_original, netflix_url
) VALUES (
    'The Crown',
    'Règne de la reine Elizabeth II.',
    'Histoire de la monarchie britannique moderne à travers le règne de la reine Elizabeth II.',
    2016, '16+', ARRAY['Drame', 'Historique'],
    ARRAY['Claire Foy', 'Olivia Colman', 'Matt Smith', 'Tobias Menzies'],
    5, 50, 'Pouvoir, Devoir', ARRAY['Sérieux', 'Émotionnel'],
    '/images/the-crown.jpg', '/images/the-crown-banner.jpg',
    'https://youtu.be/JWtnJjn6ng0', '60m', 'Peter Morgan', true,
    'https://www.netflix.com/title/80025678'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration, netflix_url) VALUES
(11, 1, 1, 'Wolferton Splash', 'Mort du roi George VI.', '60m', 'https://www.netflix.com/watch/80025678'),
(11, 1, 2, 'Hyde Park Corner', 'Accession au trône d''Elizabeth.', '60m', 'https://www.netflix.com/watch/80025679'),
(11, 1, 3, 'Windsor', 'Installation au château de Windsor.', '60m', 'https://www.netflix.com/watch/80025680'),
(11, 1, 4, 'Catastrophe naturelle', 'Brouillard toxique à Londres.', '60m', 'https://www.netflix.com/watch/80025681'),
(11, 1, 5, 'Poudre aux yeux', 'Préparation du couronnement.', '60m', 'https://www.netflix.com/watch/80025682');

--------------------
-- SÉRIES POLICIER --
--------------------

-- 12. SWAT (Netflix)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, netflix_url
) VALUES (
    'SWAT',
    'Unité d''élite de la police de Los Angeles.',
    'Daniel "Hondo" Harrelson dirige une unité SWAT tout en faisant face aux défis d''être un officier noir dans le LAPD.',
    2017, '16+', ARRAY['Policier', 'Action'],
    ARRAY['Shemar Moore', 'Stephanie Sigman', 'Alex Russell', 'Jay Harrington'],
    6, 100, 'Justice, Équipe', ARRAY['Action', 'Tendu'],
    '/images/swat.jpg', '/images/swat-banner.jpg',
    'https://youtu.be/B3Kq4A7nT64', '45m', 'Aaron Rahsaan Thomas',
    'https://www.netflix.com/title/80179292'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration, netflix_url) VALUES
(12, 1, 1, 'Pilote', 'Hondo prend la tête du SWAT.', '45m', 'https://www.netflix.com/watch/80179292'),
(12, 1, 2, 'Quatre évadés', 'Traque de criminels dangereux.', '45m', 'https://www.netflix.com/watch/80179293'),
(12, 1, 3, 'Solution radicale', 'Lutte contre des extrémistes.', '45m', 'https://www.netflix.com/watch/80179294'),
(12, 1, 4, 'Affaire de famille', 'Protection d''une famille en danger.', '45m', 'https://www.netflix.com/watch/80179295'),
(12, 1, 5, 'Sous couverture', 'Infiltration dans un gang.', '45m', 'https://www.netflix.com/watch/80179296');

-- 13. Luther
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Luther',
    'Inspecteur brillant mais tourmenté.',
    'John Luther, inspecteur brillant mais tourmenté, résout des affaires horribles à Londres.',
    2010, '16+', ARRAY['Policier', 'Thriller'],
    ARRAY['Idris Elba', 'Ruth Wilson', 'Dermot Crowley', 'Michael Smiley'],
    5, 20, 'Crime, Psychologie', ARRAY['Sombre', 'Tendu'],
    '/images/luther.jpg', '/images/luther-banner.jpg',
    'https://youtu.be/zM0EP7xq-5U', '60m', 'Neil Cross'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(13, 1, 1, 'Le Mal en soi', 'Enquête sur un tueur en série.', '60m'),
(13, 1, 2, 'Les Liens du sang', 'Traque d''un criminel pédophile.', '60m'),
(13, 1, 3, 'Sang froid', 'Rencontre troublante avec Alice Morgan.', '60m'),
(13, 1, 4, 'La Main dans le sac', 'Luther suspecté de crime.', '60m'),
(13, 1, 5, 'Argent roi', 'Confrontation finale.', '60m');

-- 14. The Rookie (Netflix)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, netflix_url
) VALUES (
    'The Rookie',
    'Un policier débutant dans une unité de Los Angeles.',
    'John Nolan, un homme d''âge moyen, devient le policier le plus âgé de Los Angeles après avoir changé de carrière et rejoint la police.',
    2018, 'TV-14', ARRAY['Policier', 'Drame'],
    ARRAY['Nathan Fillion', 'Afton Williamson', 'Eric Winter', 'Richard Tatum'],
    5, 92, 'Ambition, Courage', ARRAY['Inspirant', 'Dramatique'],
    '/images/rookie.jpg', '/images/rookie-banner.jpg',
    'https://youtu.be/6F7RwU3J1oY', '43m', 'Alexi Hawley',
    'https://www.netflix.com/title/81666165'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration, netflix_url) VALUES
(14, 1, 1, 'Pilote', 'John Nolan, un homme de 45 ans, devient le policier le plus âgé de Los Angeles après avoir changé de carrière et rejoint la police.', '43m', 'https://www.netflix.com/watch/81666165'),
(14, 1, 2, 'Pas de repos pour les braves', 'Nolan commence à comprendre les défis du métier de policier, tout en affrontant une nouvelle situation avec son équipe.', '43m', 'https://www.netflix.com/watch/81666166'),
(14, 1, 3, 'Plan B', 'Nolan et ses collègues font face à une situation où ils doivent improviser pour gérer une mission risquée.', '43m', 'https://www.netflix.com/watch/81666167'),
(14, 1, 4, 'Changement d''équipe', 'Nolan est confronté à un changement d''équipe qui met à l''épreuve ses compétences et son intégration dans la police.', '43m', 'https://www.netflix.com/watch/81666168'),
(14, 1, 5, 'Le tournoi', 'Nolan participe à une mission sous haute pression, et une compétition entre policiers met ses capacités à l''épreuve.', '43m', 'https://www.netflix.com/watch/81666169');

-- 15. Chicago PD
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Chicago Police Department',
    'Policiers du district 21 de Chicago.',
    'Unité d''intelligence du district 21 de Chicago combat le crime organisé sous la direction du sergent Voight.',
    2014, '16+', ARRAY['Policier', 'Drame'],
    ARRAY['Jason Beghe', 'Sophia Bush', 'Jesse Lee Soffer', 'Marina Squerciati'],
    10, 188, 'Crime, Loyauté', ARRAY['Intense', 'Dramatique'],
    '/images/chicago-pd.jpg', '/images/chicago-pd-banner.jpg',
    'https://youtu.be/oXw4W-9Lw0Y', '45m', 'Dick Wolf'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(15, 1, 1, 'La Méthode Voight, (première partie)', 'Voight traque un tueur en série.', '45m'),
(15, 1, 2, 'La Méthode Voight, (deuxième partie)', 'Suite de la traque du tueur.', '45m'),
(15, 1, 3, 'Un fils en liberté', 'Informateur en danger.', '45m'),
(15, 1, 4, 'Le Rôle du père', 'Membre d''équipe capturé.', '45m'),
(15, 1, 5, 'Les Transporteuses', 'Trafiquant d''armes dangereux.', '45m');

-- 16. The Wire
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'The Wire',
    'Police et trafiquants à Baltimore.',
    'Exploration réaliste du trafic de drogue à Baltimore et des institutions qui tentent de le combattre.',
    2002, '16+', ARRAY['Policier', 'Drame'],
    ARRAY['Dominic West', 'Idris Elba', 'Michael K. Williams', 'Lance Reddick'],
    5, 60, 'Crime, Société', ARRAY['Réaliste', 'Complexe'],
    '/images/wire.jpg', '/images/wire-banner.jpg',
    'https://youtu.be/9qK-VGjMr8g', '60m', 'David Simon'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(16, 1, 1, 'La Cible', 'McNulty enquête sur Barksdale.', '60m'),
(16, 1, 2, 'Le détachement', 'Formation de l''unité spéciale.', '60m'),
(16, 1, 3, 'La poudre aux yeux', 'Surveillance des transactions.', '60m'),
(16, 1, 4, 'Histoire ancienne', 'Résolution d''une vieille affaire.', '60m'),
(16, 1, 5, 'Le code', 'Surveillance électronique.', '60m');

------------------
-- SÉRIES COMÉDIE --
------------------

-- 17. Friends (Netflix)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, netflix_url
) VALUES (
    'Friends',
    'Péripéties de six amis new-yorkais.',
    'Vies personnelles et professionnelles de six amis trentenaires à New York.',
    1994, '12+', ARRAY['Comédie', 'Romance'],
    ARRAY['Jennifer Aniston', 'Courteney Cox', 'Lisa Kudrow', 'Matt LeBlanc', 'Matthew Perry', 'David Schwimmer'],
    10, 236, 'Amitié, Amour', ARRAY['Drôle', 'Léger'],
    '/images/friends.jpg', '/images/friends-banner.jpg',
    'https://youtu.be/IEEbUzffzrk', '25m', 'David Crane, Marta Kauffman',
    'https://www.netflix.com/title/70153404'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration, netflix_url) VALUES
(17, 1, 1, 'Celui qui déménage', 'Rachel rejoint le groupe après avoir fui son mariage.', '25m', 'https://www.netflix.com/watch/70153404'),
(17, 1, 2, 'Celui qui est perdu', 'Ross peine à avancer après son divorce.', '25m', 'https://www.netflix.com/watch/70153405'),
(17, 1, 3, 'Celui qui a un rôle', 'Chandler fume à nouveau pour un rôle.', '25m', 'https://www.netflix.com/watch/70153406'),
(17, 1, 4, 'Celui avec George', 'Match de hockey improvisé.', '25m', 'https://www.netflix.com/watch/70153407'),
(17, 1, 5, 'Celui qui lave plus blanc', 'Rachel tente de faire sa lessive.', '25m', 'https://www.netflix.com/watch/70153408');

-- 18. Ma famille d'abord
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Ma famille d''abord',
    'Vie d''une famille afro-américaine.',
    'Michael Kyle élève sa famille avec humour et fermeté dans la banlieue américaine.',
    2001, '10+', ARRAY['Comédie', 'Familial'],
    ARRAY['Damon Wayans', 'Tisha Campbell', 'George O. Gore II', 'Jennifer Freeman'],
    5, 123, 'Famille, Humour', ARRAY['Drôle', 'Chaleureux'],
    '/images/my-wife-and-kids.jpg', '/images/my-wife-and-kids-banner.jpg',
    'https://youtu.be/9Qj3YV4y5Dk', '25m', 'Damon Wayans'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(18, 1, 1, 'Un papa en or', 'Michael impose ses règles familiales strictes.', '25m'),
(18, 1, 2, 'La vérité blesse', 'Claire a un petit ami que son père désapprouve.', '25m'),
(18, 1, 3, 'Panne d''inspiration', 'Junior veut une voiture après avoir fumé de la marijuana.', '25m'),
(18, 1, 4, 'Des seins animés', 'Claire achète un soutien-gorge rembourré.', '25m'),
(18, 1, 5, 'La Bosse des maths', 'Test d''une nouvelle nounou pour les enfants.', '25m');

-- 19. Le Prince de Bel-Air
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Le Prince de Bel-Air',
    'Adolescent pauvre chez sa riche famille.',
    'Will Smith quitte Philadelphie pour vivre avec sa riche famille à Bel-Air, en Californie.',
    1990, '10+', ARRAY['Comédie', 'Familial'],
    ARRAY['Will Smith', 'James Avery', 'Alfonso Ribeiro', 'Tatyana Ali'],
    6, 148, 'Famille, Culture', ARRAY['Drôle', 'Nostalgique'],
    '/images/fresh-prince.jpg', '/images/fresh-prince-banner.jpg',
    'https://youtu.be/1nCqRmx3Dnw', '25m', 'Andy Borowitz, Susan Borowitz'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(19, 1, 1, 'Les Grands projets', 'Will arrive à Bel-Air et découvre son nouveau mode de vie.', '25m'),
(19, 1, 2, 'Attachez vos ceintures', 'Will a du mal à s''adapter aux règles strictes.', '25m'),
(19, 1, 3, 'En avant la musique', 'Will organise une fête qui tourne mal.', '25m'),
(19, 1, 4, 'On ne touche pas', 'Will se bat pour être accepté à l''école.', '25m'),
(19, 1, 5, 'Qu''on est bien chez vous', 'Will se sent enfin à sa place.', '25m');

-- 20. Brooklyn Nine-Nine (Netflix)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, netflix_url
) VALUES (
    'Brooklyn Nine-Nine',
    'Policiers d''un commissariat de Brooklyn.',
    'Jake Peralta, détective talentueux mais immature, doit s''adapter à un nouveau capitaine strict.',
    2013, '12+', ARRAY['Comédie', 'Policier'],
    ARRAY['Andy Samberg', 'Terry Crews', 'Melissa Fumero', 'Stephanie Beatriz'],
    8, 153, 'Policier, Humour', ARRAY['Drôle', 'Léger'],
    '/images/brooklyn99.jpg', '/images/brooklyn99-banner.jpg',
    'https://youtu.be/sEOuJ4z5aTc', '25m', 'Dan Goor, Michael Schur',
    'https://www.netflix.com/title/70281562'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration, netflix_url) VALUES
(20, 1, 1, 'Le Nouveau Capitaine', 'Arrivée du capitaine Holt au commissariat.', '25m', 'https://www.netflix.com/watch/70281562'),
(20, 1, 2, 'Le Tagueur', 'Enquête sur un artiste graffeur.', '25m', 'https://www.netflix.com/watch/70281563'),
(20, 1, 3, 'Ça rame, ça rame', 'Jake traverse une mauvaise passe professionnelle.', '25m', 'https://www.netflix.com/watch/70281564'),
(20, 1, 4, 'Premier en second', 'Jalousie amoureuse au travail.', '25m', 'https://www.netflix.com/watch/70281565'),
(20, 1, 5, 'Le Vautour', 'Un détective vedette vient voler la vedette.', '25m', 'https://www.netflix.com/watch/70281566');

-- 21. The Office (Netflix)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, netflix_url
) VALUES (
    'The Office',
    'Une comédie qui suit la vie quotidienne des employés d''un bureau.',
    'The Office raconte la vie de travailleurs de bureau dans une entreprise de distribution de papier, le tout sous forme de documentaire. Les personnages, excentriques et parfois maladroits, créent une dynamique unique et souvent hilarante.',
    2005, '10+', ARRAY['Comédie'],
    ARRAY['Steve Carell', 'Rainn Wilson', 'John Krasinski', 'Jenna Fischer', 'Mindy Kaling'],
    9, 201, 'Bureau, Relations', ARRAY['Drôle', 'Hilarant'],
    '/images/the-office.jpg', '/images/the-office-banner.jpg',
    'https://youtu.be/dL8p5F_zHh0', '22m', 'Greg Daniels',
    'https://www.netflix.com/title/70136120'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration, netflix_url) VALUES
(21, 1, 1, 'La Rumeur', 'Michael répand une rumeur qui bouleverse le bureau.', '22m', 'https://www.netflix.com/watch/70136120'),
(21, 1, 2, 'La Journée de la Diversité', 'Michael organise une journée de la diversité, mais la situation dégénère rapidement.', '22m', 'https://www.netflix.com/watch/70136120'),
(21, 1, 3, 'La Mutuelle', 'Michael doit choisir entre différentes options pour l''assurance santé des employés.', '22m', 'https://www.netflix.com/watch/70136120'),
(21, 1, 4, 'L''Alliance', 'Les employés se liguent contre Michael pour se protéger des réductions de personnel.', '22m', 'https://www.netflix.com/watch/70136120'),
(21, 1, 5, 'Le Match de Basket', 'Une compétition de basketball amicale se transforme en une guerre de bureaux.', '22m', 'https://www.netflix.com/watch/70136120');

--------------------
-- SÉRIES CLASSIQUES --
--------------------

-- 22. Breaking Bad (Netflix)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, netflix_url
) VALUES (
    'Breaking Bad',
    'Un professeur de chimie devient baron de la drogue après un diagnostic de cancer.',
    'Walter White, professeur de chimie surqualifié, se lance dans la fabrication de méthamphétamine après un diagnostic de cancer pour assurer l''avenir financier de sa famille.',
    2008, '16+', ARRAY['Drame', 'Crime'],
    ARRAY['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'Dean Norris'],
    5, 62, 'Transformation, Pouvoir, Conséquences', ARRAY['Tendu', 'Sombre'],
    '/images/breaking-bad.jpg', '/images/breaking-bad-banner.jpg',
    'https://youtu.be/HhesaQXLuRY', '45m', 'Vince Gilligan',
    'https://www.netflix.com/title/70143836'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration, netflix_url) VALUES
(22, 1, 1, 'Chute libre', 'Walter reçoit un diagnostic de cancer.', '58m', 'https://www.netflix.com/watch/70143836'),
(22, 1, 2, 'Le Choix', 'Walter et Jesse tentent de se débarrasser d''un corps.', '48m', 'https://www.netflix.com/watch/70143837'),
(22, 1, 3, 'Dérapage', 'Walter doit prendre une décision difficile.', '48m', 'https://www.netflix.com/watch/70143838'),
(22, 1, 4, 'Retour aux sources', 'Walter révèle son cancer à sa famille.', '48m', 'https://www.netflix.com/watch/70143839'),
(22, 1, 5, 'Vivre ou survivre', 'Walter refuse l''aide de ses anciens associés.', '48m', 'https://www.netflix.com/watch/70143840');

-- 23. Game of Thrones
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'Game of Thrones',
    'Conflits sanglants pour le trône de fer dans les Sept Royaumes.',
    'Plusieurs familles nobles se disputent le contrôle du Trône de Fer des Sept Couronnes dans un monde médiéval-fantastique brutal.',
    2011, '16+', ARRAY['Fantasy', 'Drame'],
    ARRAY['Kit Harington', 'Emilia Clarke', 'Peter Dinklage', 'Lena Headey'],
    8, 73, 'Pouvoir, Trahison, Guerre', ARRAY['Épique', 'Violent'],
    '/images/got.jpg', '/images/got-banner.jpg',
    'https://youtu.be/KPLWWIOCOOQ', '55m', 'David Benioff, D.B. Weiss'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(23, 1, 1, 'L''hiver vient', 'Lord Stark devient la Main du Roi.', '55m'),
(23, 1, 2, 'La Route royale', 'La famille Stark se rend à Port-Réal.', '55m'),
(23, 1, 3, 'Lord Snow', 'Jon Snow rejoint la Garde de Nuit.', '55m'),
(23, 1, 4, 'Infirmes, Bâtards et Choses brisées', 'Tyrion se rend au Mur.', '55m'),
(23, 1, 5, 'Le Loup et le Lion', 'Ned enquête sur la mort de Jon Arryn.', '55m');

-- 24. Peaky Blinders (Netflix)
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator, netflix_url
) VALUES (
    'Peaky Blinders',
    'Un gang familial règne sur Birmingham dans l''Angleterre des années 1920.',
    'La famille Shelby, une redoutable organisation criminelle, étend son influence dans l''Angleterre de l''après-Première Guerre mondiale.',
    2013, '16+', ARRAY['Drame', 'Crime'],
    ARRAY['Cillian Murphy', 'Paul Anderson', 'Helen McCrory', 'Tom Hardy'],
    6, 36, 'Pouvoir, Famille, Crime', ARRAY['Sombre', 'Violent'],
    '/images/peaky-blinders.jpg', '/images/peaky-blinders-banner.jpg',
    'https://youtu.be/oVzVdvGIC7U', '55m', 'Steven Knight',
    'https://www.netflix.com/title/80002479'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration, netflix_url) VALUES
(24, 1, 1, 'Épisode 1', 'Thomas Shelby planifie l''expansion de son empire criminel.', '55m', 'https://www.netflix.com/watch/80002479'),
(24, 1, 2, 'Épisode 2', 'Les Shelby affrontent un nouveau rival.', '55m', 'https://www.netflix.com/watch/80002480'),
(24, 1, 3, 'Épisode 3', 'Thomas négocie avec des officiels corrompus.', '55m', 'https://www.netflix.com/watch/80002481'),
(24, 1, 4, 'Épisode 4', 'Un inspecteur de police se rapproche des Shelby.', '55m', 'https://www.netflix.com/watch/80002482'),
(24, 1, 5, 'Épisode 5', 'La famille Shelby est menacée de toutes parts.', '55m', 'https://www.netflix.com/watch/80002483');

-- 25. The Sopranos
INSERT INTO series (
    title, description, detailed_description, release_year, rating, genres,
    actors, seasons, episode_count, themes, moods, image_url, banner_url,
    trailer_url, duration, creator
) VALUES (
    'The Sopranos',
    'La vie d''un patron de la mafia new-jerseyaise qui consulte un psychiatre.',
    'Tony Soprano, un boss de la mafia du New Jersey, lutte pour équilibrer sa vie criminelle et ses problèmes personnels, tout en suivant une thérapie.',
    1999, '16+', ARRAY['Drame', 'Crime'],
    ARRAY['James Gandolfini', 'Lorraine Bracco', 'Edie Falco', 'Michael Imperioli'],
    6, 86, 'Mafia, Famille, Psychologie', ARRAY['Sombre', 'Complexe'],
    '/images/sopranos.jpg', '/images/sopranos-banner.jpg',
    'https://youtu.be/1X3A5vRZtGQ', '55m', 'David Chase'
);

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(25, 1, 1, 'Égarement', 'Tony a des crises de panique et commence une thérapie.', '55m'),
(25, 1, 2, 'Le Clan Soprano', 'Tony traite un problème avec un camion de whisky volé.', '55m'),
(25, 1, 3, 'À bout de souffle', 'Christopher commet son premier meurtre.', '55m'),
(25, 1, 4, 'La Nouvelle Ère', 'Tony doit gérer un problème avec un associé.', '55m'),
(25, 1, 5, 'Suspicion', 'Tony emmène Meadow visiter des universités.', '55m');

-- 26. Lost
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

INSERT INTO episodes (serie_id, season_number, episode_number, title, description, duration) VALUES
(26, 1, 1, 'Le Réveil, première partie', 'Le vol Oceanic 815 s''écrase sur une île mystérieuse.', '65m'),
(26, 1, 2, 'Le Réveil, deuxième partie', 'Les survivants explorent l''île et trouvent un message de détresse.', '65m'),
(26, 1, 3, 'Le Nouveau Départ', 'Jack et Kate poursuivent un mystérieux animal dans la jungle.', '45m'),
(26, 1, 4, 'Les Pieds sur terre', 'Les survivants organisent des funérailles pour les victimes du crash.', '45m'),
(26, 1, 5, 'À la recherche du père', 'Claire est attaquée et enlevée par "les Autres".', '45m');

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