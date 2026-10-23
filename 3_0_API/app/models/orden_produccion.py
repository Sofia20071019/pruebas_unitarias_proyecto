"""
ARCHIVO: orden_produccion.py
PROPOSITO: Define el modelo de base de datos para la tabla 'orden_produccion'. Representa las
           ordenes de produccion que solicitan los clientes. Cada orden esta asociada a un
           cliente que la realiza, un administrador que la registra, lleva un registro de la
           fecha del pedido y su estado actual de produccion. Este modelo establece relaciones
           con el cliente, el administrador responsable y los detalles de la orden (productos
           solicitados y cantidades).
"""

# Importa el objeto 'db' (instancia de SQLAlchemy) desde el modulo de configuracion de base de datos
# Se utiliza para definir columnas, relaciones y como clase base para los modelos
from app.database.database import db

# Define el modelo OrdenProduccion que hereda de db.Model, registrandolo como modelo de SQLAlchemy
class OrdenProduccion(db.Model):
    # Nombre de la tabla en la base de datos donde se almacenan las ordenes de produccion
    __tablename__ = "orden_produccion"

    # Campo clave primaria: identificador unico de la orden de produccion, cadena de hasta 10 caracteres
    idOrden = db.Column(db.String(10), primary_key=True)

    # Clave foranea que referencia al cliente que realizo el pedido en la tabla 'cliente'
    # Identifica que cliente solicito esta orden de produccion
    idCliente = db.Column(db.String(10), db.ForeignKey("cliente.idCliente"))

    # Clave foranea que referencia al administrador que registro la orden en la tabla 'usuario'
    # Identifica que usuario del sistema creo o gestiono esta orden
    idUsuario_Admin = db.Column(db.String(10), db.ForeignKey("usuario.idUsuario"))

    # Fecha en que se realizo el pedido, almacenada como tipo Date (solo fecha, sin hora)
    fechaPedido = db.Column(db.Date)

    # Estado actual de la orden de produccion, cadena de hasta 50 caracteres
    # Ejemplos: 'Pendiente', 'En Produccion', 'Completada', 'Cancelada'
    estadoProd = db.Column(db.String(50))

    # Relacion con el modelo Cliente: accede al cliente que realizo el pedido
    # back_populates="ordenes" permite acceder desde Cliente a todas sus ordenes
    cliente = db.relationship("Cliente", back_populates="ordenes")

    # Relacion con el modelo Usuario (como administrador): accede al admin que registro la orden
    # foreign_keys=[idUsuario_Admin] especifica que se usa esta columna como clave foranea
    # back_populates="ordenes" permite acceder desde Usuario a las ordenes que gestiono
    admin = db.relationship("Usuario", back_populates="ordenes", foreign_keys=[idUsuario_Admin])

    # Relacion con el modelo DetalleOrden: permite acceder a todos los detalles de esta orden
    # cascade="all, delete-orphan" significa que al eliminar una orden, se eliminan sus detalles
    # back_populates="orden" permite acceder desde DetalleOrden a la orden a la que pertenece
    detalles = db.relationship("DetalleOrden", back_populates="orden", cascade="all, delete-orphan")
