# Wie Wat Status

"Wie Wat Status" is een eenvoudige webapplicatie waarmee gebruikers informatie kunnen opslaan, beheren en weergeven over verschillende gemeenten, contactpersonen en onderwerpen. De applicatie biedt een login-systeem voor beheerders, die vervolgens nieuwe records kunnen toevoegen en bestaande records kunnen verwijderen.

## Inhoud van de Applicatie

### 1. Overzicht

"Wie Wat Status" is een eenvoudige webapplicatie waarmee gebruikers informatie kunnen opslaan, beheren en weergeven over verschillende gemeenten, contactpersonen en onderwerpen. De applicatie biedt een login-systeem voor beheerders, die vervolgens nieuwe records kunnen toevoegen en bestaande records kunnen verwijderen.

### 2. Functionaliteiten

- **Inloggen en Uitloggen**: Alleen beheerders kunnen inloggen om nieuwe gegevens toe te voegen of te verwijderen. Het inlog- en uitlogproces wordt verzorgd door Firebase Authentication.
- **Recordbeheer**: Ingelogde gebruikers kunnen nieuwe records toevoegen door het formulier in te vullen. Deze records bevatten velden zoals gemeente, contactpersoon, onderwerp, subonderwerp, bron, en status.
- **Records Weergeven**: De records worden weergegeven in een tabel die automatisch wordt bijgewerkt zodra nieuwe gegevens worden toegevoegd of verwijderd.
- **Zoekfunctie**: Gebruikers kunnen records dynamisch filteren met behulp van een zoekveld.
- **Records Sorteren**: De records kunnen worden gesorteerd op kolom met behulp van de Tablesort-bibliotheek.
- **Records Verwijderen**: Ingelogde beheerders kunnen records verwijderen uit de tabel.

### 3. Bestandstructuur

- **index.html**: Dit is het hoofd-HTML-bestand dat de pagina opbouwt. Het bevat de basisstructuur van de pagina, inclusief knoppen voor inloggen en uitloggen, het formulier voor het toevoegen van records, en de tabel voor het weergeven van bestaande records.
- **styles.css**: Dit bestand bevat de CSS-stijlen voor de applicatie, zoals het uiterlijk van knoppen, formulieren, en tabellen. Het ontwerp is gericht op gebruiksvriendelijkheid, met een moderne en duidelijke stijl.
- **scripts.js**: Dit JavaScript-bestand bevat de logica voor het toevoegen van records, ophalen van gegevens uit Firestore, en het beheren van de weergave van de records. Het bevat ook de functionaliteit voor het inloggen, uitloggen, en het beheren van de authenticatiestatus.

## Gebruikersinstructies

1. Open de webapplicatie in een browser.
2. Voeg records toe door het formulier in te vullen en op "Voeg toe" te klikken.
3. Alle toegevoegde records worden weergegeven in een tabel onder het formulier.
4. Beheerders kunnen records verwijderen door te klikken op de verwijderknop naast elk record.
5. Om dit te doen moet je eerst op de knop "Admin Login" klikken om in te loggen als beheerder.
