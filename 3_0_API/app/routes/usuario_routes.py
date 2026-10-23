"""
ARCHIVO: usuario_routes.py
PROPOSITO: Definicion de las rutas HTTP para el modulo de gestion de usuarios.
           Registra los endpoints para operaciones CRUD de usuarios, incluyendo
           listado, creacion, consulta, actualizacion, eliminacion y desactivacion.
           Utiliza el patron Blueprint de Flask para organizar las rutas de forma modular.
"""

# Importacion de Blueprint para crear un grupo de rutas modular
from flask import Blueprint

# Importacion del controlador de usuarios que maneja la logica de cada endpoint
from app.controllers.usuario_controller import UsuarioController

# Crear el Blueprint de usuarios con el nombre "usuario"
usuario_bp = Blueprint("usuario", __name__)

# Registrar la ruta GET /api/usuarios que lista todos los usuarios del sistema
# Retorna una lista completa de usuarios con todos sus datos
usuario_bp.add_url_rule("/api/usuarios", view_func=UsuarioController.listar_usuarios, methods=["GET"])

# Registrar la ruta POST /api/usuarios que permite crear un nuevo usuario en el sistema
# Recibe los datos del usuario en el cuerpo de la peticion
usuario_bp.add_url_rule("/api/usuarios", view_func=UsuarioController.crear_usuario, methods=["POST"])

# Registrar la ruta GET /api/usuarios/<id> que obtiene un usuario especifico por su ID
# El ID se pasa como parametro en la URL
usuario_bp.add_url_rule("/api/usuarios/<string:idUsuario>", view_func=UsuarioController.obtener_usuario, methods=["GET"])

# Registrar la ruta PUT /api/usuarios/<id> que actualiza los datos de un usuario existente
# El ID se pasa como parametro en la URL y los datos actualizados en el cuerpo
usuario_bp.add_url_rule("/api/usuarios/<string:idUsuario>", view_func=UsuarioController.actualizar_usuario, methods=["PUT"])

# Registrar la ruta DELETE /api/usuarios/<id> que elimina un usuario del sistema
# El ID del usuario a eliminar se pasa como parametro en la URL
usuario_bp.add_url_rule("/api/usuarios/<string:idUsuario>", view_func=UsuarioController.eliminar_usuario, methods=["DELETE"])

# Registrar la ruta PUT /api/usuarios/<id>/desactivar que cambia el estado del usuario a inactivo
# A diferencia de eliminar, conserva el registro pero lo marca como no activo
usuario_bp.add_url_rule("/api/usuarios/<string:idUsuario>/desactivar", view_func=UsuarioController.desactivar_usuario, methods=["PUT"])

# Registrar la ruta PUT /api/usuarios/<id>/activar que reactiva al usuario
usuario_bp.add_url_rule("/api/usuarios/<string:idUsuario>/activar", view_func=UsuarioController.activar_usuario, methods=["PUT"])
# Registrar la ruta GET /api/empleados que lista solo los usuarios con rol de empleado

# Endpoint dedicado para consultar la lista de empleados del sistema
usuario_bp.add_url_rule("/api/empleados", view_func=UsuarioController.listar_empleados, methods=["GET"])
