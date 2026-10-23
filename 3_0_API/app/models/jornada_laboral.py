"""
ARCHIVO: jornada_laboral.py
PROPOSITO: Define el modelo de base de datos para la tabla 'jornada_laboral'. Representa las
           jornadas laborales de los empleados, registrando cuando trabajaron. Cada jornada
           esta asociada a un empleado (usuario del sistema), incluye la fecha de trabajo
           y las horas de inicio y fin de la jornada. Este modelo establece relaciones
           con el empleado (usuario) y con los pagos asociados a esa jornada.
"""

# Importa el objeto 'db' (instancia de SQLAlchemy) desde el modulo de configuracion de base de datos
# Se utiliza para definir columnas, relaciones y como clase base para los modelos
from app.database.database import db

# Define el modelo JornadaLaboral que hereda de db.Model, registrandolo como modelo de SQLAlchemy
class JornadaLaboral(db.Model):
    # Nombre de la tabla en la base de datos donde se almacenan las jornadas laborales
    __tablename__ = "jornada_laboral"

    # Campo clave primaria: identificador unico de la jornada laboral, cadena de hasta 10 caracteres
    idJornada = db.Column(db.String(10), primary_key=True)

    # Clave foranea que referencia al empleado en la tabla 'usuario'
    # Identifica que usuario del sistema trabajo en esta jornada
    idUsuario_Empleado = db.Column(db.String(10), db.ForeignKey("usuario.idUsuario"))

    # Fecha en que se realizo la jornada laboral, almacenada como tipo Date (solo fecha, sin hora)
    fecha = db.Column(db.Date)

    # Hora de inicio de la jornada laboral, almacenada como tipo Time (solo hora, sin fecha)
    # Representa a que hora empezo a trabajar el empleado
    hInicio = db.Column(db.Time)

    # Hora de fin de la jornada laboral, almacenada como tipo Time (solo hora, sin fecha)
    # Representa a que hora termino de trabajar el empleado
    hFin = db.Column(db.Time)

    # Relacion con el modelo Usuario (como empleado): accede al empleado que realizo esta jornada
    # foreign_keys=[idUsuario_Empleado] especifica que se usa esta columna como clave foranea
    # back_populates="jornadas" permite acceder desde Usuario a todas sus jornadas laborales
    empleado = db.relationship("Usuario", back_populates="jornadas", foreign_keys=[idUsuario_Empleado])

    # Relacion con el modelo Pago: permite acceder a todos los pagos asociados a esta jornada
    # Un empleado puede recibir uno o mas pagos por una misma jornada laboral
    # back_populates="jornada" permite acceder desde Pago a la jornada por la que se pago
    pagos = db.relationship("Pago", back_populates="jornada")
