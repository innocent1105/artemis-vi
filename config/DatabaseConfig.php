<?php

declare(strict_types=1);

namespace Astra\Database;

use PDO;

/**
 * Database configuration component.
 *
 * Reads connection settings from environment variables using getenv() with
 * fallback to $_ENV and $_SERVER. Never hardcodes credentials. Fails safely
 * with a clear, concise error when required configuration is missing.
 */
class DatabaseConfig
{
    private array $config;

    public function __construct()
    {
        $this->config = [
            'host'     => $this->getEnv('ASTRA_DB_HOST'),
            'port'     => $this->getEnv('ASTRA_DB_PORT'),
            'dbname'   => $this->getEnv('ASTRA_DB_NAME'),
            'user'     => $this->getEnv('ASTRA_DB_USER'),
            'password' => $this->getEnv('ASTRA_DB_PASSWORD'),
        ];

        $this->validate();
    }

    private function getEnv(string $name): ?string
    {
        $value = getenv($name);
        if ($value !== false && $value !== '') {
            return $value;
        }

        $value = $_ENV[$name] ?? null;
        if ($value !== null && $value !== '') {
            return $value;
        }

        $value = $_SERVER[$name] ?? null;
        if ($value !== null && $value !== '') {
            return $value;
        }

        // Fallback: read from .env file
        $envFile = __DIR__ . '/../.env';
        if (is_file($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (strpos($line, '#') === 0 || strpos($line, '=') === false) {
                    continue;
                }
                [$key, $value] = explode('=', $line, 2);
                if (trim($key) === $name) {
                    return trim($value, '"');
                }
            }
        }

        return null;
    }

    private function validate(): void
    {
        $envVarNames = [
            'host'     => 'ASTRA_DB_HOST',
            'port'     => 'ASTRA_DB_PORT',
            'dbname'   => 'ASTRA_DB_NAME',
            'user'     => 'ASTRA_DB_USER',
            'password' => 'ASTRA_DB_PASSWORD',
        ];

        $missing = [];
        foreach ($this->config as $key => $value) {
            if ($value === null || $value === '') {
                $missing[] = $envVarNames[$key];
            }
        }

        if ($missing !== []) {
            error_log(
                'Error: Missing required database configuration: ' .
                implode(', ', $missing) .
                '. Set these environment variables before running migrations.'
            );
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Missing database configuration']);
            exit;
        }

        // Validate port is numeric.
        if (!ctype_digit((string) $this->config['port'])) {
            error_log('Error: ASTRA_DB_PORT must be a numeric port value.');
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Invalid port configuration']);
            exit;
        }
    }

    public function getDsn(): string
    {
        return sprintf(
            'pgsql:host=%s;port=%d;dbname=%s',
            $this->config['host'],
            (int) $this->config['port'],
            $this->config['dbname']
        );
    }

    public function getUser(): string
    {
        return $this->config['user'];
    }

    public function getPassword(): string
    {
        return $this->config['password'];
    }

    public function getOptions(): array
    {
        return [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
    }
}
