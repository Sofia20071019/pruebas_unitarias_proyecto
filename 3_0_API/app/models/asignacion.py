"""
ARCHIVO: asignacion.py
PROPOSITO: Define el modelo de base de datos para la tabla 'asignacion'. Representa las
           asignaciones de insumos a empleados para su uso en el proceso de produccion.
           Cada asignacion registra que empleado recibio que insumo, en que cantidad,
           en que fecha y cual es el estado actual de la asignacion (pendiente, aprobada, etc.).
           Este modelo establece relaciones con el empleado (usuario) que recibe el insumo
           y con el insumo que se asigna.
"""

# Importa el objeto 'db' (instancia de SQLAlchemy) desde el modulo de configuracion de base de datos
# Se utiliza para definir columnas, relaciones y como clase base para los modelos
from app.database.database import db

# Define el modelo Asignacion que hereda de db.Model, registrandolo como modelo de SQLAlchemy
class Asignacion(db.Model):
    # Nombre de la tabla en la base de datos donde se almacenan las asignaciones de insumos
    __tablename__ = "asignacion"

    # Campo clave primaria: identificador unico de la asignacion, cadena de hasta 10 caracteres
    idAsignacion = db.Column(db.String(10), primary_key=True)

    # Clave foranea que referencia al empleado en la tabla 'usuario'
    # Identifica que usuario del sistema recibe la asignacion del insumo
    idUsuario_Empleado = db.Column(db.String(10), db.ForeignKey("usuario.idUsuario"))

    # Clave foranea que referencia al insumo en la tabla 'insumo'
    # Identifica que insumo se esta asignando al empleado
    idInsumo = db.Column(db.String(10), db.ForeignKey("insumo.idInsumo"))

    # Cantidad asignada del insumo, numero decimal con 10 digitos totales y 2 decimales
    # No puede ser nulo, ya que toda asignacion debe especificar la cantidad entregada
    cantidad = db.Column(db.Numeric(10, 2), nullable=False)

    # Fecha en que se realizo la asignacion, almacenada como tipo Date (solo fecha, sin hora)
    fechaAsignacion = db.Column(db.Date)

    # Estado actual de la asignacion, cadena de hasta 20 caracteres, valor por defecto 'Pendiente'
    # Indica si la asignacion esta pendiente de aprobacion, aprobada, rechazada, etc.
    estado = db.Column(db.String(20), default="Pendiente")

    # Relacion con el modelo Usuario (como empleado): accede al empleado que recibio la asignacion
    # backref="asignaciones" crea automaticamente la relacion inversa en Usuario
    # Permite acceder desde Usuario a todas las asignaciones que recibio
    empleado = db.relationship("Usuario", backref="asignaciones")

    # Relacion con el modelo Insumo: accede al insumo que fue asignado
    # back_populates="asignaciones" permite acceder desde Insumo a todas sus asignaciones
    insumo = db.relationship("Insumo", back_populates="asignaciones")
