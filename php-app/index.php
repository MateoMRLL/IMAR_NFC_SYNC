<?php
session_start();

if (!isset($_SESSION['account'])) {
    header("Location: login.php");
    exit();
}

if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: login.php");
    exit();
}

require_once 'components/main-tile.php';
$page = $_GET['page'] ?? 'home';

function HomePage()
{
    echo '<div class="tiles-grid">';

    echo MainTile(
        "Admin Access",
        "Administration dashboard and user management",
        "Enter",
        "shield-check",
        "admin.php"
    );

    echo '</div>';
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NFC Management System</title>

    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <link rel="stylesheet" href="styles/main.css">
    <!-- Favicon references -->
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/favicon_io/android-chrome-192x192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="/favicon_io/android-chrome-512x512.png">
    <link rel="apple-touch-icon" href="/favicon_io/apple-touch-icon.png">
    <link rel="manifest" href="/favicon_io/site.webmanifest">

    <style>
        /* Updated styles for tile-based home page */
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

        .main-tile {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
        }

        .main-tile:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
            border-color: #3b82f6;
        }

        .tile-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }

        .icon-container {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 0.5rem;
        }

        .tile-icon {
            width: 32px;
            height: 32px;
            color: white;
        }

        .tile-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0;
        }

        .tile-description {
            color: #6b7280;
            font-size: 0.95rem;
            line-height: 1.5;
            margin: 0;
        }

        .tile-button {
            background: #f3f4f6;
            color: #374151;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            font-size: 0.9rem;
            margin-top: 0.5rem;
            transition: background-color 0.3s ease;
        }

        .main-tile:hover .tile-button {
            background: #3b82f6;
            color: white;
        }

        @media (max-width: 768px) {
            .app-container {
                padding: 1rem;
            }

            .tiles-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .main-tile {
                padding: 1.5rem;
            }
        }
    </style>
</head>

<body>
    <div class="app-container">
        <?php HomePage(); ?>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            lucide.createIcons();
        });
    </script>
</body>

</html>