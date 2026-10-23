# =============================================================================
# ARCHIVO: database.py
# PROPOSITO: Modulo de inicializacion de las extensiones de base de datos
#            y seguridad de la aplicacion. Crea las instancias de SQLAlchemy
#            (ORM para interactuar con la base de datos) y Bcrypt (para
#            el hashing seguro de contrasenas) sin vincularlas a la app
#            directamente. La inicializacion se realiza en el factory
#            create_app() del modulo __init__.py para evitar dependencias
#            circulares.
# =============================================================================

# Importar la clase SQLAlchemy de Flask-SQLAlchemy, que proporciona
# una integracion simplificada entre Flask y el ORM SQLAlchemy,
# permitiendo definir modelos como clases Python y ejecutar
# consultas de forma declarativa sobre la base de datos
from flask_sqlalchemy import SQLAlchemy

# Importar la clase Bcrypt de Flask-Bcrypt, que ofrece hashing
# seguro de contrasenas usando el algoritmo bcrypt, incluyendo
# funciones para generar hashes y verificar contrasenas contra
# sus hashes almacenados
from flask_bcrypt import Bcrypt

# Crear la instancia de SQLAlchemy que sera utilizada en todos los
# modelos de la aplicacion para definir tablas, columnas, relaciones
# y ejecutar consultas CRUD sobre la base de datos
db = SQLAlchemy()

# Crear la instancia de Bcrypt que sera utilizada principalmente
# en el modulo de autenticacion y en la creacion de usuarios
# para hashear contrasenas antes de almacenarlas en la BD
bcrypt = Bcrypt()
