"""
ARCHIVO: orden_routes.py
PROPOSITO: Definicion de las rutas HTTP para el modulo de ordenes de produccion.
           Registra los endpoints para listar, crear, consultar y actualizar ordenes
           de produccion. Cada orden representa un pedido de un cliente que incluye
           uno o mas productos con sus cantidades.
           Utiliza el patron Blueprint de Flask para organizar las rutas de forma modular.
"""

# Importacion de Blueprint para crear un grupo de rutas modular
from flask import Blueprint

# Importacion del controlador de ordenes que maneja la logica de cada endpoint
from app.controllers.orden_controller import OrdenController

# Crear el Blueprint de ordenes con el nombre "orden"
orden_bp = Blueprint("orden", __name__)

# Registrar la ruta GET /api/ordenes que lista todas las ordenes de produccion
# Retorna la lista completa de ordenes registradas en el sistema
orden_bp.add_url_rule("/api/ordenes", view_func=OrdenController.listar_ordenes, methods=["GET"])

# Registrar la ruta POST /api/ordenes que permite crear una nueva orden de produccion
# Recibe el ID del cliente, ID del administrador, fecha del pedido y estado en el cuerpo
orden_bp.add_url_rule("/api/ordenes", view_func=OrdenController.crear_orden, methods=["POST"])

# Registrar la ruta GET /api/ordenes/<id> que obtiene una orden especifica por su ID
# Incluye los detalles de la orden con los productos y cantidades solicitadas
orden_bp.add_url_rule("/api/ordenes/<string:idOrden>", view_func=OrdenController.obtener_orden, methods=["GET"])

# Registrar la ruta PUT /api/ordenes/<id> que actualiza los datos de una orden existente
# Permite modificar campos como estado de produccion, cliente, etc.
orden_bp.add_url_rule("/api/ordenes/<string:idOrden>", view_func=OrdenController.actualizar_orden, methods=["PUT"])
