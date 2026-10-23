"""
ARCHIVO: estado_usuario.py
PROPOSITO: Define el modelo de base de datos para la tabla 'estado_usuario'. Representa los
           estados posibles en los que puede encontrarse un usuario del sistema (por ejemplo:
           Activo, Inactivo, Suspendido, etc.). Cada estado tiene un identificador unico y
           un nombre descriptivo. Este modelo establece una relacion inversa con el modelo
           Usuario para poder acceder a todos los usuarios que se encuentran en un estado
           especifico.
"""

# Importa el objeto 'db' (instancia de SQLAlchemy) desde el modulo de configuracion de base de datos
# Se utiliza para definir columnas, relaciones y como clase base para los modelos
from app.database.database import db

# Define el modelo EstadoUsuario que hereda de db.Model, registrandolo como modelo de SQLAlchemy
class EstadoUsuario(db.Model):
    # Nombre de la tabla en la base de datos donde se almacenan los estados de usuario
    __tablename__ = "estado_usuario"

    # Campo clave primaria: identificador unico del estado, cadena de hasta 10 caracteres
    idEstado = db.Column(db.String(10), primary_key=True)

    # Nombre descriptivo del estado, cadena de texto de hasta 50 caracteres, no puede ser nulo
    # Ejemplos: 'Activo', 'Inactivo', 'Suspendido', 'Pendiente de Aprobacion'
    nombreEstado = db.Column(db.String(50), nullable=False)

    # Relacion inversa con el modelo Usuario: permite acceder a todos los usuarios en este estado
    # back_populates="estado" permite acceder desde Usuario al estado en el que se encuentra
    usuarios = db.relationship("Usuario", back_populates="estado")
