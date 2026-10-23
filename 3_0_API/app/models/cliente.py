"""
ARCHIVO: cliente.py
PROPOSITO: Define el modelo de base de datos para la tabla 'cliente'. Representa a los clientes
           de la empresa que realizan pedidos de productos. Almacena informacion basica del cliente
           como su nombre y telefono de contacto. Este modelo establece una relacion con las
           ordenes de produccion para rastrear que cliente realizo cada pedido.
"""

# Importa el objeto 'db' (instancia de SQLAlchemy) desde el modulo de configuracion de base de datos
# Se utiliza para definir columnas, relaciones y como clase base para los modelos
from app.database.database import db

# Define el modelo Cliente que hereda de db.Model, registrandolo como modelo de SQLAlchemy
class Cliente(db.Model):
    # Nombre de la tabla en la base de datos donde se almacenan los registros de clientes
    __tablename__ = "cliente"

    # Campo clave primaria: identificador unico del cliente, cadena de hasta 10 caracteres
    idCliente = db.Column(db.String(10), primary_key=True)

    # Nombre o razon social del cliente, cadena de texto de hasta 100 caracteres, puede ser nulo
    nombreCliente = db.Column(db.String(100))

    # Numero de telefono del cliente, almacenado como entero grande (BigInteger)
    # Permite guardar numeros de telefono largos sin restriccion de formato
    telefono = db.Column(db.BigInteger)

    # Relacion con el modelo OrdenProduccion: permite acceder a todas las ordenes de este cliente
    # back_populates="cliente" permite acceder desde OrdenProduccion al cliente que realizo el pedido
    ordenes = db.relationship("OrdenProduccion", back_populates="cliente")
