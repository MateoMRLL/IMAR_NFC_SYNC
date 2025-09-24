<?php

$host = "localhost";
$username = "i601543_access_nfc";
$password = "9;Ae,.RDdX,~y.9d";
$dbname = "i601543_nfc"; // Fixed variable name

$connection = mysqli_connect($host, $username, $password, $dbname);

if (!$connection) {
    die("Connection failed: " . mysqli_connect_error());
} 

mysqli_set_charset($connection, "utf8mb4");
?>