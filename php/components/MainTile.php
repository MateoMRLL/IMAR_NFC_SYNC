<?php
// components/MainTile.php

function MainTile($title, $description, $buttonText, $icon, $link) {
    $title = htmlspecialchars($title);
    $description = htmlspecialchars($description);
    $buttonText = htmlspecialchars($buttonText);
    $icon = htmlspecialchars($icon);
    $link = htmlspecialchars($link);
    
    return "
    <div class='login-container'>
        <div class='login-card' onclick=\"window.location.href='$link'\">
            <div class='icon-wrapper'>
                <div class='icon-background'>
                    <i data-lucide='$icon' class='user-icon'></i>
                </div>
            </div>
            <h2 class='login-title'>$title</h2>
            <!-- Description -->
            <p class='login-description'>$description</p>
            <!-- Bouton -->
            <button class='login-button'>$buttonText</button>
            <div class='loading-wrapper' style='display: none;'>
                <div class='loading-dots'>
                    <div class='dot'></div>
                    <div class='dot delay-75'></div>
                    <div class='dot delay-150'></div>
                </div>
            </div>
        </div>
    </div>";
}

function renderMainTile($title, $description, $buttonText, $icon, $link) {
    echo MainTile($title, $description, $buttonText, $icon, $link);
}
?>