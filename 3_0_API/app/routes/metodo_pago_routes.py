"""
ARCHIVO: metodo_pago_routes.py
PROPOSITO: Definicion de las rutas HTTP para el modulo de metodos de pago.
           Registra los endpoints para listar los metodos de pago disponibles en el sistema.
           Utiliza el patron Blueprint de Flask para organizar las rutas de forma modular.
"""

# Importacion de Blueprint para crear un grupo de rutas modular
from flask import Blueprint

# Importacion del controlador de metodos de pago que maneja la logica de cada endpoint
from app.controllers.metodo_pago_controller import MetodoPagoController

# Crear el Blueprint de metodos de pago con el nombre "metodo_pago"
metodo_pago_bp = Blueprint("metodo_pago", __name__)

# Registrar la ruta GET /api/metodos-pago que lista todos los metodos de pago disponibles
# Retorna la lista completa de metodos de pago registrados en el sistema
metodo_pago_bp.add_url_rule("/api/metodos-pago", view_func=MetodoPagoController.listar_metodos, methods=["GET"])
