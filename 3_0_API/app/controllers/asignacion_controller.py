"""
ARCHIVO: asignacion_controller.py
PROPOSITO: Controlador de asignaciones encargado de gestionar las operaciones
           relacionadas con la asignación de insumos a empleados del sistema.
           Permite listar todas las asignaciones, filtrar por empleado, crear
           nuevas asignaciones y cambiar el estado de una asignación existente.
           Incluye controles de acceso basados en roles para operaciones
           administrativas.
"""

# Importación de 'request' para acceder a los datos de la petición HTTP entrante
from flask import request
# Importación de 'jsonify' para construir respuestas HTTP en formato JSON
from flask import jsonify
# Importación de decoradores para control de acceso: token JWT y roles
from app.utils.decorators import token_requerido, rol_requerido


class AsignacionController:
    """
    Clase controladora que agrupa los métodos estáticos para la gestión
    de asignaciones de insumos a empleados dentro del sistema.
    """

    @staticmethod
    @rol_requerido("ROL-001")
    def listar_asignaciones():
        """
        Endpoint para listar todas las asignaciones de insumos a empleados.
        Requiere rol de administrador (ROL-001).
        Retorna una lista completa con los datos de cada asignación incluyendo
        información del empleado y del insumo asignado.
        """
        try:
            # Importación diferida del servicio de reportes para evitar dependencias circulares.
            # El servicio de reportes es la fuente única de datos que comparten la vista
            # y la exportación a Excel, garantizando consistencia entre ambas.
            from app.services.reporte_service import ReporteService
            # Obtener todas las asignaciones registradas en la base de datos
            data = ReporteService.obtener_asignaciones()
            # Retornar respuesta exitosa con la lista de asignaciones
            return jsonify({"status": "success", "data": data}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @token_requerido
    def asignaciones_empleado(idUsuario):
        """
        Endpoint para listar las asignaciones de un empleado específico.
        Requiere autenticación válida (token JWT).
        Retorna las asignaciones del empleado indicado, incluyendo
        información detallada del insumo asignado.
        """
        try:
            # Importación diferida del servicio de asignaciones
            from app.services.asignacion_service import AsignacionService
            # Importación del modelo Insumo para resolver la relación
            from app.models import Insumo
            # Obtener todas las asignaciones del empleado especificado
            asignaciones = AsignacionService.listar_por_empleado(idUsuario)
            # Lista para almacenar los datos formateados
            data = []
            # Iterar sobre cada asignación del empleado
            for a in asignaciones:
                # Buscar el insumo asociado a la asignación
                insumo = Insumo.query.get(a.idInsumo)
                # Agregar los datos formateados de la asignación
                data.append({
                    "idAsignacion": a.idAsignacion,
                    "idInsumo": a.idInsumo,
                    "nombreInsumo": insumo.nombreInsumo if insumo else "Desconocido",
                    "cantidad": float(a.cantidad) if a.cantidad else 0,
                    "fechaAsignacion": str(a.fechaAsignacion) if a.fechaAsignacion else None,
                    "estado": a.estado
                })
            # Retornar respuesta exitosa con la lista de asignaciones del empleado
            return jsonify({"status": "success", "data": data}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @rol_requerido("ROL-001")
    def crear_asignacion():
        """
        Endpoint para crear una nueva asignación de insumo a empleado.
        Requiere rol de administrador (ROL-001).
        Recibe id del empleado, id del insumo y cantidad en el cuerpo JSON.
        Retorna los datos de la asignación creada con código 201.
        Maneja errores de conflicto (ValueError) cuando la asignación ya existe.
        """
        # Obtener el cuerpo de la petición HTTP en formato JSON
        data = request.get_json()
        try:
            # Importación diferida del servicio de asignaciones
            from app.services.asignacion_service import AsignacionService
            # Crear la asignación con los datos recibidos
            asignacion = AsignacionService.crear_asignacion(
                idUsuario_Empleado=data.get("idUsuario_Empleado"),
                idInsumo=data.get("idInsumo"),
                cantidad=data.get("cantidad")
            )
            # Retornar respuesta exitosa con los datos de la asignación creada (código 201)
            return jsonify({
                "status": "success",
                "data": {
                    "idAsignacion": asignacion.idAsignacion,
                    "empleado": asignacion.empleado.pNombre if asignacion.empleado else None,
                    "insumo": asignacion.insumo.nombreInsumo if asignacion.insumo else None,
                    "cantidad": float(asignacion.cantidad)
                }
            }), 201
        except ValueError as e:
            # Capturar error de conflicto (ej: asignación duplicada) y retornar código 409
            return jsonify({"status": "error", "message": str(e)}), 409
        except Exception as e:
            # Capturar otras excepciones y retornar error 400
            return jsonify({"status": "error", "message": str(e)}), 400

    @staticmethod
    @token_requerido
    def cambiar_estado(idAsignacion):
        """
        Endpoint para cambiar el estado de una asignación existente.
        Requiere autenticación válida (token JWT).
        Recibe el nuevo estado en el cuerpo JSON.
        Retorna mensaje de éxito o error si la asignación no existe.
        """
        # Obtener el cuerpo de la petición HTTP en formato JSON
        data = request.get_json()
        try:
            # Importación diferida del servicio de asignaciones
            from app.services.asignacion_service import AsignacionService
            # Llamar al servicio para cambiar el estado de la asignación
            asignacion = AsignacionService.cambiar_estado(idAsignacion, data.get("estado"))
            # Si la asignación no fue encontrada, retornar error 404
            if not asignacion:
                return jsonify({"status": "error", "message": "Asignacion no encontrada"}), 404
            # Retornar mensaje de éxito con el nuevo estado
            return jsonify({"status": "success", "message": f"Estado actualizado a {asignacion.estado}"}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 400
            return jsonify({"status": "error", "message": str(e)}), 400
