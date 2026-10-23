"""
ARCHIVO: detalle_orden.py
PROPOSITO: Define el modelo de base de datos para la tabla 'detalle_orden'. Representa los
           detalles individuales de cada orden de produccion, especificando que productos
           fueron solicitados y en que cantidad. Este modelo funciona como una tabla pivote
           entre las ordenes de produccion y los productos, permitiendo que una orden
           contenga multiples productos con cantidades diferentes. Establece relaciones
           con la orden de produccion y el producto referenciado.
"""

# Importa el objeto 'db' (instancia de SQLAlchemy) desde el modulo de configuracion de base de datos
# Se utiliza para definir columnas, relaciones y como clase base para los modelos
from app.database.database import db

# Define el modelo DetalleOrden que hereda de db.Model, registrandolo como modelo de SQLAlchemy
class DetalleOrden(db.Model):
    # Nombre de la tabla en la base de datos donde se almacenan los detalles de las ordenes
    __tablename__ = "detalle_orden"

    # Campo clave primaria: identificador unico del detalle de orden, cadena de hasta 10 caracteres
    idDetalle = db.Column(db.String(10), primary_key=True)

    # Clave foranea que referencia a la orden de produccion en la tabla 'orden_produccion'
    # ondelete="CASCADE" significa que si se elimina la orden, se eliminan sus detalles automaticamente
    idOrden = db.Column(db.String(10), db.ForeignKey("orden_produccion.idOrden", ondelete="CASCADE"))

    # Clave foranea que referencia al producto en la tabla 'producto'
    # Identifica que producto fue solicitado en este detalle de la orden
    idProducto = db.Column(db.String(10), db.ForeignKey("producto.idProducto"))

    # Cantidad total solicitada de este producto en la orden, almacenada como entero
    # Representa cuantas unidades del producto se necesitan fabricar
    cantidadTotal = db.Column(db.Integer)

    # Relacion con el modelo OrdenProduccion: accede a la orden a la que pertenece este detalle
    # back_populates="detalles" permite acceder desde OrdenProduccion a todos sus detalles
    orden = db.relationship("OrdenProduccion", back_populates="detalles")

    # Relacion con el modelo Producto: accede al producto referenciado en este detalle
    # back_populates="detalles_orden" permite acceder desde Producto a todos los detalles de orden donde aparece
    producto = db.relationship("Producto", back_populates="detalles_orden")
