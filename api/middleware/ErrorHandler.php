<?php
/**
 * ASTRA HEALTH API Error Handler.
 * Converts PHP errors/exceptions to JSON responses.
 */

declare(strict_types=1);

function handleException(Throwable $e): void
{
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $e->getMessage(),
    ]);
    exit;
}

function handleError(int $errno, string $errstr, string $errfile, int $errline): bool
{
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $errstr,
    ]);
    exit;
    return true;
}

// Register handlers
set_exception_handler('handleException');
set_error_handler('handleError');
