<?php
header('Content-Type: application/json');
require 'conexion.php';

try {
    // SELECT * trae todas las columnas
    // ORDER BY fecha DESC pone los más recientes primero
    $stmt = $conn->prepare("SELECT * FROM reportes ORDER BY fecha DESC, id DESC");
    $stmt->execute();
    
    // fetchAll obtiene TODAS las filas encontradas
    $reportes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Enviamos el array como JSON
    echo json_encode($reportes);

} catch (PDOException $e) {
    echo json_encode([]); // Si falla, enviamos array vacío
}
?>