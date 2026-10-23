"""
ARCHIVO: asignacion_routes.py
PROPOSITO: Definicion de las rutas HTTP para el modulo de asignaciones de insumos.
           Registra los endpoints para listar, crear y gestionar las asignaciones
           de insumos del inventario a los empleados. Utiliza el patron Blueprint
           de Flask para organizar las rutas de forma modular.
"""

# Importacion de Blueprint para crear un grupo de rutas modular
from flask import Blueprint

# Importacion del controlador de asignaciones que maneja la logica de cada endpoint
from app.controllers.asignacion_controller import AsignacionController

# Crear el Blueprint de asignaciones con el nombre "asignacion"
asignacion_bp = Blueprint("asignacion", __name__)

# Registrar la ruta GET /api/asignaciones que lista todas las asignaciones del sistema
# Retorna la lista completa de asignaciones ordenadas por fecha descendente
asignacion_bp.add_url_rule("/api/asignaciones", view_func=AsignacionController.listar_asignaciones, methods=["GET"])

# Registrar la ruta POST /api/asignaciones que permite crear una nueva asignacion
# Recibe el ID del empleado, ID del insumo y la cantidad a asignar
asignacion_bp.add_url_rule("/api/asignaciones", view_func=AsignacionController.crear_asignacion, methods=["POST"])

# Registrar la ruta GET /api/asignaciones/empleado/<id> que lista todas las asignaciones
# de un empleado especifico identificado por su ID en la URL
asignacion_bp.add_url_rule("/api/asignaciones/empleado/<string:idUsuario>", view_func=AsignacionController.asignaciones_empleado, methods=["GET"])

# Registrar la ruta PUT /api/asignaciones/<id>/estado que cambia el estado de una asignacion
# Permite actualizar el estado (ej: Pendiente, Aprobada, Rechazada) de una asignacion existente
asignacion_bp.add_url_rule("/api/asignaciones/<string:idAsignacion>/estado", view_func=AsignacionController.cambiar_estado, methods=["PUT"])
