"""
ARCHIVO: pago.py
PROPOSITO: Define el modelo de base de datos para la tabla 'pago'. Representa los pagos
           realizados a los empleados por sus jornadas laborales. Cada pago registra a que
           jornada laboral corresponde, quien fue el administrador que autorizo el pago,
           el monto pagado, el metodo de pago utilizado y la fecha en que se realizo.
           Este modelo establece relaciones con la jornada laboral, el administrador
           responsable y el metodo de pago utilizado.
"""

# Importa el objeto 'db' (instancia de SQLAlchemy) desde el modulo de configuracion de base de datos
# Se utiliza para definir columnas, relaciones y como clase base para los modelos
from app.database.database import db

# Define el modelo Pago que hereda de db.Model, registrandolo como modelo de SQLAlchemy
class Pago(db.Model):
    # Nombre de la tabla en la base de datos donde se almacenan los registros de pagos
    __tablename__ = "pago"

    # Campo clave primaria: identificador unico del pago, cadena de hasta 10 caracteres
    idPago = db.Column(db.String(10), primary_key=True)

    # Clave foranea que referencia a la jornada laboral en la tabla 'jornada_laboral'
    # Identifica a que jornada corresponde este pago
    idJornada = db.Column(db.String(10), db.ForeignKey("jornada_laboral.idJornada"))

    # Clave foranea que referencia al administrador que autorizo el pago en la tabla 'usuario'
    # Identifica que usuario del sistema registro o aprobo este pago
    idUsuario_Admin = db.Column(db.String(10), db.ForeignKey("usuario.idUsuario"))

    # Monto total pagado, numero decimal con 10 digitos totales y 2 decimales
    # Representa la cantidad monetaria pagada al empleado por su jornada
    montoPagado = db.Column(db.Numeric(10, 2))

    # Clave foranea que referencia al metodo de pago en la tabla 'metodo_pago'
    # Indica como se realizo el pago (efectivo, transferencia bancaria, etc.)
    idMetodo = db.Column(db.String(10), db.ForeignKey("metodo_pago.idMetodo"))

    # Fecha en que se realizo el pago, almacenada como tipo Date (solo fecha, sin hora)
    fechaPago = db.Column(db.Date)

    # Relacion con el modelo JornadaLaboral: accede a la jornada laboral por la que se realizo el pago
    # back_populates="pagos" permite acceder desde JornadaLaboral a todos sus pagos asociados
    jornada = db.relationship("JornadaLaboral", back_populates="pagos")

    # Relacion con el modelo Usuario (como administrador): accede al admin que autorizo el pago
    # foreign_keys=[idUsuario_Admin] especifica que se usa esta columna como clave foranea
    # back_populates="pagos" permite acceder desde Usuario a los pagos que autorizo
    admin_pago = db.relationship("Usuario", back_populates="pagos", foreign_keys=[idUsuario_Admin])

    # Relacion con el modelo MetodoPago: accede al metodo de pago utilizado para este pago
    # back_populates="pagos" permite acceder desde MetodoPago a todos los pagos realizados con ese metodo
    metodo = db.relationship("MetodoPago", back_populates="pagos")
