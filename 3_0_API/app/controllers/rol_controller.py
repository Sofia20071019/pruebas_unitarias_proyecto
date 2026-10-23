"""
ARCHIVO: rol_controller.py
PROPOSITO: Controlador de roles encargado de gestionar las operaciones
           de consulta y creación de roles de usuario del sistema. Permite
           listar todos los roles disponibles y crear nuevos roles.
           Requiere autenticación válida (token JWT) para acceder a los endpoints.
"""

# Importación de 'request' para acceder a los datos de la petición HTTP entrante
from flask import request
# Importación de 'jsonify' para construir respuestas HTTP en formato JSON
from flask import jsonify
# Importación del decorador de verificación de token JWT
from app.utils.decorators import token_requerido


class RolController:
    """
    Clase controladora que agrupa los métodos estáticos para la gestión
    de roles de usuario del sistema.
    """

    @staticmethod
    @token_requerido
    def listar_roles():
        """
        Endpoint para listar todos los roles disponibles en el sistema.
        Requiere autenticación válida (token JWT).
        Retorna una lista con el ID y nombre de cada rol.
        """
        try:
            # Importación diferida del servicio de roles para evitar dependencias circulares
            from app.services.rol_service import RolService
            # Obtener todos los roles registrados en la base de datos
            roles = RolService.listar_todos()
            # Construir lista de diccionarios con ID y nombre de cada rol
            data = [{"idRol": r.idRol, "nombreRol": r.nombreRol} for r in roles]
            # Retornar respuesta exitosa con la lista de roles
            return jsonify({"status": "success", "data": data}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @token_requerido
    def crear_rol():
        """
        Endpoint para crear un nuevo rol en el sistema.
        Requiere autenticación válida (token JWT).
        Recibe el nombre del rol en el cuerpo JSON.
        Retorna los datos del rol creado con código 201.
        """
        # Obtener el cuerpo de la petición HTTP en formato JSON
        data = request.get_json()
        try:
            # Importación diferida del servicio de roles
            from app.services.rol_service import RolService
            # Crear el rol con el nombre recibido del JSON
            rol = RolService.crear_rol(nombreRol=data.get("nombreRol"))
            # Retornar respuesta exitosa con los datos del rol creado (código 201)
            return jsonify({"status": "success", "data": {"idRol": rol.idRol, "nombreRol": rol.nombreRol}}), 201
        except Exception as e:
            # Capturar excepciones y retornar error 400 (solicitud incorrecta)
            return jsonify({"status": "error", "message": str(e)}), 400
