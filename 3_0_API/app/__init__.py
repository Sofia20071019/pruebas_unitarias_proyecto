# =============================================================================
# ARCHIVO: __init__.py
# PROPOSITO: Modulo initializer del paquete "app". Implementa el patron
#            factory (fabrica) para crear y configurar la instancia de la
#            aplicacion Flask. Configura las extensiones (CORS, SQLAlchemy,
#            Bcrypt, Migrate), registra todos los blueprints de rutas y
#            centraliza la logica de inicializacion de la API REST.
# =============================================================================

import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate

from app.config.settings import Config
from app.database.database import db, bcrypt

# Importar modelos ORM
from app.models import (
    Rol, EstadoUsuario, Usuario, Categoria, UnidadMedida,
    Insumo, Producto, FichaTecnica, Cliente, OrdenProduccion,
    DetalleOrden, MetodoPago, JornadaLaboral, Pago
)
from app.models.molde import CategoriaMolde, Molde, MoldeTallaImagen

migrate = Migrate()


def create_app():
    """
    Fabrica de aplicaciones Flask. Crea, configura y retorna una instancia
    completa de la aplicacion con todas las extensiones y blueprints registrados.
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configuracion de carpeta de uploads para moldes
    upload_folder = os.path.join(app.root_path, "uploads", "moldes")
    os.makedirs(upload_folder, exist_ok=True)
    app.config["UPLOAD_FOLDER"] = upload_folder

    # Habilitar CORS en toda la aplicacion
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Inicializar extensiones
    db.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)

    # Ruta estatica para servir imagenes subidas
    @app.route("/uploads/moldes/<path:filename>")
    def servir_imagen_molde(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    # --- IMPORTACIONES DE BLUEPRINTS DE RUTAS ---
    from app.routes.auth_routes import auth_bp
    from app.routes.usuario_routes import usuario_bp
    from app.routes.rol_routes import rol_bp
    from app.routes.insumo_routes import insumo_bp
    from app.routes.orden_routes import orden_bp
    from app.routes.jornada_routes import jornada_bp
    from app.routes.pago_routes import pago_bp
    from app.routes.categoria_routes import categoria_bp
    from app.routes.unidad_medida_routes import unidad_medida_bp
    from app.routes.cliente_routes import cliente_bp
    from app.routes.producto_routes import producto_bp
    from app.routes.metodo_pago_routes import metodo_pago_bp
    from app.routes.asignacion_routes import asignacion_bp
    from app.routes.reporte_routes import reporte_bp
    from app.routes.molde_routes import molde_bp

    # --- REGISTRO DE BLUEPRINTS ---
    app.register_blueprint(auth_bp)
    app.register_blueprint(usuario_bp)
    app.register_blueprint(rol_bp)
    app.register_blueprint(insumo_bp)
    app.register_blueprint(orden_bp)
    app.register_blueprint(jornada_bp)
    app.register_blueprint(pago_bp)
    app.register_blueprint(categoria_bp)
    app.register_blueprint(unidad_medida_bp)
    app.register_blueprint(cliente_bp)
    app.register_blueprint(producto_bp)
    app.register_blueprint(metodo_pago_bp)
    app.register_blueprint(asignacion_bp)
    app.register_blueprint(reporte_bp)
    app.register_blueprint(molde_bp)

    return app 