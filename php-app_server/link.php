<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Link Account - NFC System</title>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <link rel="stylesheet" href="styles/main.css">
<style>
body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    min-height: 100vh;
}
.linkpage-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
}
.user-info-card {
    background: white;
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
    width: 100%;
    max-width: 500px;
}
.user-info-header {
    text-align: center;
    margin-bottom: 2rem;
}
.icon-circle {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem auto;
}
.icon-circle.success {
    background: linear-gradient(135deg, #10b981, #059669);
}
.icon-main,
.icon-success {
    color: white;
    width: 32px;
    height: 32px;
}
.user-info-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}
.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.form-group label {
    color: #374151;
    font-weight: 500;
    font-size: 0.9rem;
}
.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}
.input-icon {
    position: absolute;
    left: 0.75rem;
    color: #9ca3af;
    z-index: 1;
}
.input-wrapper input {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    box-sizing: border-box;
}
.input-wrapper input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.submit-btn {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}
.submit-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.popup {
    display: none;
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 500;
    color: white;
    z-index: 9999;
}
.popup.success {
    background: #16a34a;
}
.popup.error {
    background: #dc2626;
}
.user-info-footer {
    text-align: center;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
    color: #6b7280;
    font-size: 0.85rem;
}
</style>
</head>

<body>
<div class="linkpage-container">
    <div class="user-info-card">
        <div class="user-info-header">
            <div class="icon-circle"><i data-lucide="user" class="icon-main"></i></div>
            <h2>Code checking</h2>
            <p>Please check your email address</p>
        </div>

        <!-- Step 1 -->
        <form id="step1-form" class="user-info-form">
            <div class="form-group">
                <label for="lastname">Last Name</label>
                <div class="input-wrapper">
                    <i data-lucide="user" class="input-icon"></i>
                    <input type="text" id="lastname" name="lastname" required>
                </div>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <div class="input-wrapper">
                    <i data-lucide="mail" class="input-icon"></i>
                    <input type="email" id="email" name="email" required>
                </div>
            </div>
            <div class="form-group">
                <label for="nfcUid">NFC UID</label>
                <div class="input-wrapper">
                    <i data-lucide="credit-card" class="input-icon"></i>
                    <input type="text" id="nfcUid" name="nfcUid" required>
                </div>
            </div>
            <button type="submit" class="submit-btn">Continue</button>
        </form>

        <!-- Step 2 -->
        <form id="step2-form" class="user-info-form" style="display:none;">
            <div class="form-group">
                <label for="verificationCode">Verification Code</label>
                <div class="input-wrapper">
                    <i data-lucide="x-circle" class="input-icon"></i>
                    <input type="text" id="verificationCode" name="verificationCode" required>
                </div>
            </div>
            <button type="submit" class="submit-btn">Verify & Link</button>
            <p style="font-size:0.85rem;color:#6b7280;">If your code expires, go back and request a new one.</p>
        </form>

        <div class="user-info-footer">
            Your information is handled securely and confidentially.
        </div>
    </div>
</div>

<!-- Popup Notification -->
<div id="popup" class="popup"></div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    lucide.createIcons();

    const API_URL = "phpmailer/mailer.php";
    const step1Form = document.getElementById('step1-form');
    const step2Form = document.getElementById('step2-form');
    const popup = document.getElementById('popup');

    let nfcUidGlobal = '';

    function showPopup(message, type = 'success') {
        popup.textContent = message;
        popup.className = 'popup ' + type;
        popup.style.display = 'block';
        setTimeout(() => popup.style.display = 'none', 3000);
    }

    // Step 1: Send verification code
    step1Form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const lastname = document.getElementById('lastname').value.trim();
        const email = document.getElementById('email').value.trim();
        const nfcUid = document.getElementById('nfcUid').value.trim();

        if (!nfcUid) {
            showPopup("Please enter your NFC UID.", "error");
            return;
        }

        nfcUidGlobal = nfcUid;

        try {
            const response = await fetch(`${API_URL}?action=generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: lastname, email })
            });
            const data = await response.json();

            if (!data.success) throw new Error(data.message || "Unable to send verification email.");

            showPopup("Verification email sent. Check your inbox.");
            step1Form.style.display = 'none';
            step2Form.style.display = 'flex';
        } catch (err) {
            showPopup(err.message, 'error');
        }
    });

    // Step 2: Verify code & link NFC
    step2Form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const code = document.getElementById('verificationCode').value.trim();

        if (!nfcUidGlobal) {
            showPopup("NFC UID is missing.", "error");
            return;
        }

        try {
            const verifyResponse = await fetch(`${API_URL}?action=verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });
            const verifyData = await verifyResponse.json();

            if (!verifyData.success) {
                if (verifyData.message.includes('expired')) {
                    showPopup(verifyData.message + " Please go back and request a new code.", 'error');
                    step2Form.style.display = 'none';
                    step1Form.style.display = 'flex';
                } else {
                    showPopup(verifyData.message, 'error');
                }
                return;
            }

            const assignResponse = await fetch(`${API_URL}?action=assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, nfc_uid: nfcUidGlobal })
            });
            const assignData = await assignResponse.json();

            if (!assignData.success) {
                if (assignData.message.includes('Duplicate entry')) {
                    showPopup("This email is already linked to a tag.", 'error');
                } else {
                    showPopup(assignData.message || "Failed to link NFC tag.", 'error');
                }
                return;
            }

            showPopup(`Success! Your tag ${nfcUidGlobal} is linked to ${email}.`, 'success');
            step2Form.style.display = 'none';

            const iconCircle = document.querySelector('.icon-circle');
            iconCircle.classList.add('success');
            iconCircle.innerHTML = '<i data-lucide="check" class="icon-success"></i>';
            lucide.createIcons();

        } catch (err) {
            showPopup(err.message, 'error');
        }
    });
});
</script>
</body>
</html>
