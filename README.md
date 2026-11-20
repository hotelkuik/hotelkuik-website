# Website Hotel Kuik

De website van Hotel Kuik, Brink 15, Ruinen. Aanpassingen worden gemaakt via Claude en vanuit GitHub automatisch op Hostinger gezet.

## Pagina's

| Adres | Bestand |
|---|---|
| / | `index.html` (Home) |
| /overnachten/ | `overnachten/index.html` (kerst, arrangementen, kamers, boekbalk) |
| /eten-drinken/ | `eten-drinken/index.html` (kaarten, 3-gangendiner, afhalen, ontbijtservice) |
| /buffetten/ | `buffetten/index.html` (alle buffetten en het aanvraagformulier) |
| /partijen-vergaderen/ | `partijen-vergaderen/index.html` |
| /omgeving/ | `omgeving/index.html` |
| /contact/ | `contact/index.html` (gegevens, veelgestelde vragen, vacatures) |
| /privacy/ | `privacy/index.html` (privacyverklaring) |

## Overige bestanden

- `DESIGN.md`: de ontwerpkeuzes (kleuren, letters, onderdelen). Nieuwe pagina's volgen dit.
- `assets/basis.css`: huisstijl: kleuren, lettertypes, knoppen, kop en voet
- `assets/site.css`: opmaak van de pagina's (layout "Foto voorop")
- `assets/site.js`: boekbalk, uitklappen, buffetformulier, kerstblok
- `assets/img/`: foto's en logo. Op de pagina's staan WebP-versies (800 en 1400 breed); de jpg's blijven voor previews op sociale media
- `assets/fonts/`: lettertypes Bree Serif en Source Sans 3 (staan op de eigen server, niet bij Google)
- `verstuur.php`: stuurt buffetaanvragen per e-mail naar info@hotelkuik.nl
- `.htaccess`: https, en doorverwijzingen van de adressen van de oude website
- `robots.txt` en `sitemap.xml`: voor Google

## Boekingen

De boekbalk opent de boekingsmodule van Smarthotel met de gekozen datums en personen.

## Dronebeelden op de homepage

Zet het filmpje als `assets/video/drone.mp4` (H.264, zonder geluid, liefst onder 8 MB) en zet in `index.html` de `<video>` uit de opmerking direct onder de `<img class="held-media">`. Bezoekers die minder beweging willen zien, krijgen automatisch de foto.
