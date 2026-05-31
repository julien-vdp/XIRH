<?php
header('Content-Type: text/plain');
echo "=== Diagnostic Connexion Base de Données ===\n";

$host = getenv('MOODLE_DB_HOST');
$name = getenv('MOODLE_DB_NAME');
$user = getenv('MOODLE_DB_USER');
$pass = getenv('MOODLE_DB_PASS');
$port = getenv('MOODLE_DB_PORT') ?: '5432';

echo "MOODLE_DB_HOST: " . ($host ?: "[NON DÉFINI]") . "\n";
echo "MOODLE_DB_NAME: " . ($name ?: "[NON DÉFINI]") . "\n";
echo "MOODLE_DB_USER: " . ($user ?: "[NON DÉFINI]") . "\n";
echo "MOODLE_DB_PASS: " . ($pass ? "[DÉFINI (masqué)]" : "[VIDE ou NON DÉFINI]") . "\n";
echo "MOODLE_DB_PORT: " . $port . "\n";

try {
    echo "Tentative de connexion PDO...\n";
    $dsn = "pgsql:host=$host;port=$port;dbname=$name";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    echo "SUCCESS: Connexion établie avec succès !\n";
} catch (Exception $e) {
    echo "ERROR: La connexion a échoué.\n";
    echo "Message d'erreur : " . $e->getMessage() . "\n";
}
