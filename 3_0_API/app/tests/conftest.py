# =============================================================================
# ARCHIVO: conftest.py
# PROPOSITO: Configuracion global de pytest y definicion de fixtures (fase
#            Arrange base) para las pruebas de la API. Crea una instancia de
#            la aplicacion Flask conectada a una base de datos temporal en
#            memoria RAM (SQLite), inserta los datos semilla (roles, estados,
#            usuarios, categorias, unidades y metodos de pago) y destruye las
#            tablas al finalizar cada prueba para garantizar el aislamiento.
# =============================================================================

# Importar pytest para poder definir los fixtures que preparan el entorno
import pytest

# Importar la funcion factory para crear la instancia de la aplicacion Flask
from app import create_app

# Importar las instancias de SQLAlchemy y Bcrypt para interactuar con la
# base de datos de prueba y generar contrasenas hasheadas respectivamente
from app.database.database import db, bcrypt

# Importar todos los modelos ORM que seran utilizados para insertar los datos
# semilla iniciales en la base de datos temporal de pruebas
from app.models import Rol, EstadoUsuario, Usuario, Categoria, UnidadMedida, MetodoPago


# Decorador que registra la funcion como un fixture de pytest. Se ejecuta
# automaticamente antes de cualquier prueba que solicite "app" o "client"
@pytest.fixture(scope="function")
def app():
    # --- FASE ARRANGE GLOBAL (PREPARACION DEL ENTORNO) ---
    # Crear la instancia de la aplicacion Flask usando la fabrica de aplicaciones
    app = create_app()

    # Sobreescribir la configuracion de la aplicacion para el entorno de pruebas:
    # - TESTING: Activa el modo de pruebas de Flask para capturar errores internos
    # - SQLALCHEMY_DATABASE_URI: Desvia la conexion a una base de datos SQLite en
    #   memoria RAM para no modificar ni borrar la base de datos real
    # - WTF_CSRF_ENABLED: Desactiva tokens CSRF en caso de existir formularios
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "WTF_CSRF_ENABLED": False
    })

    # Abrir un contexto de aplicacion Flask, necesario para acceder a la base
    # de datos temporal y a la configuracion fuera de una peticion HTTP normal
    with app.app_context():
        # Crear todas las tablas definidas en los modelos ORM dentro de la
        # base de datos en memoria RAM
        db.create_all()

        # --- SEED DE ROLES DE PRUEBA ---
        # Insertar el rol de administrador con ID y nombre correspondiente
        db.session.add(Rol(idRol="ROL-001", nombreRol="ADMIN"))
        # Insertar el rol de empleado con ID y nombre correspondiente
        db.session.add(Rol(idRol="ROL-002", nombreRol="EMPLEADO"))
        # Confirmar la transaccion para persistir los roles en memoria
        db.session.commit()

        # --- SEED DE ESTADOS DE USUARIO DE PRUEBA ---
        # Insertar el estado "ACTIVO" para usuarios habilitados en el sistema
        db.session.add(EstadoUsuario(idEstado="EST-001", nombreEstado="ACTIVO"))
        # Insertar el estado "INACTIVO" para usuarios deshabilitados en el sistema
        db.session.add(EstadoUsuario(idEstado="EST-002", nombreEstado="INACTIVO"))
        # Confirmar la transaccion para persistir los estados en memoria
        db.session.commit()

        # --- SEED DE USUARIO ADMINISTRADOR DE PRUEBA ---
        # Crear la instancia del usuario administrador con todos sus atributos
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

        # --- SEED DE USUARIO EMPLEADO DE PRUEBA ---
        # Crear la instancia del usuario empleado con todos sus atributos
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
        # Confirmar la transaccion para persistir ambos usuarios en memoria
        db.session.commit()

        # --- SEED DE CATEGORIAS DE INSUMOS DE PRUEBA ---
        # Insertar las categorias base requeridas para las pruebas de insumos
        db.session.add(Categoria(idCategoria="CAT-001", nombreCategoria="Telas"))
        db.session.add(Categoria(idCategoria="CAT-002", nombreCategoria="Cauchos"))
        db.session.add(Categoria(idCategoria="CAT-003", nombreCategoria="Cremalleras"))
        db.session.add(Categoria(idCategoria="CAT-004", nombreCategoria="Moldes"))
        db.session.add(Categoria(idCategoria="CAT-005", nombreCategoria="Marquillas"))
        # Confirmar la transaccion para persistir las categorias en memoria
        db.session.commit()

        # --- SEED DE UNIDADES DE MEDIDA DE PRUEBA ---
        # Insertar las unidades de medida base para las pruebas
        db.session.add(UnidadMedida(idUnidad="MED-001", nombreUnidad="Metros"))
        db.session.add(UnidadMedida(idUnidad="MED-002", nombreUnidad="Unidades"))
        # Confirmar la transaccion para persistir las unidades en memoria
        db.session.commit()

        # --- SEED DE METODOS DE PAGO DE PRUEBA ---
        # Insertar los metodos de pago base para las pruebas
        db.session.add(MetodoPago(idMetodo="MET-001", nombreMetodo="Transferencia Bancaria"))
        db.session.add(MetodoPago(idMetodo="MET-002", nombreMetodo="Nequi"))
        db.session.add(MetodoPago(idMetodo="MET-003", nombreMetodo="Daviplata"))
        db.session.add(MetodoPago(idMetodo="MET-004", nombreMetodo="Efectivo"))
        # Confirmar la transaccion para persistir los metodos de pago en memoria
        db.session.commit()

        # --- ENTREGA DEL ENTORNO A LA PRUEBA (PAUSA) ---
        # Entregar la instancia "app" configurada y poblada a la funcion de prueba.
        # Aqui se ejecutan las fases Act y Assert del test correspondiente.
        yield app

        # --- FASE TEARDOWN (LIMPIEZA POST-PRUEBA) ---
        # Cerrar y limpiar cualquier sesion abierta en la base de datos
        db.session.remove()
        # Destruir todas las tablas de la memoria RAM para que la siguiente
        # prueba comience con una base de datos completamente limpia
        db.drop_all()


# Decorador que registra el cliente HTTP simulado para pruebas de integracion
@pytest.fixture(scope="function")
def client(app):
    # Retornar el cliente de pruebas de Flask (simula peticiones GET, POST, PUT,
    # DELETE a las rutas sin necesidad de encender el servidor real)
    return app.test_client()