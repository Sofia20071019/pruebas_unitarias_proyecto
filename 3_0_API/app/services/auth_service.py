"""
ARCHIVO: auth_service.py
PROPOSITO: Servicio de autenticacion que gestiona el inicio de sesion y recuperacion
           de contrasena de los usuarios del sistema. Proporciona funcionalidades
           para validar credenciales y verificar la existencia de cuentas por correo.
"""

# Importacion de la instancia de base de datos y el generador de hashes de contrasenas
from app.database.database import db, bcrypt

# Importacion del modelo de usuario para realizar consultas a la tabla de usuarios
from app.models import Usuario


class AuthService:
    """Clase que concentra los servicios de autenticacion del sistema."""

    @staticmethod
    def login(correo, password):
        """
        Metodo estatico que valida las credenciales de un usuario.
        
        Args:
            correo (str): Correo electronico del usuario que intenta iniciar sesion.
            password (str): Contrasena en texto plano que se verificara contra el hash almacenado.
        
        Returns:
            Usuario: Objeto usuario si las credenciales son correctas.
            None: Si el correo no existe o la contrasena es incorrecta.
        """
        # Buscar el usuario en la base de datos usando el correo electronico
        usuario = Usuario.query.filter_by(correo=correo).first()

        # Si no se encuentra ningun usuario con ese correo, retornar None
        if not usuario:
            return None

        # Verificar si la contrasena proporcionada coincide con el hash almacenado
        # bcrypt.check_password_hash compara la contrasena en texto plano con el hash
        if not bcrypt.check_password_hash(usuario.passwordHash, password):
            return None

        # Si todo es correcto, retornar el objeto usuario autenticado
        return usuario

    @staticmethod
    def recuperar_contrasena(correo):
        """
        Metodo estatico que verifica si existe un usuario con el correo proporcionado.
        Se utiliza en el flujo de recuperacion de contrasena para confirmar que
        la cuenta existe antes de enviar instrucciones de recuperacion.
        
        Args:
            correo (str): Correo electronico del usuario cuya cuenta se desea recuperar.
        
        Returns:
            bool: True si existe un usuario con ese correo, False de lo contrario.
        """
        # Buscar si existe un usuario con el correo proporcionado en la base de datos
        usuario = Usuario.query.filter_by(correo=correo).first()

        # Retornar True si se encontro un usuario, False si no existe
        return usuario is not None
