<?php
// Datos de acceso a XAMPP (por defecto son estos)
$host = "localhost";
$usuario = "root";
$password = "";
$base_datos = "mantenimiento_db";

try {
    // Intentamos conectar usando PDO (una forma segura de conectar en PHP)
    $conn = new PDO("mysql:host=$host;dbname=$base_datos", $usuario, $password);
    
    // Configuramos para que si hay error, nos avise (Excepción)
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Configuramos para que acepte tildes y ñ
    $conn->exec("SET NAMES utf8");
} catch(PDOException $e) {
    // Si falla, mata el proceso y muestra el error
    die("Error de conexión: " . $e->getMessage());
}
?>