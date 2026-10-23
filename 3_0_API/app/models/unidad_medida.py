"""
ARCHIVO: unidad_medida.py
PROPOSITO: Define el modelo de base de datos para la tabla 'unidad_medida'. Representa las
           unidades de medida utilizadas para cuantificar los insumos de la empresa
           (por ejemplo: metros, kilogramos, litros, unidades, rollos, etc.). Cada unidad
           de medida tiene un identificador unico y un nombre descriptivo. Este modelo
           establece una relacion inversa con el modelo Insumo para poder acceder a todos
           los insumos que se miden en una unidad especifica.
"""

# Importa el objeto 'db' (instancia de SQLAlchemy) desde el modulo de configuracion de base de datos
# Se utiliza para definir columnas, relaciones y como clase base para los modelos
from app.database.database import db

# Define el modelo UnidadMedida que hereda de db.Model, registrandolo como modelo de SQLAlchemy
class UnidadMedida(db.Model):
    # Nombre de la tabla en la base de datos donde se almacenan las unidades de medida
    __tablename__ = "unidad_medida"

    # Campo clave primaria: identificador unico de la unidad de medida, cadena de hasta 10 caracteres
    idUnidad = db.Column(db.String(10), primary_key=True)

    # Nombre descriptivo de la unidad de medida, cadena de texto de hasta 50 caracteres, puede ser nulo
    # Ejemplos: 'Metros', 'Kilogramos', 'Litros', 'Unidades', 'Rollos', 'Gramos'
    nombreUnidad = db.Column(db.String(50))

    # Relacion inversa con el modelo Insumo: permite acceder a todos los insumos que usan esta unidad
    # back_populates="unidad" permite acceder desde Insumo a la unidad de medida que le corresponde
    insumos = db.relationship("Insumo", back_populates="unidad")
