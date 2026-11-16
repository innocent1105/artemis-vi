<?php
/**
 * Database configuration for PHP API.
 * Reads connection settings from environment variables.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/DatabaseConfig.php';

use Astra\Database\DatabaseConfig;

// Load .env file if environment variables are not set
$envFile = __DIR__ . '/../../.env';
if (is_file($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (strpos($line, '#') === 0 || strpos($line, '=') === false) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        putenv(trim($key) . '=' . trim($value));
        $_ENV[trim($key)] = trim($value);
        $_SERVER[trim($key)] = trim($value);
    }
}

function getDbConnection(): PDO
{
    $config = new DatabaseConfig();
    return new PDO(
        $config->getDsn(),
        $config->getUser(),
        $config->getPassword(),
        $config->getOptions()
    );
}
