"""
ARCHIVO: unidad_medida_controller.py
PROPOSITO: Controlador de unidades de medida encargado de gestionar las
           operaciones de consulta de las unidades de medida disponibles
           en el sistema. Permite listar todas las unidades de medida
           registradas. Requiere autenticación válida (token JWT) para
           acceder a los endpoints.
"""

# Importación de 'jsonify' para construir respuestas HTTP en formato JSON
from flask import jsonify
# Importación del decorador de verificación de token JWT
from app.utils.decorators import token_requerido


class UnidadMedidaController:
    """
    Clase controladora que agrupa los métodos estáticos para la consulta
    de unidades de medida del sistema.
    """

    @staticmethod
    @token_requerido
    def listar_unidades():
        """
        Endpoint para listar todas las unidades de medida disponibles.
        Requiere autenticación válida (token JWT).
        Retorna una lista con el ID y nombre de cada unidad de medida.
        """
        try:
            # Importación diferida del servicio de unidades de medida para evitar dependencias circulares
            from app.services.unidad_medida_service import UnidadMedidaService
            # Obtener todas las unidades de medida registradas en la base de datos
            unidades = UnidadMedidaService.listar_todas()
            # Construir lista de diccionarios con ID y nombre de cada unidad
            data = [{"idUnidad": u.idUnidad, "nombreUnidad": u.nombreUnidad} for u in unidades]
            # Retornar respuesta exitosa con la lista de unidades de medida
            return jsonify({"status": "success", "data": data}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500
