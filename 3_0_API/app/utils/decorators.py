"""
ARCHIVO: decorators.py

PROPOSITO: Contiene decoradores reutilizables para proteger rutas de la API Flask.
Estos decoradores validan la autenticacion y autorizacion de los usuarios antes
de permitir el acceso a los endpoints. El decorador token_requerido verifica que
el usuario posea un JWT valido, mientras que rol_requerido adiciona una capa extra
de seguridad comprobando que el usuario tenga uno de los roles permitidos.
"""

# Importa wraps de functools para preservar los metadatos originales de las funciones decoradas
from functools import wraps

# Importa request para acceder a los headers de la peticion HTTP entrante
# Importa jsonify para construir respuestas JSON con el formato correcto de Flask
from flask import request, jsonify

# Importa la funcion verificar_token del modulo jwt_utils para validar tokens JWT
from app.utils.jwt_utils import verificar_token


def token_requerido(f):
    """
    Decorador que protege una ruta exigiendo un token JWT valido en el header
    Authorization de la peticion HTTP. Si el token es valido, inyecta el payload
    del usuario en request.usuario para que la funcion decorada pueda acceder
    a los datos del usuario autenticado.

    Parametros:
        f (function): La funcion original de la ruta que sera decorada.

    Retorna:
        function: La funcion decorada que incluye la validacion del token.
    """
    # wraps preserva el __name__ y __doc__ de la funcion original para que
    # Flask registre correctamente las rutas en su mapa de URLs
    @wraps(f)
    def decorated(*args, **kwargs):
        # Obtiene el header Authorization completo de la peticion HTTP entrante
        # Si el header no existe, utiliza una cadena vacia como valor por defecto
        auth_header = request.headers.get("Authorization", "")

        # Verifica que el header comience con "Bearer " que es el estandar OAuth2
        # para el envio de tokens JWT. Si no comienza con Bearer, el token no es valido
        if not auth_header.startswith("Bearer "):
            # Retorna un error 401 Unauthorized con un mensaje descriptivo
            return jsonify({"status": "error", "message": "Token requerido"}), 401

        # Extrae el token JWT del header eliminando el prefijo "Bearer "
        # split(" ", 1) divide la cadena en maximo 2 partes usando el espacio como delimitador
        # [1] obtiene la segunda parte que contiene el token JWT puro
        token = auth_header.split(" ", 1)[1]

        # Valida el token JWT utilizando la funcion verificar_token
        # Esta funcion decodifica el token, verifica la firma y la fecha de expiracion
        payload = verificar_token(token)

        # Si el payload es None, significa que el token es invalido o esta expirado
        if not payload:
            # Retorna un error 401 Unauthorized indicando que el token no es valido
            return jsonify({"status": "error", "message": "Token invalido o expirado"}), 401

        # Almacena el payload decodificado del usuario en el objeto request
        # Esto permite que las funciones de las rutas accedan a los datos del usuario
        # mediante request.usuario (por ejemplo: request.usuario["idUsuario"])
        request.usuario = payload

        # Ejecuta la funcion original de la ruta con todos los argumentos
        # y retorna su resultado, permitiendo que la ruta se ejecute normalmente
        return f(*args, **kwargs)

    # Retorna la funcion decorada que incluye toda la logica de validacion
    return decorated


def rol_requerido(*roles):
    """
    Decorador de doble capa que combina la validacion de token con una verificacion
    de rol. Primero valida que el usuario posea un token JWT valido y luego verifica
    que su rol este dentro de los roles permitidos para acceder al recurso.

    Parametros:
        *roles (int): Uno o mas IDs de roles que tienen permitido acceder a la ruta.
                      Se pueden pasar multiples roles como argumentos separados.

    Retorna:
        function: Un decorador que protege la ruta con autenticacion y autorizacion.
    """
    # El decorador exterior recibe los roles permitidos como argumentos variables
    # y retorna una funcion decoradora que sera aplicada a la funcion de la ruta
    def decorator(f):
        # wraps preserva los metadatos de la funcion original para Flask
        @wraps(f)
        # Se aplica primero token_requerido para validar la autenticacion del usuario
        # Esto asegura que request.usuario este disponible antes de verificar el rol
        @token_requerido
        def decorated(*args, **kwargs):
            # Obtiene el idRol del payload del usuario que fue almacenado en request.usuario
            # por el decorador token_requerido. get() retorna None si la clave no existe
            if request.usuario.get("idRol") not in roles:
                # Si el rol del usuario no esta en la lista de roles permitidos,
                # retorna un error 403 Forbidden indicando que no tiene permisos
                return jsonify({"status": "error", "message": "No tienes permisos para acceder a este recurso"}), 403

            # Si el rol del usuario esta dentro de los roles permitidos,
            # ejecuta la funcion original de la ruta con todos sus argumentos
            return f(*args, **kwargs)

        # Retorna la funcion decorada con ambas capas de seguridad
        return decorated

    # Retorna el decorador que sera aplicado a la funcion de la ruta
    return decorator
