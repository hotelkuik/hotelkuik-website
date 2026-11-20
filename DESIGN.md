# DESIGN.md · Hotel Kuik

Hotel, café en restaurant aan de Brink in Ruinen, sinds 1936. De site moet voelen als het hotel zelf: warm, verzorgd en Drents nuchter. Geen sjabloon. Basis: de vastgelegde huisstijl (oxiderood RAL 3009, rood, Bree Serif) en het interieur (donker plafond, rode baksteen, eikenhout, heidebehang).

Lezers zijn vaak 50-plus, families, fietsers en wandelaars. Daarom: grote, rustige letters, duidelijke prijzen, telefoonnummer altijd zichtbaar.

Alleen een lichte weergave (geen donkere modus): een hotelsite moet er overal hetzelfde uitzien.

## Kleur

| Token | Waarde | Rol |
|---|---|---|
| `--inkt` | `#2A2422` | Tekst en koppen. Ook de donkere balk (kop/voet), naar het donkere plafond. |
| `--grijs` | `#6B625E` | Toelichting, bijschriften, kleine tekst (6:1 op wit). |
| `--lijn` | `#E3DCD7` | Randen, scheidingslijnen, invoervelden. |
| `--wit` | `#FFFFFF` | Achtergrond van de pagina. |
| `--heide` | `#F3EFF3` | Rustige vlakken: boekbalk, formulieren, "inbegrepen". Een vleug heidepaars. |
| `--oxide` | `#6C332B` | Hoofdkleur (RAL 3009): knoppen, links, prijzen. |
| `--oxide-donker` | `#55271F` | Knop bij aanwijzen/indrukken. |
| `--rood` | `#C42D3D` | Accent, spaarzaam: "Meest gekozen", kerst. Nooit voor gewone knoppen. |
| `--eiken` | `#B88B5E` | Puntjes tussen gerecht en prijs, dunne accentlijnen. |
| `--fout` | `#B3261E` | Foutmeldingen in formulieren. |
| `--goed` | `#2E6B3F` | Bevestigingen. |

Contrast: tekst minstens 4,5:1. Oxide op wit is 9:1, rood op wit 5:1, wit op oxide 9:1.

## Typografie

- **Koppen:** Bree Serif 400 (enige gewicht), de huisstijlletter.
- **Tekst, knoppen, formulieren:** Source Sans 3, 400 / 600 / 700.
- Beide staan op de eigen server (`assets/fonts`), niet bij Google.

| Naam | Grootte | Regelhoogte | Gebruik |
|---|---|---|---|
| `--t-xs` | 14px | 1.4 | Bijschriften, kleine meta |
| `--t-s` | 16px | 1.5 | Labels, knoppen, menu |
| `--t-m` | 18px | 1.6 | Lopende tekst (standaard) |
| `--t-l` | 22px | 1.45 | Intro onder een paginakop |
| `--t-xl` | 28px | 1.25 | h3, gerechtnaam in prijslijst |
| `--t-2xl` | 36px | 1.15 | h2, sectiekop |
| `--t-3xl` | clamp(40px, 6vw, 60px) | 1.05 | h1, één per pagina |

Regels tot 65 tekens. Kopteksten links uitgelijnd, nooit allemaal gecentreerd. Geen labels in hoofdletters boven koppen.

## Ruimte

Schaal van 8: 4, 8, 12, 16, 24, 32, 48, 64, 96 px.
Inhoud maximaal 1120px breed; zijmarge minstens 16px (20px vanaf 600px).
Tussen secties 64px (telefoon 48px).

## Vorm en diepte

- Hoek: 4px voor knoppen en invoervelden. Foto's en vlakken: 0 (recht, zoals een kaart of brochure).
- Geen schaduwen. Alleen een focusrand: 3px `--rood` op 2px afstand.

## Onderdelen

- **Knop primair:** oxide vlak, witte tekst, 600, 48px hoog. Aanwijzen: oxide-donker.
- **Knop secundair:** witte achtergrond, oxide rand 2px, oxide tekst.
- **Stille knop / link:** oxide tekst, onderstreept. Geen pijltjes erachter.
- **Prijsregel (kenmerk van de site):** naam links, stippellijn in eiken, prijs rechts in oxide; toelichting eronder in grijs. Voor buffetten, afhalen, ontbijt, arrangementen en extra's.
- **Navigatie:** logo links, menu-items in Source Sans 600, huidige pagina onderstreept; telefoonnummer altijd zichtbaar.
- **Boekbalk:** heidevlak met aankomst, vertrek, personen en één primaire knop.
- **Uitklappen (details):** "Toon gerechten" met plus/min-teken; klapt per buffetsoort tegelijk open.
- **Voet:** donker (`--inkt`), witte tekst, adres, telefoon, mail, sociale media.
- **Geen** afgeronde kaarten met rand en schaduw, geen bolletjes/pillen, geen kleurverlopen, geen emoji.

## Beeld

- Alleen eigen foto's van het hotel (bar, restaurant, zithoek) en de ontwerpimpressies van de kamers, met het bijschrift "Impressie".
- Foto's op ware verhouding of breed bijgesneden, met rechte hoeken.
- Geen iconenset nodig; waar een teken helpt (vinkje bij "inbegrepen") een eenvoudig getekend vinkje in oxide.
