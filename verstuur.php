<?php
/*
 * Hotel Kuik - verstuurt een buffetaanvraag per e-mail.
 * Ontvanger aanpassen? Wijzig $ontvanger hieronder.
 *
 * De namen en prijzen van de buffetten leest dit script uit buffetten/index.html
 * (de vinkjes in het formulier). Een prijs aanpassen kan dus op één plek: daar.
 */
$ontvanger = 'info@hotelkuik.nl';
$afzender  = 'website@hotelkuik.nl';
$maxPerUur = 5;     // aanvragen per bezoeker (IP-adres) per uur, tegen spam

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function stop($code, $fout) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'fout' => $fout]);
    exit;
}
function schoon($v, $max = 500) {
    $v = is_string($v) ? $v : '';
    $v = str_replace(["\r", "\n"], ' ', $v);           // geen extra mailkoppen
    return mb_substr(trim(strip_tags($v)), 0, $max);
}
function lijst($v, $max) {
    return array_slice(array_values(array_filter(is_array($v) ? $v : [], 'is_string')), 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') stop(405, 'Alleen versturen via het formulier.');

$d = json_decode(file_get_contents('php://input', false, null, 0, 20000), true);
if (!is_array($d)) stop(400, 'Ongeldige aanvraag.');

// Anti-spam: dit veld is onzichtbaar voor bezoekers
if (!empty($d['website'])) { echo json_encode(['ok' => true]); exit; }

// Anti-spam: niet meer dan $maxPerUur aanvragen per bezoeker per uur
$map = sys_get_temp_dir() . '/hotelkuik-aanvragen';
if (!is_dir($map)) @mkdir($map, 0700, true);
$sleutel = $map . '/' . hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|hotelkuik') . '.json';
$nu = time();
$eerder = is_file($sleutel) ? (json_decode((string)@file_get_contents($sleutel), true) ?: []) : [];
$eerder = array_values(array_filter($eerder, fn($t) => is_int($t) && $t > $nu - 3600));
if (count($eerder) >= $maxPerUur) stop(429, 'Te veel aanvragen achter elkaar. Bel ons gerust.');

// Buffetten en prijzen uit de buffetpagina halen
$aanbod = [];
$pagina = @file_get_contents(__DIR__ . '/buffetten/index.html');
if ($pagina && preg_match_all('/name="buffet"[^>]*value="([^"]+)"[^>]*data-prijs="([\d.]+)"[^>]*data-naam="([^"]+)"/', $pagina, $m, PREG_SET_ORDER)) {
    foreach ($m as $b) $aanbod[$b[1]] = ['naam' => html_entity_decode($b[3], ENT_QUOTES, 'UTF-8'), 'prijs' => (float)$b[2]];
}

$naam     = schoon($d['naam'] ?? '', 100);
$telefoon = schoon($d['telefoon'] ?? '', 30);
$email    = filter_var(schoon($d['email'] ?? '', 150), FILTER_VALIDATE_EMAIL) ?: '';
$personen = filter_var($d['personen'] ?? 0, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 500]]) ?: 0;

// Datum: een echte datum, vanaf vandaag en niet verder dan 2 jaar vooruit
$datum = '';
$ruw = is_string($d['datum'] ?? null) ? $d['datum'] : '';
if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $ruw, $dm) && checkdate((int)$dm[2], (int)$dm[3], (int)$dm[1])) {
    $vandaag = date('Y-m-d');
    if ($ruw >= $vandaag && $ruw <= date('Y-m-d', strtotime('+2 years'))) $datum = $ruw;
}

// Gekozen buffetten: alleen wat echt op de buffetpagina staat
$buffetten = [];
$pp = 0.0;
foreach (lijst($d['buffetIds'] ?? [], 20) as $id) {
    if (isset($aanbod[$id]) && !isset($buffetten[$id])) {
        $buffetten[$id] = $aanbod[$id]['naam'];
        $pp += $aanbod[$id]['prijs'];
    }
}
// Valt het uitlezen van de buffetpagina ooit weg: namen dan toch doorsturen, zonder prijs
if (!$aanbod) {
    foreach (lijst($d['buffetten'] ?? [], 20) as $b) $buffetten[] = schoon($b, 80);
}
$dieet = array_map(fn($b) => schoon($b, 40), lijst($d['dieet'] ?? [], 10));

if (mb_strlen($naam) < 2 || strlen(preg_replace('/\D/', '', $telefoon)) < 9 || !$datum || !$personen || !$buffetten) {
    stop(422, 'Niet alle verplichte velden zijn goed ingevuld.');
}

$datumNl = date('d-m-Y', strtotime($datum));
$indicatie = $aanbod
    ? 'EUR ' . number_format($pp, 2, ',', '.') . ' p.p. / EUR ' . number_format($pp * $personen, 2, ',', '.') . ' totaal'
    : 'onbekend (prijslijst niet gevonden)';

$tekst = "Nieuwe buffetaanvraag via de website\n"
       . "====================================\n\n"
       . "Datum:        $datumNl\n"
       . "Personen:     $personen\n"
       . "Gelegenheid:  " . schoon($d['gelegenheid'] ?? '', 60) . "\n"
       . "Buffetten:    " . implode(' + ', $buffetten) . "\n"
       . "Indicatie:    $indicatie\n\n"
       . "Dieetwensen:  " . ($dieet ? implode(', ', $dieet) : '-') . "\n"
       . "Toelichting:  " . (schoon($d['dieetToelichting'] ?? '', 1000) ?: '-') . "\n\n"
       . "Naam:         $naam\n"
       . "Telefoon:     $telefoon\n"
       . "E-mail:       " . ($email ?: '-') . "\n"
       . "Bellen:       " . schoon($d['belmoment'] ?? '', 40) . "\n\n"
       . "Opmerkingen:\n" . (schoon($d['opmerkingen'] ?? '', 2000) ?: '-') . "\n";

$onderwerp = "Buffetaanvraag $datumNl - $personen pers. - $naam";
$koppen = "From: Website Hotel Kuik <$afzender>\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n"
        . ($email ? "Reply-To: $email\r\n" : '');

$gelukt = mail($ontvanger, '=?UTF-8?B?' . base64_encode($onderwerp) . '?=', $tekst, $koppen);
if (!$gelukt) stop(500, 'De e-mail kon niet worden verstuurd.');

$eerder[] = $nu;
@file_put_contents($sleutel, json_encode($eerder), LOCK_EX);
echo json_encode(['ok' => true]);
