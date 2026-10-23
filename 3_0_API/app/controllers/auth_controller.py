"""
ARCHIVO: auth_controller.py
PROPOSITO: Controlador de autenticación encargado de gestionar las operaciones de
           inicio de sesión, recuperación de contraseña y verificación de tokens
           JWT para los usuarios del sistema. Expone endpoints HTTP para el
           módulo de autenticación de la API REST.
"""

# Importación de 'request' para acceder a los datos de la petición HTTP entrante
from flask import request
# Importación de 'jsonify' para construir respuestas HTTP en formato JSON
from flask import jsonify
# Importación de la función generar_token para crear tokens JWT de autenticación
from app.utils.jwt_utils import generar_token


class AuthController:
    """
    Clase controladora que agrupa los métodos estáticos relacionados con
    la autenticación de usuarios: login, recuperación de contraseña
    y verificación de token.
    """

    @staticmethod
    def login():
        """
        Método estático que maneja el inicio de sesión de usuarios.
        Recibe correo y contraseña, valida las credenciales contra la base
        de datos y retorna un token JWT junto con la información del usuario
        autenticado.
        """
        # Obtener el cuerpo de la petición HTTP en formato JSON
        data = request.get_json()
        # Extraer el correo electrónico, convertirlo a minúsculas y eliminar espacios
        correo = data.get("correo", "").lower().strip()
        # Extraer la contraseña del cuerpo de la petición
        password = data.get("password", "")

        try:
            # Importación diferida del servicio de autenticación para evitar circulares
            from app.services.auth_service import AuthService
            # Llamar al servicio de autenticación para validar credenciales
            usuario = AuthService.login(correo, password)
            # Si no se encontró usuario, retornar error 401 de credenciales inválidas
            if not usuario:
                return jsonify({"status": "error", "message": "Credenciales inválidas"}), 401

            # Generar token JWT con los datos del usuario autenticado
            token = generar_token(usuario)

            # Construir el nombre completo del usuario combinando primer y segundo nombre
            pNombreCompleto = f"{usuario.pNombre or ''} {usuario.sNombre or ''}".strip()
            # Construir los apellidos completos combinando primer y segundo apellido
            pApellidoCompleto = f"{usuario.pApellido or ''} {usuario.sApellido or ''}".strip()
            # Concatenar nombres y apellidos para formar el nombre completo
            nombreCompleto = f"{pNombreCompleto} {pApellidoCompleto}".strip()

            # Retornar respuesta exitosa con los datos del usuario y el token JWT
            return jsonify({
                "status": "success",
                "data": {
                    "idUsuario": usuario.idUsuario,
                    "nombre": nombreCompleto,
                    "correo": usuario.correo,
                    "rol": usuario.rol.nombreRol if usuario.rol else None,
                    "idRol": usuario.idRol,
                    "token": token
                }
            }), 200

        except Exception as e:
            # Capturar cualquier excepción inesperada y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    def recuperar_contrasena():
        """
        Método estático que maneja la solicitud de recuperación de contraseña.
        Recibe el correo electrónico del usuario y envía la solicitud al
        administrador para que gestione el restablecimiento de la contraseña.
        """
        # Obtener el cuerpo de la petición HTTP en formato JSON
        data = request.get_json()
        # Extraer el correo, convertirlo a minúsculas y limpiar espacios
        correo = data.get("correo", "").lower().strip()

        try:
            # Importación diferida del servicio de autenticación
            from app.services.auth_service import AuthService
            # Llamar al servicio para verificar si el correo existe y procesar solicitud
            existe = AuthService.recuperar_contrasena(correo)
            # Si el correo está registrado, retornar mensaje de éxito
            if existe:
                return jsonify({"status": "success", "message": "Solicitud enviada al administrador."}), 200
            # Si el correo no está registrado, retornar error 404
            return jsonify({"status": "error", "message": "Correo no registrado."}), 404
        except Exception as e:
            # Capturar excepciones inesperadas y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    def verificar_token():
        """
        Método estático que verifica la validez del token JWT proporcionado.
        Utiliza el decorador token_requerido para validar el token antes
        de retornar los datos del usuario contenido en el token.
        """
        # Importación diferida del decorador de verificación de token
        from app.utils.decorators import token_requerido
        # Retornar los datos del usuario que fueron decodificados del token JWT
        # El decorator token_requerido inyecta request.usuario con los datos del token
        return jsonify({
            "status": "success",
            "data": request.usuario
        }), 200
