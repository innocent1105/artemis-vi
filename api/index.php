<?php
/**
 * ASTRA HEALTH API Front Controller.
 * All API requests route through this file.
 */

declare(strict_types=1);

// Start session for auth (must be before any output)
if (session_status() === PHP_SESSION_NONE) {
    // Set secure cookie parameters before starting session
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_secure', '0'); // Set to 1 in production with HTTPS
    ini_set('session.cookie_samesite', 'Lax');
    ini_set('session.use_strict_mode', '1');
    session_start();
}

// Load middleware
require_once __DIR__ . '/middleware/ErrorHandler.php';
require_once __DIR__ . '/middleware/CorsMiddleware.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';

// Apply CORS (sets headers and handles OPTIONS preflight)
applyCors();

// Parse request
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$rawUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($rawUri, PHP_URL_PATH) ?? '/';

// Remove /api prefix
$path = preg_replace('|^/api|', '', $path);

// CSRF protection for state-changing requests (login/register are exempt — they establish the session and issue the token)
    if ($path !== '/auth/login' && $path !== '/auth/register' && in_array($method, ['POST', 'PUT', 'DELETE', 'PATCH'], true)) {
    $csrfToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $sessionToken = $_SESSION['csrf_token'] ?? '';
    $tokenTime = $_SESSION['csrf_token_time'] ?? 0;

    if (!$csrfToken || !$sessionToken || $csrfToken !== $sessionToken) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'CSRF token mismatch or missing']);
        exit;
    }

    // Token expires after 1 hour
    if (time() - $tokenTime > 3600) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'CSRF token expired']);
        exit;
    }
}

// Route matching
if ($path === '/health' && $method === 'GET') {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'ok', 'service' => 'astra-health-api']);
    exit;
}

if ($path === '/auth/login' && $method === 'POST') {
    require_once __DIR__ . '/controllers/AuthController.php';
    login();
    exit;
}

if ($path === '/auth/register' && $method === 'POST') {
    require_once __DIR__ . '/controllers/AuthController.php';
    register();
    exit;
}

if ($path === '/auth/me' && $method === 'GET') {
    require_once __DIR__ . '/controllers/AuthController.php';
    me();
    exit;
}

if ($path === '/auth/logout' && $method === 'POST') {
    require_once __DIR__ . '/controllers/AuthController.php';
    logout();
    exit;
}

if ($path === '/auth/profile' && $method === 'GET') {
    require_once __DIR__ . '/controllers/AuthController.php';
    profile();
    exit;
}

if ($path === '/auth/profile' && $method === 'PATCH') {
    require_once __DIR__ . '/controllers/AuthController.php';
    updateProfile();
    exit;
}

if ($path === '/auth/password-change' && $method === 'POST') {
    require_once __DIR__ . '/controllers/AuthController.php';
    changePassword();
    exit;
}

if (preg_match('|^/assessments$|', $path) && $method === 'GET') {
    require_once __DIR__ . '/controllers/AssessmentController.php';
    index();
    exit;
}

if (preg_match('|^/assessments$|', $path) && $method === 'POST') {
    require_once __DIR__ . '/controllers/AssessmentController.php';
    store();
    exit;
}

if (preg_match('|^/assessments/([^/]+)$|', $path, $matches) && $method === 'GET') {
    require_once __DIR__ . '/controllers/AssessmentController.php';
    show($matches[1]);
    exit;
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['error' => 'Not found']);
