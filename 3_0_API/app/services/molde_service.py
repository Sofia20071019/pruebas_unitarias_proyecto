"""
ARCHIVO: app/services/molde_service.py
PROPOSITO: Capa de servicio para consultas filtradas, validaciones de texto,
           almacenamiento de imagenes locales y operaciones CRUD sobre moldes.
"""
import os
import re
import uuid
from flask import current_app
from werkzeug.utils import secure_filename
from app.database.database import db
from app.models.molde import Molde, CategoriaMolde, MoldeTallaImagen


class MoldeService:
    """Servicio de logica de negocio para moldes, categorias y archivos."""

    REGEX_TEXTO_SEGURO = r"^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s,\.]+$"
    EXTENSIONES_PERMITIDAS = {"png", "jpg", "jpeg", "webp"}

    @staticmethod
    def _generar_id(prefijo="MOL"):
        return f"{prefijo}-{uuid.uuid4().hex[:6].upper()}"

    @staticmethod
    def validar_texto(texto):
        """Valida que una cadena contenga solo caracteres alfanumericos seguros."""
        if not texto:
            return False
        return bool(re.match(MoldeService.REGEX_TEXTO_SEGURO, texto.strip()))

    @staticmethod
    def extension_valida(nombre_archivo):
        """Verifica si la extension del archivo es una imagen permitida."""
        return (
            "." in nombre_archivo
            and nombre_archivo.rsplit(".", 1)[1].lower() in MoldeService.EXTENSIONES_PERMITIDAS
        )

    @staticmethod
    def guardar_imagen_talla(archivo):
        """Guarda un archivo binario de imagen en el disco del servidor."""
        if not archivo or archivo.filename == "":
            raise ValueError("No se ha proporcionado un archivo valido.")

        if not MoldeService.extension_valida(archivo.filename):
            raise ValueError("Extension no permitida. Use imagenes PNG, JPG, JPEG o WEBP.")

        extension = archivo.filename.rsplit(".", 1)[1].lower()
        nombre_seguro = f"molde_{uuid.uuid4().hex[:12]}.{extension}"

        carpeta_destino = current_app.config["UPLOAD_FOLDER"]
        ruta_completa = os.path.join(carpeta_destino, nombre_seguro)
        archivo.save(ruta_completa)

        return f"/uploads/moldes/{nombre_seguro}"

    # --- CATEGORIAS ---
    @staticmethod
    def listar_categorias():
        """Retorna todas las categorias de moldes."""
        return CategoriaMolde.query.all()

    @staticmethod
    def crear_categoria(nombreCategoria):
        """Crea una nueva categoria de molde validando duplicados y caracteres."""
        nombre_limpio = (nombreCategoria or "").strip()
        if not MoldeService.validar_texto(nombre_limpio):
            raise ValueError("El nombre solo puede contener letras, números, comas y puntos.")

        existente = CategoriaMolde.query.filter(
            CategoriaMolde.nombreCategoria.ilike(nombre_limpio)
        ).first()
        if existente:
            raise ValueError("Ya existe una categoría registrada con ese nombre.")

        id_gen = MoldeService._generar_id("CTM")
        categoria = CategoriaMolde(idCategoriaMolde=id_gen, nombreCategoria=nombre_limpio)
        db.session.add(categoria)
        db.session.commit()
        return categoria

    @staticmethod
    def eliminar_categoria(idCategoriaMolde):
        """Elimina una categoria si no tiene moldes asociados."""
        categoria = CategoriaMolde.query.get(idCategoriaMolde)
        if not categoria:
            return None

        if categoria.moldes and len(categoria.moldes) > 0:
            raise ValueError("No se puede eliminar la categoría porque tiene moldes asociados.")

        db.session.delete(categoria)
        db.session.commit()
        return categoria

    # --- MOLDES ---
    @staticmethod
    def listar_moldes(nombre=None, idCategoria=None, genero=None):
        """Consulta y filtra el catalogo de moldes."""
        query = Molde.query
        if nombre:
            query = query.filter(Molde.nombreMolde.ilike(f"%{nombre.strip()}%"))
        if idCategoria and idCategoria != "todos":
            query = query.filter(Molde.idCategoriaMolde == idCategoria)
        if genero and genero != "todos":
            query = query.filter(Molde.genero == genero)
        return query.all()

    @staticmethod
    def obtener_por_id(idMolde):
        """Obtiene un molde por su ID primario."""
        return Molde.query.get(idMolde)

    @staticmethod
    def crear_molde(nombreMolde, descripcion, indicaciones, genero, idCategoriaMolde, tallas=None):
        """Registra un nuevo molde con sus tallas asociadas."""
        nombre_limpio = (nombreMolde or "").strip()
        desc_limpia = (descripcion or "").strip()
        indic_limpia = (indicaciones or "").strip()

        if not MoldeService.validar_texto(nombre_limpio):
            raise ValueError("El nombre solo puede contener letras, números, comas y puntos.")
        if desc_limpia and not MoldeService.validar_texto(desc_limpia):
            raise ValueError("La descripción solo puede contener letras, números, comas y puntos.")
        if indic_limpia and not MoldeService.validar_texto(indic_limpia):
            raise ValueError("Las indicaciones solo pueden contener letras, números, comas y puntos.")

        if not CategoriaMolde.query.get(idCategoriaMolde):
            raise ValueError("La categoría seleccionada no existe.")

        nuevo_id = MoldeService._generar_id("MOL")
        molde = Molde(
            idMolde=nuevo_id,
            nombreMolde=nombre_limpio,
            descripcion=desc_limpia,
            indicaciones=indic_limpia,
            genero=genero,
            idCategoriaMolde=idCategoriaMolde
        )
        db.session.add(molde)

        if tallas and isinstance(tallas, list):
            for item in tallas:
                talla_id = MoldeService._generar_id("MTL")
                talla_item = MoldeTallaImagen(
                    idMoldeTalla=talla_id,
                    idMolde=nuevo_id,
                    talla=item.get("talla"),
                    imagenUrl=item.get("imagenUrl")
                )
                db.session.add(talla_item)

        db.session.commit()
        return molde

    @staticmethod
    def actualizar_molde(idMolde, data):
        """Actualiza la informacion o tallas de un molde existente."""
        molde = Molde.query.get(idMolde)
        if not molde:
            return None

        if "nombreMolde" in data:
            val = (data["nombreMolde"] or "").strip()
            if not MoldeService.validar_texto(val):
                raise ValueError("El nombre solo puede contener letras, números, comas y puntos.")
            molde.nombreMolde = val

        if "descripcion" in data and data["descripcion"]:
            val = data["descripcion"].strip()
            if not MoldeService.validar_texto(val):
                raise ValueError("La descripción solo puede contener letras, números, comas y puntos.")
            molde.descripcion = val

        if "indicaciones" in data and data["indicaciones"]:
            val = data["indicaciones"].strip()
            if not MoldeService.validar_texto(val):
                raise ValueError("Las indicaciones solo pueden contener letras, números, comas y puntos.")
            molde.indicaciones = val

        if "genero" in data:
            molde.genero = data["genero"]
        if "idCategoriaMolde" in data:
            if not CategoriaMolde.query.get(data["idCategoriaMolde"]):
                raise ValueError("La categoría especificada no existe.")
            molde.idCategoriaMolde = data["idCategoriaMolde"]

        if "tallas" in data and isinstance(data["tallas"], list):
            MoldeTallaImagen.query.filter_by(idMolde=idMolde).delete()
            for item in data["tallas"]:
                talla_id = MoldeService._generar_id("MTL")
                talla_item = MoldeTallaImagen(
                    idMoldeTalla=talla_id,
                    idMolde=idMolde,
                    talla=item.get("talla"),
                    imagenUrl=item.get("imagenUrl")
                )
                db.session.add(talla_item)

        db.session.commit()
        return molde

    @staticmethod
    def eliminar_molde(idMolde):
        """Elimina un molde por ID."""
        molde = Molde.query.get(idMolde)
        if not molde:
            return None
        db.session.delete(molde)
        db.session.commit()
        return molde