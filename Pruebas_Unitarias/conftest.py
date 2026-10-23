import os
import sys
import pkgutil
import importlib
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
API = RAIZ / "3_0_API"

sys.path.insert(0, str(API))

# Variables falsas para que settings.py pueda arrancar
for nombre, valor in {
    "MYSQL_USER": "test", "MYSQL_PASSWORD": "test", "MYSQL_HOST": "localhost",
    "MYSQL_PORT": "3306", "MYSQL_DATABASE": "test", "SECRET_KEY": "clave-de-pruebas",
}.items():
    os.environ.setdefault(nombre, valor)


def _importar_todos_los_servicios():
    import app.services as paquete
    for m in pkgutil.iter_modules(paquete.__path__):
        importlib.import_module(f"app.services.{m.name}")


@pytest.fixture(scope="session")
def app():
    from sqlalchemy.pool import StaticPool
    from app.config.settings import Config

    # Debe cambiarse ANTES de create_app()
    Config.SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    Config.SQLALCHEMY_ENGINE_OPTIONS = {
        "poolclass": StaticPool,
        "connect_args": {"check_same_thread": False},
    }
    from app import create_app
    from app.database.database import db

    flask_app = create_app()
    flask_app.config["TESTING"] = True
    _importar_todos_los_servicios()
    with flask_app.app_context():
        db.create_all()
    return flask_app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture(autouse=True)
def limpiar_tablas(app):
    from app.database.database import db
    with app.app_context():
        db.create_all()
        for tabla in reversed(db.metadata.sorted_tables):
            db.session.execute(tabla.delete())
        db.session.commit()
    yield


@pytest.fixture
def codigo_fuente():
    def _leer(ruta_relativa):
        return (RAIZ / ruta_relativa).read_text(encoding="utf-8")
    return _leer