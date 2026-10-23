"""
ARCHIVO: pago_routes.py
PROPOSITO: Definicion de las rutas HTTP para el modulo de pagos a empleados.
           Registra los endpoints para listar, crear, aprobar pagos y consultar
           pagos por jornada laboral. Los pagos estan asociados a las jornadas
           de trabajo de los empleados.
           Utiliza el patron Blueprint de Flask para organizar las rutas de forma modular.
"""

# Importacion de Blueprint para crear un grupo de rutas modular
from flask import Blueprint

# Importacion del controlador de pagos que maneja la logica de cada endpoint
from app.controllers.pago_controller import PagoController

# Crear el Blueprint de pagos con el nombre "pago"
pago_bp = Blueprint("pago", __name__)

# Registrar la ruta GET /api/pagos que lista todos los pagos registrados en el sistema
# Retorna la lista completa de pagos ordenados por fecha descendente
pago_bp.add_url_rule("/api/pagos", view_func=PagoController.listar_pagos, methods=["GET"])

# Registrar la ruta POST /api/pagos que permite crear un nuevo pago a un empleado
# Recibe ID de jornada, ID de administrador, monto, metodo de pago y fecha
pago_bp.add_url_rule("/api/pagos", view_func=PagoController.crear_pago, methods=["POST"])

# Registrar la ruta PUT /api/pagos/<id> que aprueba o actualiza un pago existente
# Permite modificar el estado de aprobacion y otros campos del pago
pago_bp.add_url_rule("/api/pagos/<string:idPago>", view_func=PagoController.aprobar_pago, methods=["PUT"])

# Registrar la ruta GET /api/pagos/jornada/<id> que lista todos los pagos
# asociados a una jornada laboral especifica identificada por su ID
pago_bp.add_url_rule("/api/pagos/jornada/<string:idJornada>", view_func=PagoController.pagos_por_jornada, methods=["GET"])
