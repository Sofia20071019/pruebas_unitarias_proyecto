"""
ARCHIVO: jwt_utils.py

PROPOSITO: Proporciona utilidades para la generacion y verificacion de tokens JWT
(JSON Web Tokens) utilizados en el sistema de autenticacion de la API. Estos tokens
permiten a los usuarios mantener sesiones activas sin enviar credenciales en cada
peticion. El modulo genera tokens con datos esenciales del usuario (ID, correo, rol),
les asigna un tiempo de expiracion de 12 horas y los firma con un secreto conocido
solo por el servidor para evitar falsificaciones.
"""

# Importa la libreria PyJWT para codificar y decodificar tokens JWT
# jwt.encode() genera un token firmado y jwt.decode() lo verifica y extrae el payload
import jwt

# Importa datetime para manejar fechas y horas, necesario para establecer
# la fecha de emision (iat) y la fecha de expiracion (exp) del token
import datetime

# Importa current_app de Flask para acceder a la configuracion de la aplicacion
# current_app permite obtener variables de config como SECRET_KEY de forma segura
from flask import current_app


def generar_token(usuario):
    """
    Genera un token JWT firmado para un usuario autenticado exitosamente.
    El token contiene los datos identificadores del usuario, la fecha de
    emision y la fecha de expiracion (12 horas desde la creacion).

    Parametros:
        usuario: Objeto usuario de la base de datos que contiene los atributos
                 idUsuario, correo e idRol necesarios para el payload del token.

    Retorna:
        str: Una cadena codificada en formato JWT que el cliente debe enviar
             en el header Authorization de cada peticion autenticada.
    """
    # Construye el payload del token JWT con los datos del usuario
    # Este payload sera codificado y firmado para crear el token final
    payload = {
        # Identificador unico del usuario en la base de datos
        "idUsuario": usuario.idUsuario,

        # Correo electronico del usuario, util para mostrar en la interfaz
        "correo": usuario.correo,

        # ID del rol del usuario, utilizado por el decorador rol_requerido
        # para verificar permisos de acceso a rutas protegidas
        "idRol": usuario.idRol,

        # Fecha y hora de expiracion del token: 12 horas desde su creacion
        # datetime.now(timezone.utc) obtiene la hora actual en formato UTC
        # timedelta(hours=12) suma 12 horas a la hora actual
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=12),

        # Fecha y hora de emision del token (Issued At)
        # Permite saber cuando fue generado el token para auditoria
        "iat": datetime.datetime.now(datetime.timezone.utc)
    }

    # Obtiene la clave secreta desde la configuracion de la aplicacion Flask
    # SECRET_KEY es utilizada para firmar y verificar la integridad del token
    # Si no existe SECRET_KEY en la config, usa una clave por defecto de desarrollo
    secret = current_app.config.get("SECRET_KEY", "kimuka-jwt-secret-key-titan-sports-2026")

    # Codifica el payload en un token JWT usando el algoritmo HMAC-SHA256 (HS256)
    # HS256 firma el token con la clave secreta, garantizando que no pudo ser alterado
    return jwt.encode(payload, secret, algorithm="HS256")


def verificar_token(token):
    """
    Verifica y decodifica un token JWT recibido en una peticion HTTP.
    Valida la firma del token con la clave secreta y comprueba que no haya expirado.
    Si el token es valido retorna el payload con los datos del usuario,
    en caso contrario retorna None.

    Parametros:
        token (str): La cadena JWT que fue enviada en el header Authorization
                     de la peticion HTTP, sin el prefijo "Bearer ".

    Retorna:
        dict or None: Un diccionario con el payload del token (conteniendo
                      idUsuario, correo, idRol, exp, iat) si es valido,
                      o None si el token es invalido o esta expirado.
    """
    # Obtiene la misma clave secreta utilizada para generar el token
    # Ambas funciones deben usar la misma clave para que la verificacion sea exitosa
    secret = current_app.config.get("SECRET_KEY", "kimuka-jwt-secret-key-titan-sports-2026")

    # Bloque try-except para manejar errores durante la decodificacion del token
    try:
        # Decodifica el token JWT verificando la firma con la clave secreta
        # algorithms=["HS256"] indica que solo acepta tokens firmados con este algoritmo
        # Si la firma no coincide o el token esta corrupto, lanza una excepcion
        payload = jwt.decode(token, secret, algorithms=["HS256"])

        # Si la decodificacion fue exitosa, retorna el payload con los datos del usuario
        return payload

    # Captura la excepcion especifica cuando el token ha expirado
    # ExpiredSignatureError se lanza cuando la fecha actual supera el campo "exp" del token
    except jwt.ExpiredSignatureError:
        # Retorna None indicando que el token ya no es valido por haber expirado
        return None

    # Captura cualquier otra excepcion relacionada con tokens invalidos
    # Incluye: firma incorrecta, formato malformado, campos faltantes, etc.
    except jwt.InvalidTokenError:
        # Retorna None indicando que el token tiene un formato o contenido invalido
        return None
