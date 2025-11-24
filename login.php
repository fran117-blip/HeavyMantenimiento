<?php
// Indicamos que la respuesta será en formato JSON (para que Javascript entienda)
header('Content-Type: application/json');
require 'conexion.php'; // Importamos la conexión de arriba

// Recibimos los datos enviados por Javascript (JSON)
$input = json_decode(file_get_contents("php://input"), true);
$correo = $input['correo'] ?? '';
$pass = $input['password'] ?? '';

// Validación básica: que no estén vacíos
if(empty($correo) || empty($pass)) {
    echo json_encode(["success" => false, "message" => "Faltan datos."]);
    exit;
}

// Preparamos la consulta SQL (Usamos :placeholders para evitar hackeos SQL Injection)
$sql = "SELECT * FROM usuarios WHERE correo = :correo AND password = :pass";
$stmt = $conn->prepare($sql);
$stmt->bindParam(':correo', $correo);
$stmt->bindParam(':pass', $pass);
$stmt->execute();

// Obtenemos el resultado
$usuario = $stmt->fetch(PDO::FETCH_ASSOC);

if ($usuario) {
    // Si existe el usuario, quitamos la contraseña del array por seguridad
    unset($usuario['password']); 
    // Respondemos "success: true" y los datos del usuario
    echo json_encode(["success" => true, "usuario" => $usuario]);
} else {
    // Si no existe
    echo json_encode(["success" => false, "message" => "Credenciales incorrectas."]);
}
?>