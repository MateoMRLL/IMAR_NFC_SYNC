<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/src/Exception.php';
require __DIR__ . '/src/PHPMailer.php';
require __DIR__ . '/src/SMTP.php';

// ------------------------
// Configuration
// ------------------------
error_reporting(E_ALL);
ini_set('display_errors', 0); // hide errors in output
ini_set('log_errors', 1);     // log errors to server log
header('Content-Type: application/json; charset=utf-8');

session_start();
if (!isset($_SESSION['verificationCodes'])) {
    $_SESSION['verificationCodes'] = [];
}

const CODE_EXPIRATION = 10 * 60; // 10 minutes
const MAX_ATTEMPTS = 3;

// ------------------------
// Database configuration
// ------------------------
$dbHost = 'localhost';
$dbName = 'i601543_nfc';
$dbUser = 'i601543_access_nfc';
$dbPass = '9;Ae,.RDdX,~y.9d';

function getPDO() {
    global $dbHost, $dbName, $dbUser, $dbPass;
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $pdo;
}

// ------------------------
// PHPMailer function
// ------------------------
function sendMail($to, $subject, $body) {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'noreplynfc.imar@gmail.com';
        $mail->Password   = 'qcpodbitdbeozmrs';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->setFrom('noreplynfc.imar@gmail.com', 'Verification Service');
        $mail->addAddress($to);

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $body;

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Mailer Error: " . $e->getMessage());
        return false;
    }
}

// ------------------------
// Verification functions
// ------------------------
function generateVerificationCode($length = 6) {
    return strval(rand(pow(10, $length-1), pow(10, $length)-1));
}

// ------------------------
// Check if email exists
// ------------------------
function emailExists($email) {
    $pdo = getPDO();
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM Users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    return $stmt->fetchColumn() > 0;
}

// ------------------------
// Generate and send verification code
// ------------------------
function generateSendCode($userData) {
    if (empty($userData['name']) || empty($userData['email'])) {
        throw new Exception("Missing required fields");
    }

    // Check if email exists in database
    if (!emailExists($userData['email'])) {
        return ['success' => false, 'message' => 'Email not found in our records.'];
    }

    $code = generateVerificationCode();

    $_SESSION['verificationCodes'][$userData['email']] = [
        'code' => $code,
        'name' => $userData['name'],
        'timestamp' => time(),
        'attempts' => 0
    ];

    $subject = "Your Verification Code";
    $body = "Hello {$userData['name']},<br>Your verification code is <b>$code</b>.";

    $sent = sendMail($userData['email'], $subject, $body);
    return $sent ? ['success' => true, 'message' => 'Verification code sent'] 
                 : ['success' => false, 'message' => 'Error sending email'];
}

function verifyCode($userData) {
    if (empty($userData['email']) || empty($userData['code'])) {
        throw new Exception("Missing required fields");
    }

    $email = $userData['email'];
    $code = $userData['code'];

    if (!isset($_SESSION['verificationCodes'][$email])) {
        return ['success' => false, 'message' => 'Code expired or invalid'];
    }

    $storedData = $_SESSION['verificationCodes'][$email];

    if (time() - $storedData['timestamp'] > CODE_EXPIRATION) {
        unset($_SESSION['verificationCodes'][$email]);
        return ['success' => false, 'message' => 'Code expired'];
    }

    if ($storedData['attempts'] >= MAX_ATTEMPTS) {
        unset($_SESSION['verificationCodes'][$email]);
        return ['success' => false, 'message' => 'Too many attempts. Request a new code.'];
    }

    if ($storedData['code'] === $code) {
        unset($_SESSION['verificationCodes'][$email]);
        return ['success' => true, 'data' => ['name' => $storedData['name'], 'email' => $email]];
    }

    $_SESSION['verificationCodes'][$email]['attempts']++;
    $remaining = MAX_ATTEMPTS - $_SESSION['verificationCodes'][$email]['attempts'];
    return ['success' => false, 'message' => "Incorrect code. $remaining attempts remaining."];
}

