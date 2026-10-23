"""
ARCHIVO: app/routes/molde_routes.py
PROPOSITO: Definicion de las rutas para el modulo de moldes.
"""
from flask import Blueprint
from app.controllers.molde_controller import MoldeController

molde_bp = Blueprint("molde", __name__)

# Subida fisica de archivos de imagen
molde_bp.add_url_rule("/api/moldes/subir-imagen", view_func=MoldeController.subir_imagen, methods=["POST"])

# Categorias
molde_bp.add_url_rule("/api/moldes/categorias", view_func=MoldeController.listar_categorias, methods=["GET"])
molde_bp.add_url_rule("/api/moldes/categorias", view_func=MoldeController.crear_categoria, methods=["POST"])
molde_bp.add_url_rule(
    "/api/moldes/categorias/<string:idCategoriaMolde>",
    view_func=MoldeController.eliminar_categoria,
    methods=["DELETE"]
)

# Moldes
molde_bp.add_url_rule("/api/moldes", view_func=MoldeController.listar_moldes, methods=["GET"])
molde_bp.add_url_rule("/api/moldes", view_func=MoldeController.crear_molde, methods=["POST"])
molde_bp.add_url_rule("/api/moldes/<string:idMolde>", view_func=MoldeController.obtener_molde, methods=["GET"])
molde_bp.add_url_rule("/api/moldes/<string:idMolde>", view_func=MoldeController.actualizar_molde, methods=["PUT"])
molde_bp.add_url_rule("/api/moldes/<string:idMolde>", view_func=MoldeController.eliminar_molde, methods=["DELETE"])