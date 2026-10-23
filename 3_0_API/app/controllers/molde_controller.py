"""
ARCHIVO: app/controllers/molde_controller.py
PROPOSITO: Controlador de endpoints para el modulo de moldes.
           Restringe modificaciones solo a ROL-001 (Administrador)
           y permite lectura con token autenticado (Admin o Empleado).
"""
# pylint: disable=broad-exception-caught,invalid-name,line-too-long

from flask import request, jsonify
from app.utils.decorators import token_requerido, rol_requerido
from app.services.molde_service import MoldeService


class MoldeController:
    """Clase controladora con endpoints para la gestion de moldes y categorias."""

    # ------------------ SUBIDA DE ARCHIVOS ------------------
    @staticmethod
    @rol_requerido("ROL-001")
    def subir_imagen():
        """Sube un archivo de imagen desde el dispositivo y devuelve su URL publica."""
        if "archivo" not in request.files:
            return jsonify({
                "status": "error",
                "message": "No se envió ningún archivo de imagen"
            }), 400

        archivo = request.files["archivo"]
        try:
            url_relativa = MoldeService.guardar_imagen_talla(archivo)
            url_completa = f"{request.host_url.rstrip('/')}{url_relativa}"
            return jsonify({
                "status": "success",
                "data": {
                    "url": url_completa,
                    "urlRelativa": url_relativa
                }
            }), 201
        except ValueError as ve:
            return jsonify({"status": "error", "message": str(ve)}), 400
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    # ------------------ CATEGORIAS ------------------
    @staticmethod
    @token_requerido
    def listar_categorias():
        """Obtiene el listado completo de categorias de moldes."""
        try:
            categorias = MoldeService.listar_categorias()
            return jsonify({
                "status": "success",
                "data": [c.to_dict() for c in categorias]
            }), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @rol_requerido("ROL-001")
    def crear_categoria():
        """Crea una nueva categoria de molde en el sistema."""
        data = request.get_json() or {}
        nombre = data.get("nombreCategoria")
        if not nombre:
            return jsonify({
                "status": "error",
                "message": "El nombre de la categoría es requerido"
            }), 400
        try:
            cat = MoldeService.crear_categoria(nombre)
            return jsonify({"status": "success", "data": cat.to_dict()}), 201
        except ValueError as ve:
            return jsonify({"status": "error", "message": str(ve)}), 400
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @rol_requerido("ROL-001")
    def eliminar_categoria(idCategoriaMolde):
        """Elimina una categoria de molde por su ID si no tiene registros asociados."""
        try:
            cat = MoldeService.eliminar_categoria(idCategoriaMolde)
            if not cat:
                return jsonify({
                    "status": "error",
                    "message": "Categoría no encontrada"
                }), 404
            return jsonify({
                "status": "success",
                "message": "Categoría eliminada exitosamente"
            }), 200
        except ValueError as ve:
            return jsonify({"status": "error", "message": str(ve)}), 400
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    # ------------------ MOLDES ------------------
    @staticmethod
    @token_requerido
    def listar_moldes():
        """Lista todos los moldes aplicando filtros opcionales de nombre, categoria o genero."""
        try:
            nombre = request.args.get("nombre")
            categoria = request.args.get("categoria")
            genero = request.args.get("genero")
            moldes = MoldeService.listar_moldes(
                nombre=nombre,
                idCategoria=categoria,
                genero=genero
            )
            return jsonify({
                "status": "success",
                "data": [m.to_dict() for m in moldes]
            }), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @token_requerido
    def obtener_molde(idMolde):
        """Obtiene la informacion completa de un molde por su ID."""
        try:
            molde = MoldeService.obtener_por_id(idMolde)
            if not molde:
                return jsonify({"status": "error", "message": "Molde no encontrado"}), 404
            return jsonify({"status": "success", "data": molde.to_dict()}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @rol_requerido("ROL-001")
    def crear_molde():
        """Crea un nuevo molde con sus especificaciones tecnicas e imagenes por talla."""
        data = request.get_json() or {}
        if not data.get("nombreMolde") or not data.get("idCategoriaMolde"):
            return jsonify({
                "status": "error",
                "message": "Nombre y Categoría son obligatorios"
            }), 400
        try:
            molde = MoldeService.crear_molde(
                nombreMolde=data.get("nombreMolde"),
                descripcion=data.get("descripcion", ""),
                indicaciones=data.get("indicaciones", ""),
                genero=data.get("genero", "unisex"),
                idCategoriaMolde=data.get("idCategoriaMolde"),
                tallas=data.get("tallas", [])
            )
            return jsonify({"status": "success", "data": molde.to_dict()}), 201
        except ValueError as ve:
            return jsonify({"status": "error", "message": str(ve)}), 400
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @rol_requerido("ROL-001")
    def actualizar_molde(idMolde):
        """Actualiza los datos o planos tecnicos de un molde existente."""
        data = request.get_json() or {}
        try:
            molde = MoldeService.actualizar_molde(idMolde, data)
            if not molde:
                return jsonify({"status": "error", "message": "Molde no encontrado"}), 404
            return jsonify({"status": "success", "data": molde.to_dict()}), 200
        except ValueError as ve:
            return jsonify({"status": "error", "message": str(ve)}), 400
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @rol_requerido("ROL-001")
    def eliminar_molde(idMolde):
        """Elimina permanentemente un molde y sus planos asociados."""
        try:
            molde = MoldeService.eliminar_molde(idMolde)
            if not molde:
                return jsonify({"status": "error", "message": "Molde no encontrado"}), 404
            return jsonify({
                "status": "success",
                "message": "Molde eliminado correctamente"
            }), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500