function resendCode($userData) {
    if (empty($userData['email'])) {
        throw new Exception("Missing required fields");
    }

    $email = $userData['email'];

    if (!isset($_SESSION['verificationCodes'][$email])) {
        return ['success' => false, 'message' => 'No ongoing verification request for this email'];
    }

    $storedData = $_SESSION['verificationCodes'][$email];
    $newCode = generateVerificationCode();

    $_SESSION['verificationCodes'][$email] = [
        'code' => $newCode,
        'name' => $storedData['name'],
        'timestamp' => time(),
        'attempts' => 0
    ];

    $subject = "Your New Verification Code";
    $body = "Hello {$storedData['name']},<br>Your new verification code is <b>$newCode</b>.";

    $sent = sendMail($email, $subject, $body);
    return $sent ? ['success' => true, 'message' => 'New verification code sent'] 
                 : ['success' => false, 'message' => 'Error sending email'];
}

// ------------------------
// Database fetch functions
// ------------------------
function getUsers() {
    $pdo = getPDO();
    $stmt = $pdo->query("SELECT BIN_TO_UUID(id, 1) AS cloud_uuid, name, email, created_at, updated_at FROM Users ORDER BY name");
    return ['success' => true, 'message' => 'All users fetched', 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)];
}

function getUser($uuid) {
    $pdo = getPDO();
    $stmt = $pdo->prepare("SELECT BIN_TO_UUID(id, 1) AS cloud_uuid, name, email, created_at, updated_at FROM Users WHERE id = UUID_TO_BIN(:uuid, 1) LIMIT 1");
    $stmt->execute([':uuid' => $uuid]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return $user ? ['success' => true, 'message' => 'User fetched', 'data' => $user]
                 : ['success' => false, 'message' => 'User not found'];
}

// ------------------------
// Database assign/update
// ------------------------
function assignTag($data) {
    if (empty($data['email']) || empty($data['nfc_uid'])) {
        return ['success' => false, 'message' => 'Missing required fields: email or nfc_uid'];
    }

    $pdo = getPDO();

    // find user by email
    $stmt = $pdo->prepare("SELECT BIN_TO_UUID(id, 1) AS cloud_uuid FROM Users WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $data['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
        return ['success' => false, 'message' => 'User not found'];
    }

    try {
        // insert assignment
        $stmt = $pdo->prepare("INSERT INTO TagAssignments (tag_id, user_id) VALUES (:tag_id, UUID_TO_BIN(:cloud_uuid,1))");
        $stmt->execute([':tag_id' => $data['nfc_uid'], ':cloud_uuid' => $user['cloud_uuid']]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // duplicate entry
            return ['success' => false, 'message' => 'This NFC tag is already linked to a user'];
        }
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }

    // fetch the assignment
    $stmt = $pdo->prepare("SELECT tag_id, BIN_TO_UUID(user_id, 1) AS cloud_uuid, assigned_at FROM TagAssignments WHERE tag_id = :tag_id LIMIT 1");
    $stmt->execute([':tag_id' => $data['nfc_uid']]);
    $assignment = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$assignment) {
        return ['success' => false, 'message' => 'Failed to fetch assigned tag'];
    }

    return ['success' => true, 'message' => 'Tag assigned successfully', 'data' => $assignment];
}

// ------------------------
// Router
// ------------------------
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$payload = $method === 'POST' ? json_decode(file_get_contents('php://input'), true) : $_GET;

$response = [];

try {
    switch ($action) {
        case 'generate':
            $response = generateSendCode($payload);
            break;
        case 'verify':
            $response = verifyCode($payload);
            break;
        case 'resend':
            $response = resendCode($payload);
            break;
        case 'assign':
            $response = assignTag($payload);
            break;
        case 'users':
            $response = isset($payload['uuid']) ? getUser($payload['uuid']) : getUsers();
            break;
        default:
            $response = ['success' => false, 'message' => 'Invalid action'];
    }
} catch (Exception $e) {
    $response = ['success' => false, 'message' => $e->getMessage()];
}

// ------------------------
// Output JSON
// ------------------------
ob_clean();
echo json_encode($response);
exit;
