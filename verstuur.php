<?php
/*
 * Hotel Kuik - verstuurt een buffetaanvraag per e-mail.
 * Ontvanger aanpassen? Wijzig $ontvanger hieronder.
 */
$ontvanger = 'info@hotelkuik.nl';
$afzender  = 'website@hotelkuik.nl';

header('Content-Type: application/json; charset=utf-8');

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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') stop(405, 'Alleen versturen via het formulier.');

$d = json_decode(file_get_contents('php://input'), true);
if (!is_array($d)) stop(400, 'Ongeldige aanvraag.');

// Anti-spam: dit veld is onzichtbaar voor bezoekers
if (!empty($d['website'])) { echo json_encode(['ok' => true]); exit; }

$naam     = schoon($d['naam'] ?? '', 100);
$telefoon = schoon($d['telefoon'] ?? '', 30);
$email    = filter_var(schoon($d['email'] ?? '', 150), FILTER_VALIDATE_EMAIL) ?: '';
$datum    = preg_match('/^\d{4}-\d{2}-\d{2}$/', $d['datum'] ?? '') ? $d['datum'] : '';
$personen = (int)($d['personen'] ?? 0);
$buffetten = array_map(fn($b) => schoon($b, 80), array_slice((array)($d['buffetten'] ?? []), 0, 20));
$dieet     = array_map(fn($b) => schoon($b, 40), array_slice((array)($d['dieet'] ?? []), 0, 10));

if (mb_strlen($naam) < 2 || strlen(preg_replace('/\D/', '', $telefoon)) < 9 || !$datum || $personen < 1 || !$buffetten) {
    stop(422, 'Niet alle verplichte velden zijn ingevuld.');
}

$datumNl = date('d-m-Y', strtotime($datum));
$pp = number_format((float)($d['prijsPerPersoon'] ?? 0), 2, ',', '.');
$totaal = number_format((float)($d['prijsPerPersoon'] ?? 0) * $personen, 2, ',', '.');

$tekst = "Nieuwe buffetaanvraag via de website\n"
       . "====================================\n\n"
       . "Datum:        $datumNl\n"
       . "Personen:     $personen\n"
       . "Gelegenheid:  " . schoon($d['gelegenheid'] ?? '', 60) . "\n"
       . "Buffetten:    " . implode(' + ', $buffetten) . "\n"
       . "Indicatie:    EUR $pp p.p. / EUR $totaal totaal\n\n"
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
echo json_encode(['ok' => true]);
