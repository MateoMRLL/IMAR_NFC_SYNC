<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - NFC Management System</title>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <link rel="stylesheet" href="styles/main.css">
    <style>
        /* Updated styles to match main page design */
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
        }

        .admin-login-container {
            height: 100%;
            width: 100%;
            display: flex;
            flex-direction: column;
            margin: 0 auto;
            padding: 2rem;
            justify-content: center;
            align-items: center;
            gap: 2rem;
        }

        .login-dashboard-tile {
            background: white;
            border-radius: 16px;
            padding: 2.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
            width: 100%;
            max-width: 400px;
            text-align: center;
        }

        .shield-icon {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem auto;
        }

        .shield {
            width: 32px;
            height: 32px;
            fill: white;
        }

        .title {
            color: #1f2937;
            font-size: 1.75rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
        }

        .subtitle {
            color: #6b7280;
            margin: 0 0 2rem 0;
            font-size: 0.95rem;
            line-height: 1.5;
        }

        .error-message {
            background: #fef2f2;
            color: #dc2626;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            border: 1px solid #fecaca;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            text-align: left;
        }

        .form-label {
            color: #374151;
            font-weight: 500;
            font-size: 0.9rem;
        }

        .form-input {
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .form-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .button-group {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-top: 2rem;
        }

        .btn {
            padding: 0.875rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-secondary {
            background: #f3f4f6;
            color: #374151;
        }

        .btn-secondary:hover {
            background: #e5e7eb;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
            .admin-login-container {
                padding: 1rem;
            }

            .login-dashboard-tile {
                padding: 2rem;
            }
        }
    </style>
</head>

<body>
    <div class="admin-login-container">
        <?php include 'components/home-button.php'; ?>
        <?php include 'components/dashboard.php'; ?>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            lucide.createIcons();
        });
    </script>
</body>

</html>