"""
ARCHIVO: ficha_tecnica.py
PROPOSITO: Define el modelo de base de datos para la tabla 'ficha_tecnica'. Representa la
           ficha tecnica de cada producto, la cual define que insumos son necesarios para
           fabricarlo y en que cantidad. Funciona como una tabla pivote entre productos
           e insumos, permitiendo que un producto requiera multiples insumos y que un
           insumo sea utilizado en multiples productos. Cada registro indica la cantidad
           necesaria de un insumo especifico para producir el producto asociado.
"""

# Importa el objeto 'db' (instancia de SQLAlchemy) desde el modulo de configuracion de base de datos
# Se utiliza para definir columnas, relaciones y como clase base para los modelos
from app.database.database import db

# Define el modelo FichaTecnica que hereda de db.Model, registrandolo como modelo de SQLAlchemy
class FichaTecnica(db.Model):
    # Nombre de la tabla en la base de datos donde se almacenan las fichas tecnicas
    __tablename__ = "ficha_tecnica"

    # Campo clave primaria: identificador unico de la ficha tecnica, cadena de hasta 10 caracteres
    idFicha = db.Column(db.String(10), primary_key=True)

    # Clave foranea que referencia al producto en la tabla 'producto'
    # ondelete="CASCADE" significa que si se elimina el producto, se eliminan sus fichas tecnicas
    # Identifica a que producto pertenece esta ficha tecnica
    idProducto = db.Column(db.String(10), db.ForeignKey("producto.idProducto", ondelete="CASCADE"))

    # Clave foranea que referencia al insumo en la tabla 'insumo'
    # ondelete="CASCADE" significa que si se elimina el insumo, se eliminan las fichas que lo usan
    # Identifica que insumo se requiere para fabricar el producto
    idInsumo = db.Column(db.String(10), db.ForeignKey("insumo.idInsumo", ondelete="CASCADE"))

    # Cantidad necesaria del insumo para fabricar una unidad del producto
    # Numero decimal con 10 digitos totales y 2 decimales, puede ser nulo
    # Ejemplo: 1.50 metros de tela para producir una camisa
    cantidadNecesaria = db.Column(db.Numeric(10, 2))

    # Relacion con el modelo Producto: accede al producto al que pertenece esta ficha tecnica
    # back_populates="fichas_tecnicas" permite acceder desde Producto a todas sus fichas tecnicas
    producto = db.relationship("Producto", back_populates="fichas_tecnicas")

    # Relacion con el modelo Insumo: accede al insumo que se requiere segun esta ficha tecnica
    # back_populates="fichas_tecnicas" permite acceder desde Insumo a todas las fichas tecnicas donde se usa
    insumo = db.relationship("Insumo", back_populates="fichas_tecnicas")
