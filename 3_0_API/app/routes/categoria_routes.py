"""
ARCHIVO: categoria_routes.py
PROPOSITO: Definicion de las rutas HTTP para el modulo de categorias de insumos.
           Registra los endpoints para listar las categorias disponibles en el sistema.
           Utiliza el patron Blueprint de Flask para organizar las rutas de forma modular.
"""

# Importacion de Blueprint para crear un grupo de rutas modular
from flask import Blueprint

# Importacion del controlador de categorias que maneja la logica de cada endpoint
from app.controllers.categoria_controller import CategoriaController

# Crear el Blueprint de categorias con el nombre "categoria"
categoria_bp = Blueprint("categoria", __name__)

# Registrar la ruta GET /api/categorias que lista todas las categorias de insumos
# Retorna la lista completa de categorias registradas en el sistema
categoria_bp.add_url_rule("/api/categorias", view_func=CategoriaController.listar_categorias, methods=["GET"])
