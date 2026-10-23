# =============================================================================
# ARCHIVO: settings.py
# PROPOSITO: Modulo de configuracion centralizada de la aplicacion Flask.
#            Carga las variables de entorno desde un archivo .env y define
#            la clase Config con todas las configuraciones necesarias para
#            el funcionamiento de la API, incluyendo la clave secreta de
#            Flask y la URI de conexion a la base de datos MySQL.
# =============================================================================

# Importar el modulo os para acceder a variables de entorno del sistema
# operativo y configuraciones del entorno de ejecucion
import os

# Importar la clase Path de pathlib para manejar rutas de archivos
# de forma robusta y multiplataforma
from pathlib import Path

# Importar la funcion load_dotenv para cargar las variables de entorno
# desde un archivo .env situado en el directorio raiz del proyecto
from dotenv import load_dotenv

# Construir la ruta absoluta al archivo .env ubicado en la raiz del
# proyecto (tres niveles arriba desde este archivo: config/ -> app/ -> 3_0_API/)
env_path = Path(__file__).resolve().parent.parent.parent / ".env"

# Cargar todas las variables definidas en el archivo .env al entorno
# del proceso actual, haciendolas disponibles via os.getenv()
load_dotenv(env_path)


class Config:
    """
    Clase de configuracion principal de la aplicacion Flask.
    Contiene todas las constantes y ajustes necesarios para el
    funcionamiento correcto de la API REST y su conexion a la
    base de datos MySQL.
    """

    # Clave secreta de Flask utilizada para firmar sesiones, tokens JWT
    # y otros datos sensibles. Se obtiene de la variable de entorno
    # SECRET_KEY, con un valor por defecto para entorno de desarrollo
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-key-cambiar-en-produccion")

    # URI de conexion a la base de datos MySQL construida dinamicamente
    # a partir de las variables de entorno. Utiliza el driver PyMySQL
    # como adaptador Python-MySQL. Formato:
    # mysql+pymysql://USUARIO:CONTRASENA@HOST:PUERTO/NOMBRE_BASE_DATOS
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{os.getenv('MYSQL_USER')}:"
        f"{os.getenv('MYSQL_PASSWORD')}@"
        f"{os.getenv('MYSQL_HOST')}:"
        f"{os.getenv('MYSQL_PORT')}/"
        f"{os.getenv('MYSQL_DATABASE')}"
    )

    # Desactivar el seguimiento de modificaciones de SQLAlchemy para
    # reducir el uso de memoria y mejorar el rendimiento. Cuando esta
    # en True, SQLAlchemy rastrea todos los objetos instanciados, lo
    # cual no es necesario en produccion y genera overhead
    SQLALCHEMY_TRACK_MODIFICATIONS = False
