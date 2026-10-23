"""
ARCHIVO: insumo_controller.py
PROPOSITO: Controlador de insumos encargado de gestionar las operaciones CRUD
           (Crear, Leer, Actualizar, Eliminar) relacionadas con los insumos
           del sistema. Permite listar, crear, actualizar e eliminar insumos.
           Los endpoints de consulta requieren autenticación, mientras que las
           operaciones de escritura requieren rol de administrador.
"""

# Importación de 'request' para acceder a los datos de la petición HTTP entrante
from flask import request
# Importación de 'jsonify' para construir respuestas HTTP en formato JSON
from flask import jsonify
# Importación de decoradores para control de acceso: token JWT y roles
from app.utils.decorators import token_requerido, rol_requerido


class InsumoController:
    """
    Clase controladora que agrupa los métodos estáticos para la gestión
    completa de insumos del sistema.
    """

    @staticmethod
    @token_requerido
    def listar_insumos():
        """
        Endpoint para listar todos los insumos registrados en el sistema.
        Requiere autenticación válida (token JWT).
        Retorna una lista completa con la información de cada insumo
        incluyendo categoría, unidad de medida y cantidad disponible.
        """
        try:
            # Importación diferida del servicio de reportes para evitar dependencias circulares.
            # El servicio de reportes es la fuente única de datos que comparten la vista
            # y la exportación a Excel, garantizando consistencia entre ambas.
            from app.services.reporte_service import ReporteService
            # Obtener todos los insumos registrados en la base de datos
            insumos = ReporteService.obtener_materias_primas()
            # Retornar respuesta exitosa con la lista de insumos
            return jsonify({"status": "success", "data": insumos}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @rol_requerido("ROL-001")
    def crear_insumo():
        """
        Endpoint para crear un nuevo insumo en el sistema.
        Requiere rol de administrador (ROL-001).
        Recibe nombre, categoría, unidad de medida y cantidad en el cuerpo JSON.
        Retorna los datos del insumo creado con código 201.
        """
        data = request.get_json()
        try:
            from app.services.insumo_service import InsumoService
            insumo = InsumoService.crear_insumo(
                nombreInsumo=data.get("nombreInsumo"),
                idCategoria=data.get("idCategoria"),
                idUnidad=data.get("idUnidad"),
                cantidad=data.get("cantidad", 0)  # <-- Leemos y enviamos la cantidad
            )
            return jsonify({
                "status": "success",
                "data": {
                    "idInsumo": insumo.idInsumo,
                    "nombreInsumo": insumo.nombreInsumo,
                    "cantidad": float(insumo.cantidad)
                }
            }), 201
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 400
    @staticmethod
    @rol_requerido("ROL-001")
    def actualizar_insumo(idInsumo):
        """
        Endpoint para actualizar los datos de un insumo existente.
        Requiere rol de administrador (ROL-001).
        Recibe los campos a actualizar en el cuerpo JSON.
        Retorna mensaje de éxito o error 404 si el insumo no existe.
        """
        # Obtener el cuerpo de la petición HTTP en formato JSON
        data = request.get_json()
        try:
            # Importación diferida del servicio de insumos
            from app.services.insumo_service import InsumoService
            # Llamar al servicio para actualizar el insumo con los datos recibidos
            # Se desempaqueta el diccionario **data para pasar cada campo como argumento
            insumo = InsumoService.actualizar_insumo(idInsumo, **data)
            # Si el insumo no fue encontrado, retornar error 404
            if not insumo:
                return jsonify({"status": "error", "message": "Insumo no encontrado"}), 404
            # Retornar mensaje de éxito si la actualización fue correcta
            return jsonify({"status": "success", "message": "Insumo actualizado"}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 400
            return jsonify({"status": "error", "message": str(e)}), 400

    @staticmethod
    @rol_requerido("ROL-001")
    def eliminar_insumo(idInsumo):
        """
        Endpoint para eliminar un insumo del sistema por su ID.
        Requiere rol de administrador (ROL-001).
        Retorna mensaje de éxito o error 404 si el insumo no existe.
        """
        try:
            # Importación diferida del servicio de insumos
            from app.services.insumo_service import InsumoService
            # Llamar al servicio para eliminar el insumo y verificar si fue exitoso
            if InsumoService.eliminar_insumo(idInsumo):
                # Retornar mensaje de éxito si la eliminación fue correcta
                return jsonify({"status": "success", "message": "Insumo eliminado"}), 200
            # Si el insumo no fue encontrado, retornar error 404
            return jsonify({"status": "error", "message": "Insumo no encontrado"}), 404
        except Exception as e:
            # Capturar excepciones y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500
