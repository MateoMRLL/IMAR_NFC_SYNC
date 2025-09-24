<?php
function MainTile($title, $description, $buttonText, $iconName, $href)
{
    return "
    <div class='main-tile' onclick=\"window.location.href='$href'\">
        <div class='tile-content'>
            <div class='icon-container'>
                <i data-lucide='$iconName' class='tile-icon'></i>
            </div>
            <h3 class='tile-title'>$title</h3>
            <p class='tile-description'>$description</p>
            <div class='tile-button'>$buttonText</div>
        </div>
    </div>";
}
?>