"""
ARCHIVO: categoria.py
PROPOSITO: Define el modelo de base de datos para la tabla 'categoria'. Representa las categorias
           en las que se agrupan los insumos de la empresa. Cada categoria tiene un nombre
           descriptivo que identifica el tipo de insumo (por ejemplo: Telas, Botones, Hilos,
           Cremalleras, etc.). Este modelo establece una relacion inversa con el modelo
           Insumo para poder acceder a todos los insumos que pertenecen a una categoria.
"""

# Importa el objeto 'db' (instancia de SQLAlchemy) desde el modulo de configuracion de base de datos
# Se utiliza para definir columnas, relaciones y como clase base para los modelos
from app.database.database import db

# Define el modelo Categoria que hereda de db.Model, registrandolo como modelo de SQLAlchemy
class Categoria(db.Model):
    # Nombre de la tabla en la base de datos donde se almacenan las categorias de insumos
    __tablename__ = "categoria"

    # Campo clave primaria: identificador unico de la categoria, cadena de hasta 10 caracteres
    idCategoria = db.Column(db.String(10), primary_key=True)

    # Nombre descriptivo de la categoria, cadena de texto de hasta 100 caracteres, no puede ser nulo
    # Ejemplos: 'Telas', 'Botones', 'Hilos', 'Cremalleras', 'Etiquetas'
    nombreCategoria = db.Column(db.String(100), nullable=False)

    # Relacion inversa con el modelo Insumo: permite acceder a todos los insumos de esta categoria
    # back_populates="categoria" permite acceder desde Insumo a la categoria a la que pertenece
    insumos = db.relationship("Insumo", back_populates="categoria")
