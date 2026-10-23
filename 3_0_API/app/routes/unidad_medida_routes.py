"""
ARCHIVO: unidad_medida_routes.py
PROPOSITO: Definicion de las rutas HTTP para el modulo de unidades de medida.
           Registra los endpoints para listar las unidades de medida disponibles en el
           sistema. Las unidades de medida se utilizan para cuantificar los insumos
           del inventario (ej: kilogramos, litros, metros, unidades).
           Utiliza el patron Blueprint de Flask para organizar las rutas de forma modular.
"""

# Importacion de Blueprint para crear un grupo de rutas modular
from flask import Blueprint

# Importacion del controlador de unidades de medida que maneja la logica de cada endpoint
from app.controllers.unidad_medida_controller import UnidadMedidaController

# Crear el Blueprint de unidades de medida con el nombre "unidad_medida"
unidad_medida_bp = Blueprint("unidad_medida", __name__)

# Registrar la ruta GET /api/unidades-medida que lista todas las unidades de medida
# Retorna la lista completa de unidades de medida registradas en el sistema
unidad_medida_bp.add_url_rule("/api/unidades-medida", view_func=UnidadMedidaController.listar_unidades, methods=["GET"])
