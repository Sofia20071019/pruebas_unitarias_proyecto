# =============================================================================
# ARCHIVO: sead.py
# PROPOSITO: Script de semilla (seed) para poblar la base de datos con datos
#            iniciales por defecto. Crea registros en las tablas de roles,
#            estados de usuario, usuario administrador, categorias, unidades
#            de medida y metodos de pago. Verifica antes de insertar para
#            evitar duplicados en ejecuciones repetidas.
# =============================================================================

# Importar la funcion factory para crear la instancia de la aplicacion Flask
from app import create_app

# Importar las instancias de SQLAlchemy y Bcrypt para interactuar con la
# base de datos y generar contrasenas hasheadas respectivamente
from app.database.database import db, bcrypt

# Importar todos los modelos ORM que seran utilizados para insertar datos
# iniciales en sus respectivas tablas
from app.models import Rol, EstadoUsuario, Usuario, Categoria, UnidadMedida, MetodoPago

# Crear la instancia de la aplicacion Flask usando la fabrica de aplicaciones
app = create_app()

# Abrir un contexto de aplicacion Flask, el cual es necesario para acceder
# a la base de datos y a la configuracion de la aplicacion fuera de un
# ciclo de peticion HTTP normal
with app.app_context():
    # Crear todas las tablas definidas en los modelos ORM si aun no existen
    # en la base de datos
    db.create_all()

    # --- SEED DE ROLES ---
    # Verificar si el rol con ID "ROL-001" ya existe en la base de datos
    if Rol.query.filter_by(idRol="ROL-001").first() is None:
        # Insertar el rol de administrador con ID y nombre correspondiente
        db.session.add(Rol(idRol="ROL-001", nombreRol="ADMIN"))
        # Insertar el rol de empleado con ID y nombre correspondiente
        db.session.add(Rol(idRol="ROL-002", nombreRol="EMPLEADO"))
        # Confirmar la transaccion para persistir los roles en la base de datos
        db.session.commit()
        # Mensaje de confirmacion en consola indicando que los roles fueron creados
        print("Roles creados.")

    # --- SEED DE ESTADOS DE USUARIO ---
    # Verificar si el estado con ID "EST-001" ya existe en la base de datos
    if EstadoUsuario.query.filter_by(idEstado="EST-001").first() is None:
        # Insertar el estado "ACTIVO" para usuarios habilitados en el sistema
        db.session.add(EstadoUsuario(idEstado="EST-001", nombreEstado="ACTIVO"))
        # Insertar el estado "INACTIVO" para usuarios deshabilitados en el sistema
        db.session.add(EstadoUsuario(idEstado="EST-002", nombreEstado="INACTIVO"))
        # Confirmar la transaccion para persistir los estados en la base de datos
        db.session.commit()
        # Mensaje de confirmacion en consola indicando que los estados fueron creados
        print("Estados de usuario creados.")

    # --- SEED DE USUARIO ADMINISTRADOR ---
    # Verificar si ya existe un usuario con el correo electronico del administrador
    if Usuario.query.filter_by(correo="admin@titan.com").first() is None:
        # Crear la instancia del usuario administrador con todos sus atributos:
        # - ID unico del usuario
        # - Primer y segundo nombre (segundo nombre es opcional, puede ser None)
        # - Primer y segundo apellido (segundo apellido es opcional, puede ser None)
        # - Correo electronico unico para autenticacion
        # - Contrasena hasheada con bcrypt para seguridad
        # - Rol asignado (ADMIN)
        # - Estado inicial (ACTIVO)
        admin = Usuario(
            idUsuario="USR-001",
            pNombre="Administrador",
            sNombre=None,
            pApellido="General",
            sApellido=None,
            correo="admin@titan.com",
            passwordHash=bcrypt.generate_password_hash("admin123").decode("utf-8"),
            idRol="ROL-001",
            idEstado="EST-001"
        )
        # Agregar el usuario administrador a la sesion de la base de datos
        db.session.add(admin)
        # Confirmar la transaccion para persistir el administrador en la base de datos
        db.session.commit()
        # Mensaje de confirmacion mostrando las credenciales del administrador creado
        print("Administrador creado: admin@titan.com / admin123")

    if Usuario.query.filter_by(correo="empleado@titan.com").first() is None:
        # Crear la instancia del usuario empleado con todos sus atributos:
        # - ID unico del usuario
        # - Primer y segundo nombre (segundo nombre es opcional, puede ser None)
        # - Primer y segundo apellido (segundo apellido es opcional, puede ser None)
        # - Correo electronico unico para autenticacion
        # - Contrasena hasheada con bcrypt para seguridad
        # - Rol asignado (ADMIN)
        # - Estado inicial (ACTIVO)
        empleado = Usuario(
            idUsuario="USR-002",
            pNombre="brayan",
            sNombre=None,
            pApellido="valderrama",
            sApellido=None,
            correo="empleado@titan.com",
            passwordHash=bcrypt.generate_password_hash("1234").decode("utf-8"),
            idRol="ROL-002",
            idEstado="EST-001"
        )
        # Agregar el usuario empleado a la sesion de la base de datos
        db.session.add(empleado)
        # Confirmar la transaccion para persistir el empleado en la base de datos
        db.session.commit()
        # Mensaje de confirmacion mostrando las credenciales del empleado creado
        print("Empleado creado: empleado@titan.com / 1234")

    # --- SEED DE CATEGORIAS DE INSUMOS ---
    # Verificar si la categoria con ID "CAT-001" ya existe en la base de datos
    if Categoria.query.filter_by(idCategoria="CAT-001").first() is None:
        # Insertar la categoria "Telas" para insumos de tipo textil
        db.session.add(Categoria(idCategoria="CAT-001", nombreCategoria="Telas"))
        # Insertar la categoria "Cauchos" para insumos de tipo caucho
        db.session.add(Categoria(idCategoria="CAT-002", nombreCategoria="Cauchos"))
        # Insertar la categoria "Cremalleras" para insumos de tipo cremallera
        db.session.add(Categoria(idCategoria="CAT-003", nombreCategoria="Cremalleras"))
        # Insertar la categoria "Moldes" para insumos de tipo molde
        db.session.add(Categoria(idCategoria="CAT-004", nombreCategoria="Moldes"))
        # Insertar la categoria "Marquillas" para insumos de tipo marquilla
        db.session.add(Categoria(idCategoria="CAT-005", nombreCategoria="Marquillas"))
        # Confirmar la transaccion para persistir las categorias en la base de datos
        db.session.commit()
        # Mensaje de confirmacion indicando que las categorias fueron creadas
        print("Categorías creadas.")

    # --- SEED DE UNIDADES DE MEDIDA ---
    # Verificar si la unidad de medida con ID "MED-001" ya existe en la base de datos
    if UnidadMedida.query.filter_by(idUnidad="MED-001").first() is None:
        # Insertar la unidad de medida "Metros" para insumos vendidos por metro lineal
        db.session.add(UnidadMedida(idUnidad="MED-001", nombreUnidad="Metros"))
        # Insertar la unidad de medida "Unidades" para insumos vendidos por pieza
        db.session.add(UnidadMedida(idUnidad="MED-002", nombreUnidad="Unidades"))
        # Confirmar la transaccion para persistir las unidades de medida en la base de datos
        db.session.commit()
        # Mensaje de confirmacion indicando que las unidades de medida fueron creadas
        print("Unidades de medida creadas.")

    # --- SEED DE METODOS DE PAGO ---
    # Verificar si el metodo de pago con ID "MET-001" ya existe en la base de datos
    if MetodoPago.query.filter_by(idMetodo="MET-001").first() is None:
        # Insertar el metodo de pago "Transferencia Bancaria"
        db.session.add(MetodoPago(idMetodo="MET-001", nombreMetodo="Transferencia Bancaria"))
        # Insertar el metodo de pago "Nequi" (billetera virtual colombiana)
        db.session.add(MetodoPago(idMetodo="MET-002", nombreMetodo="Nequi"))
        # Insertar el metodo de pago "Daviplata" (billetera virtual colombiana)
        db.session.add(MetodoPago(idMetodo="MET-003", nombreMetodo="Daviplata"))
        # Insertar el metodo de pago "Efectivo" para pagos en efectivo
        db.session.add(MetodoPago(idMetodo="MET-004", nombreMetodo="Efectivo"))
        # Confirmar la transaccion para persistir los metodos de pago en la base de datos
        db.session.commit()
        # Mensaje de confirmacion indicando que los metodos de pago fueron creados
        print("Métodos de pago creados.")

    # Mensaje final indicando que el proceso de semilla se completo exitosamente
    print("Seed completado.")
