"""
ARCHIVO: producto.py
PROPOSITO: Define el modelo de base de datos para la tabla 'producto'. Representa los productos
           finales que se fabrican en la empresa. Cada producto tiene un nombre, talla y color
           que lo identifican. Este modelo establece relaciones con las fichas tecnicas
           (que definen los insumos necesarios para fabricarlo) y con los detalles de orden
           (que registran en que ordenes de produccion aparece y en que cantidad).
"""

# Importa el objeto 'db' (instancia de SQLAlchemy) desde el modulo de configuracion de base de datos
# Se utiliza para definir columnas, relaciones y como clase base para los modelos
from app.database.database import db

# Define el modelo Producto que hereda de db.Model, registrandolo como modelo de SQLAlchemy
class Producto(db.Model):
    # Nombre de la tabla en la base de datos donde se almacenan los registros de productos
    __tablename__ = "producto"

    # Campo clave primaria: identificador unico del producto, cadena de hasta 10 caracteres
    idProducto = db.Column(db.String(10), primary_key=True)

    # Nombre descriptivo del producto, cadena de texto de hasta 100 caracteres, puede ser nulo
    # Ejemplo: 'Camisa Formal', 'Pantalon Deportivo'
    nombreProducto = db.Column(db.String(100))

    # Talla del producto, cadena de texto de hasta 10 caracteres, puede ser nulo
    # Ejemplo: 'S', 'M', 'L', 'XL', '38', '42'
    talla = db.Column(db.String(10))

    # Color del producto, cadena de texto de hasta 50 caracteres, puede ser nulo
    # Ejemplo: 'Rojo', 'Azul Marino', 'Negro'
    color = db.Column(db.String(50))

    # Relacion con el modelo FichaTecnica: permite acceder a todas las fichas tecnicas de este producto
    # La ficha tecnica define que insumos y en que cantidades se necesitan para fabricar el producto
    # back_populates="producto" permite acceder desde FichaTecnica al producto asociado
    fichas_tecnicas = db.relationship("FichaTecnica", back_populates="producto")

    # Relacion con el modelo DetalleOrden: permite acceder a todos los detalles de orden donde aparece este producto
    # Cada detalle de orden indica en que orden de produccion se solicito este producto y en que cantidad
    # back_populates="producto" permite acceder desde DetalleOrden al producto referenciado
    detalles_orden = db.relationship("DetalleOrden", back_populates="producto")
