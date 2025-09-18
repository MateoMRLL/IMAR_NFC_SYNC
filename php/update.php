<?php

ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/log_err.log');
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

function respond($success, $message, $data = null)
{
  error_log("[$_SERVER[REQUEST_URI]] $message");
  if ($data !== null) {
    error_log("Payload  : " . print_r($data, true));
  }
  echo json_encode([
    'success' => $success,
    'message' => $message,
    'data' => $data
  ]);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  respond(false, 'Only POST allowed');
}

$input = file_get_contents('php://input');
error_log("Raw input: " . $input);

$data = json_decode($input, true);
if (!$data || !isset($data['resource'], $data['payload'])) {
  respond(false, 'Expected format: {"resource":"...", "payload":{...}}', null);
}

$resource = strtolower(trim($data['resource']));
$payload = $data['payload'];

$dbHost = "localhost";
$dbUser = "i601543_access_nfc";
$dbPass = "9;Ae,.RDdX,~y.9d";
$dbName = "i601543_nfc";

switch ($resource) {
  case 'user':
    //get name, email and local_uuid sent by the dataSender

    if (!isset($payload['name'], $payload['email'], $payload['local_uuid'])) {
      respond(false, 'Payload must contain name, email and local_uuid', $payload);
    }

    try {
      $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
      $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

      //insert name, email, local_id in the cloud database (careful with the UUID_TO_BIN function and flag)

      $stmt = $pdo->prepare("
                INSERT INTO Users (name, email, local_id) 
                VALUES (:name, :email, UUID_TO_BIN(:local_uuid, 1))
            ");
      $stmt->execute([
        ':name' => $payload['name'],
        ':email' => $payload['email'],
        ':local_uuid' => $payload['local_uuid']
      ]);

      //get the cloud_uuid (through the BIN_TO_UUID) because when we insert an id is generated
      // Is it better to use local_id to do the request rather than the email ?

      $stmt = $pdo->prepare("SELECT BIN_TO_UUID(id,1) AS cloud_uuid FROM Users WHERE email = :email LIMIT 1");
      $stmt->execute([':email' => $payload['email']]);
      $cloudUser = $stmt->fetch(PDO::FETCH_ASSOC);

      //we respond with the cloud_uuid
      respond(true, 'User inserted successfully.', [
        'cloud_uuid' => $cloudUser['cloud_uuid'] ?? null,
      ]);


    } catch (PDOException $e) {
      error_log("PDO Exception: " . $e->getMessage());
      respond(false, 'DB error: ' . $e->getMessage(), null);
    }

  case 'tag':
    //get name, email and local_uuid sent by the dataSender

    if (!isset($payload['uid'])) {
      respond(false, 'Payload must contain uid', $payload);
    }

    try {
      $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
      $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

      $stmt = $pdo->prepare("
                INSERT INTO Tags (uid) 
                VALUES (:uid)
            ");
      $stmt->execute([
        ':uid' => $payload['uid'],
      ]);

      respond(true, 'Tag inserted successfully.');


    } catch (PDOException $e) {
      error_log("PDO Exception: " . $e->getMessage());
      respond(false, 'DB error: ' . $e->getMessage(), null);
    }

  case 'assign':

    if (!isset($payload['cloud_uuid'], $payload['nfc_uid'])) {
      respond(false, 'Payload must contain cloud_uuid and nfc_uid', $payload);
    }

    try {
      $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
      $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

      $stmt = $pdo->prepare("
      INSERT INTO TagAssignments (tag_id, user_id) 
      VALUES (:tag_id, UUID_TO_BIN(:cloud_uuid, 1))
    ");
      $stmt->execute([
        ':tag_id' => $payload['nfc_uid'],
        ':cloud_uuid' => $payload['cloud_uuid']
      ]);

      // Récupérer l’assignation avec conversion en UUID lisible
      $stmt = $pdo->prepare("
        SELECT 
          tag_id,
          BIN_TO_UUID(user_id, 1) AS cloud_uuid,
          assigned_at
        FROM TagAssignments
        WHERE tag_id = :tag_id
        LIMIT 1
      ");
      $stmt->execute([':tag_id' => $payload['nfc_uid']]);
      $assignment = $stmt->fetch(PDO::FETCH_ASSOC);

      respond(true, 'Assignment created successfully.', $assignment);

    } catch (PDOException $e) {
      error_log("PDO Exception: " . $e->getMessage());
      respond(false, 'DB error: ' . $e->getMessage(), null);
    }
    break;
  case 'scan':

    if (!isset($payload['uid'], $payload['cloud_uuid'], $payload['timestamp'])) {
      respond(false, 'Payload must contain uid, cloud_uuid, and timestamp', $payload);
    }

    try {
      $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
      $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

      // Insérer le scan log dans la base cloud
      $stmt = $pdo->prepare("
            INSERT INTO ScanLogs (tag_id, user_id, scanned_at) 
            VALUES (:tag_id, UUID_TO_BIN(:user_id, 1), :scanned_at)
        ");
      $stmt->execute([
        ':tag_id' => $payload['uid'],
        ':user_id' => $payload['cloud_uuid'],
        ':scanned_at' => $payload['timestamp'],
      ]);

      // Récupérer le log inséré
      $stmt = $pdo->prepare("
            SELECT 
                tag_id,
                BIN_TO_UUID(user_id, 1) AS cloud_uuid,
                scanned_at
            FROM ScanLogs
            WHERE tag_id = :tag_id AND user_id = UUID_TO_BIN(:user_id, 1)
            ORDER BY scanned_at DESC
            LIMIT 1
        ");
      $stmt->execute([
        ':tag_id' => $payload['uid'],
        ':user_id' => $payload['cloud_uuid'],
      ]);

      $scanLog = $stmt->fetch(PDO::FETCH_ASSOC);

      respond(true, 'Scan log inserted successfully.', $scanLog);

    } catch (PDOException $e) {
      error_log("PDO Exception: " . $e->getMessage());
      respond(false, 'DB error: ' . $e->getMessage(), null);
    }
    break;


  default:
    respond(true, "Data received for resource '$resource'", [
      'resource' => $resource,
      'payload' => $payload
    ]);
    break;
}
