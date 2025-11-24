<?php
header('Content-Type: application/json');
require 'conexion.php';

// Recibimos el ID que envía Javascript
$input = json_decode(file_get_contents("php://input"), true);
$id = $input['id'] ?? null;

if (!$id) {
    echo json_encode(["success" => false, "message" => "No se recibió el ID para borrar."]);
    exit;
}

try {
    // ELIMINAMOS EL REGISTRO DE LA BASE DE DATOS
    $sql = "DELETE FROM reportes WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Eliminado correctamente"]);
    } else {
        echo json_encode(["success" => false, "message" => "No se pudo eliminar"]);
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error BD: " . $e->getMessage()]);
}
?>