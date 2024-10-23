# Wie Wat Status

Dit is de README voor de "Wie Wat Status"-webapplicatie. Deze applicatie maakt gebruik van Firebase voor authenticatie en opslag van gegevens, en is ontwikkeld met HTML, CSS, en JavaScript.

## Inhoud van de Applicatie

### 1. Overzicht

"Wie Wat Status" is een eenvoudige webapplicatie waarmee gebruikers informatie kunnen opslaan, beheren en weergeven over verschillende gemeenten, contactpersonen en onderwerpen. De applicatie biedt een login-systeem voor beheerders, die vervolgens nieuwe records kunnen toevoegen en bestaande records kunnen verwijderen.

### 2. Functionaliteiten

- **Inloggen en Uitloggen**: Alleen beheerders kunnen inloggen om nieuwe gegevens toe te voegen of te verwijderen. Het inlog- en uitlogproces wordt verzorgd door Firebase Authentication.
- **Recordbeheer**: Ingelogde gebruikers kunnen nieuwe records toevoegen door het formulier in te vullen. Deze records bevatten velden zoals gemeente, contactpersoon, onderwerp, subonderwerp, bron, en status.
- **Records Weergeven**: De records worden weergegeven in een tabel die automatisch wordt bijgewerkt zodra nieuwe gegevens worden toegevoegd of verwijderd.

### 3. Bestandstructuur

- **index.html**: Dit is het hoofd-HTML-bestand dat de pagina opbouwt. Het bevat de basisstructuur van de pagina, inclusief knoppen voor inloggen en uitloggen, het formulier voor het toevoegen van records, en de tabel voor het weergeven van bestaande records.
- **styles.css**: Dit bestand bevat de CSS-stijlen voor de applicatie, zoals het uiterlijk van knoppen, formulieren, en tabellen. Het ontwerp is gericht op gebruiksvriendelijkheid, met een moderne en duidelijke stijl.
- **scripts.js**: Dit JavaScript-bestand bevat de logica voor het toevoegen van records, ophalen van gegevens uit Firestore, en het beheren van de weergave van de records. Het bevat ook de functionaliteit voor het inloggen, uitloggen, en het beheren van de authenticatiestatus.

## Installatie

1. **Firebase Instellen**: Zorg ervoor dat Firebase correct is ingesteld. Pas de `firebaseConfig`-variabelen in het `index.html`-bestand aan met uw eigen Firebase-gegevens.
2. **Bestanden Hosten**: Host de bestanden (`index.html`, `styles.css`, `scripts.js`) op een webserver. Een statische webserver zoals Firebase Hosting kan worden gebruikt.

## Gebruikersinstructies

1. Open de webapplicatie in een browser.
2. Voeg records toe door het formulier in te vullen en op "Voeg toe" te klikken.
3. Alle toegevoegde records worden weergegeven in een tabel onder het formulier.
4. Beheerders kunnen records verwijderen door te klikken op de verwijderknop naast elk record.
5. Om dit te doen moet je eerst op de knop "Admin Login" klikken om in te loggen als beheerder.

## Opmerkingen

- Deze applicatie is ontwikkeld voor gebruik binnen kleinere teams of gemeentes, waarbij een beheerder verantwoordelijk is voor het beheren van statusinformatie.
- De applicatie bevat een "honeypot"-veld om eenvoudige botverzoeken te detecteren en te blokkeren.


