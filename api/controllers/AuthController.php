<?php
/**
 * Auth controller for PHP API.
 * Handles login, logout, and current user retrieval.
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

function login(): void
{
    header('Content-Type: application/json');

    $input = json_decode(file_get_contents('php://input'), true);
    $email = strtolower(trim($input['email'] ?? ''));
    $password = $input['password'] ?? '';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        return;
    }

    try {
        $pdo = getDbConnection();

        // Find user by email
        $stmt = $pdo->prepare("SELECT u.id, u.email, u.password_hash, u.is_active FROM users u WHERE u.email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            return;
        }

        if (!$user['is_active']) {
            http_response_code(403);
            echo json_encode(['error' => 'Account is deactivated']);
            return;
        }

        // Get user roles
        $stmt = $pdo->prepare("SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?");
        $stmt->execute([$user['id']]);
        $roles = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $role = $roles[0] ?? 'astronaut';

        // Start session (if not already started)
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Regenerate session ID to prevent session fixation
        session_regenerate_id(true);

        // Generate CSRF token
        $csrfToken = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $csrfToken;
        $_SESSION['csrf_token_time'] = time();

        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $role;

        // Update last login
        $stmt = $pdo->prepare("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$user['id']]);

        echo json_encode([
            'user' => [
                'id' => (int)$user['id'],
                'email' => $user['email'],
                'role' => $role,
            ],
            'csrfToken' => $csrfToken,
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function register(): void
{
    header('Content-Type: application/json');

    $input = json_decode(file_get_contents('php://input'), true);
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $fullName = trim($input['full_name'] ?? '');

    // Validate required fields
    if (empty($email) || empty($password) || empty($fullName)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email, password, and full name are required']);
        return;
    }

    // Normalize email to lowercase
    $email = strtolower($email);

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email address']);
        return;
    }

    // Validate password strength
    if (strlen($password) < 8) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 8 characters']);
        return;
    }

    try {
        $pdo = getDbConnection();
        $pdo->beginTransaction();

        // Check for duplicate email (case-insensitive check on normalized email)
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $pdo->rollBack();
            http_response_code(409);
            echo json_encode(['error' => 'An account with this email already exists']);
            return;
        }

        // Hash password
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        // Generate UUID v4 using cryptographically secure randomness
        $bytes = random_bytes(16);
        $bytes[6] = chr(ord($bytes[6]) & 0x0f | 0x40); // set version to 4
        $bytes[8] = chr(ord($bytes[8]) & 0x3f | 0x80); // set variant to 10xx
        $hex = bin2hex($bytes);
        $userUuid = sprintf('%s-%s-%s-%s-%s',
            substr($hex, 0, 8),
            substr($hex, 8, 4),
            substr($hex, 12, 4),
            substr($hex, 16, 4),
            substr($hex, 20, 12)
        );

        // Insert user
        $stmt = $pdo->prepare(
            "INSERT INTO users (uuid, email, password_hash, is_active, email_verified, created_at, updated_at)
             VALUES (?, ?, ?, TRUE, FALSE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))"
        );
        $stmt->execute([$userUuid, $email, $passwordHash]);
        $userId = (int)$pdo->lastInsertId();

        // Get astronaut role ID
        $stmt = $pdo->prepare("SELECT id FROM roles WHERE name = 'astronaut'");
        $stmt->execute();
        $roleRow = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$roleRow) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'System configuration error']);
            return;
        }
        $astronautRoleId = (int)$roleRow['id'];

        // Assign astronaut role to user
        $stmt = $pdo->prepare(
            "INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES (?, ?, CURRENT_TIMESTAMP(3))"
        );
        $stmt->execute([$userId, $astronautRoleId]);

        // Create astronaut profile with pending approval
        $stmt = $pdo->prepare(
            "INSERT INTO astronaut_profiles (user_id, full_name, approval_status, created_at, updated_at)
             VALUES (?, ?, 'pending', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))"
        );
        $stmt->execute([$userId, $fullName]);

        $pdo->commit();

        http_response_code(201);
        echo json_encode([
            'user' => [
                'id' => $userId,
                'email' => $email,
                'role' => 'astronaut',
            ],
            'message' => 'Registration successful. Your account is pending approval.',
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Registration failed']);
    }
}

function me(): void
{
    header('Content-Type: application/json');

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
        return;
    }

    echo json_encode([
        'user' => [
            'id' => (int)$_SESSION['user_id'],
            'email' => $_SESSION['email'] ?? null,
            'role' => $_SESSION['role'] ?? 'astronaut',
        ],
    ]);
}

function logout(): void
{
    header('Content-Type: application/json');

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    session_destroy();

    echo json_encode(['success' => true]);
}

function profile(): void
{
    header('Content-Type: application/json');

    $user = requireAuth();

    try {
        $pdo = getDbConnection();

        $stmt = $pdo->prepare(
            "SELECT u.id, u.email, u.uuid, ap.full_name, ap.astronaut_id, ap.approval_status
             FROM users u
             LEFT JOIN astronaut_profiles ap ON ap.user_id = u.id
             WHERE u.id = ?"
        );
        $stmt->execute([$user['user_id']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Profile not found']);
            return;
        }

        echo json_encode([
            'user' => [
                'id' => (int)$row['id'],
                'email' => $row['email'],
                'full_name' => $row['full_name'] ?? null,
                'astronaut_id' => $row['astronaut_id'] ?? null,
                'approval_status' => $row['approval_status'] ?? null,
            ],
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function updateProfile(): void
{
    header('Content-Type: application/json');

    $user = requireAuth();

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON body']);
        return;
    }

    // Only full_name is permitted.
    $allowedFields = ['full_name'];
    foreach ($input as $key => $_value) {
        if (!in_array($key, $allowedFields, true)) {
            http_response_code(400);
            echo json_encode(['error' => "Unsupported field: $key"]);
            return;
        }
    }

    if (!isset($input['full_name']) || !is_string($input['full_name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'full_name is required']);
        return;
    }

    $fullName = trim($input['full_name']);
    if ($fullName === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Full name must not be empty']);
        return;
    }

    if (strlen($fullName) < 2) {
        http_response_code(400);
        echo json_encode(['error' => 'Full name must be at least 2 characters']);
        return;
    }

    try {
        $pdo = getDbConnection();
        $transactionActive = false;

        try {
            $pdo->beginTransaction();
            $transactionActive = true;

            $stmt = $pdo->prepare(
                "UPDATE astronaut_profiles SET full_name = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE user_id = ?"
            );
            $stmt->execute([$fullName, $user['user_id']]);

            $stmt = $pdo->prepare(
                "UPDATE users SET updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?"
            );
            $stmt->execute([$user['user_id']]);

            $pdo->commit();
        } catch (\Throwable $e) {
            if ($transactionActive) {
                $pdo->rollBack();
            }
            throw $e;
        }

        // Refetch the complete profile so astronaut_id and approval_status are preserved.
        $stmt = $pdo->prepare(
            "SELECT u.id, u.email, ap.full_name, ap.astronaut_id, ap.approval_status
             FROM users u
             LEFT JOIN astronaut_profiles ap ON ap.user_id = u.id
             WHERE u.id = ?"
        );
        $stmt->execute([$user['user_id']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Profile not found']);
            return;
        }

        echo json_encode([
            'user' => [
                'id' => (int)$row['id'],
                'email' => $row['email'],
                'full_name' => $row['full_name'] ?? null,
                'astronaut_id' => $row['astronaut_id'] ?? null,
                'approval_status' => $row['approval_status'] ?? null,
            ],
            'message' => 'Profile updated successfully',
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function changePassword(): void
{
    header('Content-Type: application/json');

    $user = requireAuth();

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON body']);
        return;
    }

    $currentPassword = $input['current_password'] ?? null;
    $newPassword = $input['new_password'] ?? null;
    $confirmPassword = $input['password_confirmation'] ?? null;

    if (!is_string($currentPassword) || !is_string($newPassword) || !is_string($confirmPassword)) {
        http_response_code(400);
        echo json_encode(['error' => 'current_password, new_password, and password_confirmation must be strings']);
        return;
    }

    if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
        http_response_code(400);
        echo json_encode(['error' => 'Current password, new password, and confirmation are required']);
        return;
    }

    if ($newPassword !== $confirmPassword) {
        http_response_code(400);
        echo json_encode(['error' => 'New password and confirmation do not match']);
        return;
    }

    if (strlen($newPassword) < 8) {
        http_response_code(400);
        echo json_encode(['error' => 'New password must be at least 8 characters']);
        return;
    }

    if ($currentPassword === $newPassword) {
        http_response_code(400);
        echo json_encode(['error' => 'New password must differ from current password']);
        return;
    }

    try {
        $pdo = getDbConnection();

        $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
        $stmt->execute([$user['user_id']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row || !password_verify($currentPassword, $row['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Current password is incorrect']);
            return;
        }

        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare(
            "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?"
        );
        $stmt->execute([$newHash, $user['user_id']]);

        // Regenerate session ID after successful password change.
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        session_regenerate_id(true);

        echo json_encode([
            'success' => true,
            'message' => 'Password changed successfully',
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}
