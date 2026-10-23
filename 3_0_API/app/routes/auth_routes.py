"""
ARCHIVO: auth_routes.py
PROPOSITO: Definicion de las rutas HTTP para el modulo de autenticacion del sistema.
           Registra los endpoints para inicio de sesion, recuperacion de contrasena
           y verificacion de tokens JWT. Utiliza el patron Blueprint de Flask
           para organizar las rutas de autenticacion de forma modular.
"""

# Importacion de Blueprint para crear un grupo de rutas modular
from flask import Blueprint

# Importacion del controlador de autenticacion que maneja la logica de cada endpoint
from app.controllers.auth_controller import AuthController

# Importacion del decorador que valida la autenticidad del token JWT en peticiones protegidas
from app.utils.decorators import token_requerido

# Importacion de jsonify para respuestas HTTP en formato JSON (importado pero no usado directamente aqui)
from flask import jsonify

# Crear el Blueprint de autenticacion con el nombre "auth"
auth_bp = Blueprint("auth", __name__)

# Registrar la ruta POST /api/auth/login que permite a los usuarios iniciar sesion
# Este endpoint recibe correo y contrasena, valida las credenciales y retorna un token JWT
auth_bp.add_url_rule("/api/auth/login", view_func=AuthController.login, methods=["POST"])

# Registrar la ruta POST /api/auth/recuperar-contrasena que permite solicitar
# instrucciones para restablecer la contrasena de la cuenta
auth_bp.add_url_rule("/api/auth/recuperar-contrasena", view_func=AuthController.recuperar_contrasena, methods=["POST"])

# Definir la ruta GET /api/auth/verificar-token que valida si un token JWT es valido
# Utiliza el decorador @token_requerido para asegurar que la peticion incluya un token valido
@auth_bp.route("/api/auth/verificar-token", methods=["GET"])
@token_requerido  # Decorador que intercepta la peticion y valida el token JWT antes de ejecutar la funcion
def verificar_token():
    """Endpoint que verifica la validez del token JWT proporcionado en la peticion."""
    # Delegar la logica de verificacion al controlador de autenticacion
    return AuthController.verificar_token()
