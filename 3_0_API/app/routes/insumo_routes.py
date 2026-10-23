"""
ARCHIVO: insumo_routes.py
PROPOSITO: Definicion de las rutas HTTP para el modulo de insumos del inventario.
           Registra los endpoints para operaciones CRUD de insumos, incluyendo
           listado, creacion, actualizacion y eliminacion. Los insumos representan
           los materiales utilizados en la produccion.
           Utiliza el patron Blueprint de Flask para organizar las rutas de forma modular.
"""

# Importacion de Blueprint para crear un grupo de rutas modular
from flask import Blueprint

# Importacion del controlador de insumos que maneja la logica de cada endpoint
from app.controllers.insumo_controller import InsumoController

# Crear el Blueprint de insumos con el nombre "insumo"
insumo_bp = Blueprint("insumo", __name__)

# Registrar la ruta GET /api/insumos que lista todos los insumos del inventario
# Retorna la lista completa de insumos ordenados alfabeticamente
insumo_bp.add_url_rule("/api/insumos", view_func=InsumoController.listar_insumos, methods=["GET"])

# Registrar la ruta POST /api/insumos que permite crear un nuevo insumo en el inventario
# Recibe nombre, categoria y unidad de medida en el cuerpo de la peticion
insumo_bp.add_url_rule("/api/insumos", view_func=InsumoController.crear_insumo, methods=["POST"])

# Registrar la ruta PUT /api/insumos/<id> que actualiza los datos de un insumo existente
# El ID del insumo se pasa como parametro en la URL
insumo_bp.add_url_rule("/api/insumos/<string:idInsumo>", view_func=InsumoController.actualizar_insumo, methods=["PUT"])

# Registrar la ruta DELETE /api/insumos/<id> que elimina un insumo del inventario
# El ID del insumo a eliminar se pasa como parametro en la URL
insumo_bp.add_url_rule("/api/insumos/<string:idInsumo>", view_func=InsumoController.eliminar_insumo, methods=["DELETE"])
