<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

$host = "localhost";
$username = "i601543_access_nfc";
$password = "9;Ae,.RDdX,~y.9d";
$dbname = "i601543_nfc";

function respond($success, $message, $data = null)
{
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    respond(false, 'Erreur de connexion DB: ' . $e->getMessage());
}

$resource = isset($_GET['resource']) ? strtolower(trim($_GET['resource'])) : null;
if (!$resource) {
    respond(false, 'Resource required, e.g., ?resource=users');
}

try {
    switch ($resource) {
        case 'users':
            $stmt = $pdo->query("SELECT BIN_TO_UUID(id, 1) AS cloud_uuid, BIN_TO_UUID(local_id, 1) AS local_uuid, name, email, created_at, updated_at FROM Users ORDER BY name");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            respond(true, 'All users fetched', $users);
            break;

        case 'user':
            if (!isset($_GET['uuid'])) {
                respond(false, 'Missing user id');
                break;
            }

            $uuid = $_GET['uuid'];

            $stmt = $pdo->prepare("SELECT BIN_TO_UUID(id, 1) AS cloud_uuid, BIN_TO_UUID(local_id, 1) AS local_uuid, name, email, created_at, updated_at FROM Users WHERE id = UUID_TO_BIN(:uuid, 1) LIMIT 1");
            $stmt->bindParam(':uuid', $uuid);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                respond(true, 'User fetched', $user);
            } else {
                respond(false, 'User not found');
            }
            break;
        case 'tags':
            $stmt = $pdo->query("SELECT * FROM Tags");
            $tags = $stmt->fetchAll(PDO::FETCH_ASSOC);
            respond(true, 'All tags fetched', $tags);
            break;

        case 'logs':
            $stmt = $pdo->query("  SELECT l.id, l.scanned_at, l.tag_id, BIN_TO_UUID(l.user_id, 1) AS cloud_uuid, u.name FROM ScanLogs l LEFT JOIN Users u ON l.user_id = u.id ORDER BY l.scanned_at DESC");
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            respond(true, 'All users fetched', $logs);
            break;

        default:
            respond(false, "Unknown resource: $resource");
    }
} catch (PDOException $e) {
    respond(false, 'Database error: ' . $e->getMessage());
}
