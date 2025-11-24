<?php
header('Content-Type: application/json');
require 'conexion.php';

// Decodificar el JSON que llega desde Javascript
$input = json_decode(file_get_contents("php://input"), true);

try {
    // Sentencia SQL para INSERTAR datos
    $sql = "INSERT INTO reportes (fecha, maquina, tipo, descripcion, operador, correo_operador, foto) 
            VALUES (:fecha, :maquina, :tipo, :desc, :operador, :correo, :foto)";
    
    $stmt = $conn->prepare($sql);
    
    // Asignamos cada valor recibido a su columna en la BD
    $stmt->bindParam(':fecha', $input['fecha']);
    $stmt->bindParam(':maquina', $input['maquina']);
    $stmt->bindParam(':tipo', $input['tipo']);
    $stmt->bindParam(':desc', $input['descripcion']);
    $stmt->bindParam(':operador', $input['operador']);
    $stmt->bindParam(':correo', $input['correoOperador']);
    $stmt->bindParam(':foto', $input['foto']); 
    
    $stmt->execute(); // Ejecutar la inserción
    
    echo json_encode(["success" => true, "message" => "Guardado exitoso"]);

} catch (PDOException $e) {
    // Si falla (ej. base de datos apagada), devuelve el error
    echo json_encode(["success" => false, "message" => "Error BD: " . $e->getMessage()]);
}
?>