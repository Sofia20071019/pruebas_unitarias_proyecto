"""
ARCHIVO: cliente_routes.py
PROPOSITO: Definicion de las rutas HTTP para el modulo de clientes.
           Registra los endpoints para listar y crear clientes en el sistema.
           Los clientes son las entidades que realizan pedidos de produccion.
           Utiliza el patron Blueprint de Flask para organizar las rutas de forma modular.
"""

# Importacion de Blueprint para crear un grupo de rutas modular
from flask import Blueprint

# Importacion del controlador de clientes que maneja la logica de cada endpoint
from app.controllers.cliente_controller import ClienteController

# Crear el Blueprint de clientes con el nombre "cliente"
cliente_bp = Blueprint("cliente", __name__)

# Registrar la ruta GET /api/clientes que lista todos los clientes registrados
# Retorna la lista completa de clientes del sistema
cliente_bp.add_url_rule("/api/clientes", view_func=ClienteController.listar_clientes, methods=["GET"])

# Registrar la ruta POST /api/clientes que permite crear un nuevo cliente
# Recibe el nombre del cliente y opcionalmente su telefono en el cuerpo de la peticion
cliente_bp.add_url_rule("/api/clientes", view_func=ClienteController.crear_cliente, methods=["POST"])
