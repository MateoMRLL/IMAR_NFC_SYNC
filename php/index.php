<?php
session_start();

require_once 'components/MainTile.php';

$page = $_GET['page'] ?? 'home';

function HomePage() {
    echo '<div class="tiles-grid">';
    
    echo MainTile(
        "Create User",
        "Testing purpose", 
        "Register",
        "user",
        "?page=register"
    );
    
    echo MainTile(
        "Link",
        "Link your account to your NFC tag",
        "Register", 
        "user",
        "?page=link"
    );
    
    echo MainTile(
        "Admin Access",
        "Administration",
        "Enter",
        "shield-check", 
        "?page=admin"
    );
    
    echo '</div>';
}

function RegistrationPage() {
    echo "<div class='page-container'>"; 
    echo "<a href='?' class='back-button'>← Back to Home</a>";
    echo "</div>";
}

function AdminDashboard() {
    echo "
    <div class='page-container'>
        <h1>Admin Dashboard</h1>
        <p>Ici sera ton dashboard admin</p>
        <a href='?' class='back-button'>← Retour à l'accueil</a>
    </div>";
}

// Page Link Account - placeholder pour ta page de liaison
function LinkAccount() {
    echo "
    <div class='page-container'>
        <h1>Link Account</h1>
        <p>Ici sera ta page de liaison de compte</p>
        <a href='?' class='back-button'>← Retour à l'accueil</a>
    </div>";
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NFC Project</title>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <!-- CSS MainTile -->
    <link rel="stylesheet" href="assets/css/MainTile.css">
    <style>
        /* Styles généraux */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f3f4f6;
            min-height: 100vh;
        }

        .app-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .tiles-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            width: 100%;
            max-width: 1000px;
        }

        /* Styles pour les pages internes */
        .page-container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 100%;
        }

        .page-container h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: #1f2937;
        }

        .page-container p {
            color: #6b7280;
            margin-bottom: 2rem;
        }

        .back-button {
            display: inline-block;
            background: #6b7280;
            color: white;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            transition: background-color 0.3s ease;
        }

        .back-button:hover {
            background: #4b5563;
        }

        @media (max-width: 768px) {
            .app-container {
                padding: 1rem;
            }
            
            .tiles-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="app-container">
        <?php
        // Router principal - équivalent de <Routes> dans React
        switch($page) {
            case 'home':
            default:
                HomePage();
                break;
            case 'register':
                RegistrationPage();
                break;
            case 'admin':
                AdminDashboard();
                break;
            case 'link':
                LinkAccount();
                break;
        }
        ?>
    </div>

    <script>
        // Initialiser les icônes Lucide après le chargement
        document.addEventListener('DOMContentLoaded', function() {
            lucide.createIcons();
        });
    </script>
</body>
</html>