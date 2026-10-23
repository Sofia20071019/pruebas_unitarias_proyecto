"""
ARCHIVO: rol.py
PROPOSITO: Define el modelo de base de datos para la tabla 'rol'. Representa los roles disponibles
           en el sistema (por ejemplo: administrador, empleado, etc.). Cada usuario tiene un rol
           asignado que determina sus permisos y funcionalidades dentro de la aplicacion.
           Este modelo establece una relacion inversa con el modelo Usuario para poder
           acceder a todos los usuarios que poseen un rol determinado.
"""

# Importa el objeto 'db' (instancia de SQLAlchemy) desde el modulo de configuracion de base de datos
# Se utiliza para definir columnas, relaciones y como clase base para los modelos
from app.database.database import db

# Define el modelo Rol que hereda de db.Model, registrandolo como modelo de SQLAlchemy
class Rol(db.Model):
    # Nombre de la tabla en la base de datos donde se almacenan los registros de roles
    __tablename__ = "rol"

    # Campo clave primaria: identificador unico del rol, cadena de hasta 10 caracteres
    idRol = db.Column(db.String(10), primary_key=True)

    # Nombre descriptivo del rol, cadena de texto de hasta 50 caracteres, no puede ser nulo
    # Ejemplos: 'Administrador', 'Empleado', 'Supervisor'
    nombreRol = db.Column(db.String(50), nullable=False)

    # Relacion inversa con el modelo Usuario: permite acceder a todos los usuarios que tienen este rol
    # back_populates="rol" permite acceder desde Usuario al rol asignado
    usuarios = db.relationship("Usuario", back_populates="rol")
