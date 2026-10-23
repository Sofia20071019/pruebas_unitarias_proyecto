"""
ARCHIVO: usuario.py
PROPOSITO: Define el modelo de base de datos para la tabla 'usuario'. Representa a los usuarios
           del sistema, incluyendo sus datos personales (nombres, apellidos), credenciales de
           acceso (correo electronico y contrasena hasheada), asi como su rol asignado y estado
           actual. Este modelo establece relaciones con los roles, estados, ordenes de produccion,
           jornadas laborales y pagos asociados al usuario.
"""

# Importa el objeto 'db' (instancia de SQLAlchemy) desde el modulo de configuracion de base de datos
# Se utiliza para definir columnas, relaciones y como clase base para los modelos
from app.database.database import db

# Define el modelo Usuario que hereda de db.Model, registrandolo como modelo de SQLAlchemy
class Usuario(db.Model):
    # Nombre de la tabla en la base de datos donde se almacenan los registros de usuarios
    __tablename__ = "usuario"

    # Campo clave primaria: identificador unico del usuario, cadena de hasta 10 caracteres
    idUsuario = db.Column(db.String(10), primary_key=True)

    # Primer nombre del usuario, cadena de texto de hasta 50 caracteres, puede ser nulo
    pNombre = db.Column(db.String(50))

    # Segundo nombre del usuario, cadena de texto de hasta 50 caracteres, puede ser nulo
    sNombre = db.Column(db.String(50))

    # Primer apellido del usuario, cadena de texto de hasta 50 caracteres, puede ser nulo
    pApellido = db.Column(db.String(50))

    # Segundo apellido del usuario, cadena de texto de hasta 50 caracteres, puede ser nulo
    sApellido = db.Column(db.String(50))

    # Correo electronico del usuario, hasta 100 caracteres, debe ser unico y no puede ser nulo
    # Se utiliza para el inicio de sesion y comunicaciones
    correo = db.Column(db.String(100), unique=True, nullable=False)

    # Contrasena hasheada del usuario, hasta 255 caracteres, no puede ser nulo
    # Almacena el hash de la contrasena para seguridad, nunca el texto plano
    passwordHash = db.Column(db.String(255), nullable=False)

    # Clave foranea que referencia al rol del usuario en la tabla 'rol'
    # Si el rol se actualiza, se propaga el cambio con ON UPDATE CASCADE
    idRol = db.Column(db.String(10), db.ForeignKey("rol.idRol", onupdate="CASCADE"))

    # Clave foranea que referencia al estado del usuario en la tabla 'estado_usuario'
    # Si el estado se actualiza, se propaga el cambio con ON UPDATE CASCADE
    idEstado = db.Column(db.String(10), db.ForeignKey("estado_usuario.idEstado", onupdate="CASCADE"))

    # Relacion con el modelo Rol: accede al objeto Rol asociado a este usuario
    # back_populates="usuarios" permite acceder desde Rol a todos sus usuarios
    rol = db.relationship("Rol", back_populates="usuarios")

    # Relacion con el modelo EstadoUsuario: accede al estado actual del usuario (activo, inactivo, etc.)
    # back_populates="usuarios" permite acceder desde EstadoUsuario a todos los usuarios en ese estado
    estado = db.relationship("EstadoUsuario", back_populates="usuarios")

    # Relacion con las ordenes de produccion donde este usuario actua como administrador
    # foreign_keys especifica que se usa idUsuario_Admin como clave foranea en OrdenProduccion
    # back_populates="admin" permite acceder desde OrdenProduccion al admin que la creo
    ordenes = db.relationship("OrdenProduccion", back_populates="admin", foreign_keys="OrdenProduccion.idUsuario_Admin")

    # Relacion con las jornadas laborales del usuario como empleado
    # foreign_keys especifica que se usa idUsuario_Empleado como clave foranea en JornadaLaboral
    # back_populates="empleado" permite acceder desde JornadaLaboral al empleado asignado
    jornadas = db.relationship("JornadaLaboral", back_populates="empleado", foreign_keys="JornadaLaboral.idUsuario_Empleado")

    # Relacion con los pagos realizados por este usuario como administrador
    # foreign_keys especifica que se usa idUsuario_Admin como clave foranea en Pago
    # back_populates="admin_pago" permite acceder desde Pago al admin que registro el pago
    pagos = db.relationship("Pago", back_populates="admin_pago", foreign_keys="Pago.idUsuario_Admin")
