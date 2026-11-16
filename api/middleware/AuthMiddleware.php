<?php
/**
 * Authentication middleware for PHP API.
 * Uses PHP sessions to authenticate users.
 */

declare(strict_types=1);

function requireAuth(): array
{
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }

    return [
        'user_id' => (int)$_SESSION['user_id'],
        'email' => $_SESSION['email'] ?? null,
        'role' => $_SESSION['role'] ?? null,
    ];
}
