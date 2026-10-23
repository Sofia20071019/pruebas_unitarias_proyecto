"""
ARCHIVO: rol_routes.py
PROPOSITO: Definicion de las rutas HTTP para el modulo de roles del sistema.
           Registra los endpoints para listar y crear roles que definen los niveles
           de acceso y permisos de los usuarios dentro de la aplicacion.
           Utiliza el patron Blueprint de Flask para organizar las rutas de forma modular.
"""

# Importacion de Blueprint para crear un grupo de rutas modular
from flask import Blueprint

# Importacion del controlador de roles que maneja la logica de cada endpoint
from app.controllers.rol_controller import RolController

# Crear el Blueprint de roles con el nombre "rol"
rol_bp = Blueprint("rol", __name__)

# Registrar la ruta GET /api/roles que lista todos los roles del sistema
# Retorna la lista completa de roles disponibles (ej: Administrador, Empleado)
rol_bp.add_url_rule("/api/roles", view_func=RolController.listar_roles, methods=["GET"])

# Registrar la ruta POST /api/roles que permite crear un nuevo rol en el sistema
# Recibe el nombre del rol en el cuerpo de la peticion
rol_bp.add_url_rule("/api/roles", view_func=RolController.crear_rol, methods=["POST"])
