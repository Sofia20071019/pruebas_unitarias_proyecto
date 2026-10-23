"""
ARCHIVO: metodo_pago.py
PROPOSITO: Define el modelo de base de datos para la tabla 'metodo_pago'. Representa los
           metodos de pago disponibles en el sistema (por ejemplo: efectivo, transferencia
           bancaria, tarjeta de credito, tarjeta de debito, etc.). Cada metodo de pago
           tiene un identificador unico y un nombre descriptivo. Este modelo establece
           una relacion inversa con el modelo Pago para poder acceder a todos los pagos
           realizados con un metodo de pago especifico.
"""

# Importa el objeto 'db' (instancia de SQLAlchemy) desde el modulo de configuracion de base de datos
# Se utiliza para definir columnas, relaciones y como clase base para los modelos
from app.database.database import db

# Define el modelo MetodoPago que hereda de db.Model, registrandolo como modelo de SQLAlchemy
class MetodoPago(db.Model):
    # Nombre de la tabla en la base de datos donde se almacenan los metodos de pago
    __tablename__ = "metodo_pago"

    # Campo clave primaria: identificador unico del metodo de pago, cadena de hasta 10 caracteres
    idMetodo = db.Column(db.String(10), primary_key=True)

    # Nombre descriptivo del metodo de pago, cadena de texto de hasta 50 caracteres, puede ser nulo
    # Ejemplos: 'Efectivo', 'Transferencia Bancaria', 'Tarjeta de Credito', 'Tarjeta de Debito'
    nombreMetodo = db.Column(db.String(50))

    # Relacion inversa con el modelo Pago: permite acceder a todos los pagos realizados con este metodo
    # back_populates="metodo" permite acceder desde Pago al metodo de pago utilizado
    pagos = db.relationship("Pago", back_populates="metodo")
