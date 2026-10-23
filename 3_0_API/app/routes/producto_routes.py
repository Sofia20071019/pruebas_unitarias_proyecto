"""
ARCHIVO: producto_routes.py
PROPOSITO: Definicion de las rutas HTTP para el modulo de productos.
           Registra los endpoints para listar y crear productos que se fabrican
           en la empresa. Los productos incluyen atributos como nombre, talla y color.
           Utiliza el patron Blueprint de Flask para organizar las rutas de forma modular.
"""

# Importacion de Blueprint para crear un grupo de rutas modular
from flask import Blueprint

# Importacion del controlador de productos que maneja la logica de cada endpoint
from app.controllers.producto_controller import ProductoController

# Crear el Blueprint de productos con el nombre "producto"
producto_bp = Blueprint("producto", __name__)

# Registrar la ruta GET /api/productos que lista todos los productos del sistema
# Retorna la lista completa de productos registrados en la base de datos
producto_bp.add_url_rule("/api/productos", view_func=ProductoController.listar_productos, methods=["GET"])

# Registrar la ruta POST /api/productos que permite crear un nuevo producto
# Recibe nombre del producto y opcionalmente talla y color en el cuerpo de la peticion
producto_bp.add_url_rule("/api/productos", view_func=ProductoController.crear_producto, methods=["POST"])
