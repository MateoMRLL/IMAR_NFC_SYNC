<?php
include 'core.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['account'])) {
    header("Location: login.php");
    exit();
}

$emailError = '';
$emailSuccess = '';
$passwordError = '';
$passwordSuccess = '';

// Handle email change
if (isset($_POST['change_email'])) {
    $newEmail = filter_var($_POST['new_email'], FILTER_SANITIZE_EMAIL);
    $confirmEmail = filter_var($_POST['confirm_email'], FILTER_SANITIZE_EMAIL);
    
    if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
        $emailError = "Invalid email format";
    } elseif ($newEmail !== $confirmEmail) {
        $emailError = "Emails do not match";
    } else {
        // Check if email already exists
        $stmt = $connection->prepare("SELECT id FROM GlobalUsers WHERE email = ? AND id != ?");
        $stmt->bind_param("si", $newEmail, $_SESSION['account']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $emailError = "Email already in use";
        } else {
            // Update email
            $updateStmt = $connection->prepare("UPDATE GlobalUsers SET email = ? WHERE id = ?");
            $updateStmt->bind_param("si", $newEmail, $_SESSION['account']);
            if ($updateStmt->execute()) {
                $_SESSION['email'] = $newEmail;
                $emailSuccess = "Email updated successfully";
            } else {
                $emailError = "Error updating email";
            }
            $updateStmt->close();
        }
        $stmt->close();
    }
}

// Handle password change - FIXED
if (isset($_POST['change_password'])) {
    $newPassword = $_POST['new_password'];
    $confirmPassword = $_POST['confirm_password'];
    
    if (strlen($newPassword) < 6) {
        $passwordError = "Password must be at least 6 characters long";
    } elseif ($newPassword !== $confirmPassword) {
        $passwordError = "Passwords do not match";
    } else {
        // Hash the new password and update
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        // FIXED: Use correct session variable and table name
        $stmt = $connection->prepare("UPDATE GlobalUsers SET password = ? WHERE id = ?");
        $stmt->bind_param("si", $hashedPassword, $_SESSION['account']);
        
        if ($stmt->execute()) {
            $passwordSuccess = "Password updated successfully";
        } else {
            $passwordError = "Error updating password";
        }
        $stmt->close();
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Settings</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    
</head>
<body class="bg-light">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark">
        <a class="navbar-brand" href="#">Cloud Sensor</a>
        <img src="images/IMaR_logo.jpg" alt="Logo">
        <div class="ms-auto d-flex align-items-center">
            <a href="index.php" class="btn btn-light me-3">Back to Dashboard</a>
            <a class="btn account-btn me-3" href="#">Account</a>
            <a class="btn logout-btn" href="index.php?logout=1">Logout</a>
        </div>
    </nav>
    
    <div class="dark-mode-container">
        <button id="dark-mode-toggle" class="btn btn-secondary">Dark Mode</button>
    </div>

    <div class="container">
        <div class="settings-container">
            <h2 class="text-center mb-4">Account Settings</h2>
            <!-- Change Email Section -->
            <div class="mb-5">
                <h3>Change Email</h3>
                <?php if ($emailError): ?>
                    <div class="alert alert-danger"><?php echo $emailError; ?></div>
                <?php endif; ?>
                <?php if ($emailSuccess): ?>
                    <div class="alert alert-success"><?php echo $emailSuccess; ?></div>
                <?php endif; ?>
                <form method="POST" action="">
                    <div class="mb-3">
                        <label for="new_email" class="form-label">New Email</label>
                        <input type="email" class="form-control" id="new_email" name="new_email" required>
                    </div>
                    <div class="mb-3">
                        <label for="confirm_email" class="form-label">Confirm New Email</label>
                        <input type="email" class="form-control" id="confirm_email" name="confirm_email" required>
                    </div>
                    <button type="submit" name="change_email" class="btn btn-primary">Update Email</button>
                </form>
            </div>

            <!-- Change Password Section -->
            <div>
                <h3>Change Password</h3>
                <?php if ($passwordError): ?>
                    <div class="alert alert-danger"><?php echo $passwordError; ?></div>
                <?php endif; ?>
                <?php if ($passwordSuccess): ?>
                    <div class="alert alert-success"><?php echo $passwordSuccess; ?></div>
                <?php endif; ?>
                <form method="POST" action="">
                    <div class="mb-3">
                        <label for="new_password" class="form-label">New Password</label>
                        <input type="password" class="form-control" id="new_password" name="new_password" required>
                    </div>
                    <div class="mb-3">
                        <label for="confirm_password" class="form-label">Confirm New Password</label>
                        <input type="password" class="form-control" id="confirm_password" name="confirm_password" required>
                    </div>
                    <button type="submit" name="change_password" class="btn btn-primary">Update Password</button>
                </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
