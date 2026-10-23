"""
ARCHIVO: metodo_pago_controller.py
PROPOSITO: Controlador de métodos de pago encargado de gestionar las operaciones
           de consulta de los métodos de pago disponibles en el sistema.
           Permite listar todos los métodos de pago registrados. No requiere
           autenticación para acceder a los endpoints.
"""

# Importación de 'jsonify' para construir respuestas HTTP en formato JSON
from flask import jsonify


class MetodoPagoController:
    """
    Clase controladora que agrupa los métodos estáticos para la consulta
    de métodos de pago del sistema.
    """

    @staticmethod
    def listar_metodos():
        """
        Endpoint para listar todos los métodos de pago disponibles.
        No requiere autenticación.
        Retorna una lista con el ID y nombre de cada método de pago.
        """
        try:
            # Importación diferida del servicio de métodos de pago para evitar dependencias circulares
            from app.services.metodo_pago_service import MetodoPagoService
            # Obtener todos los métodos de pago registrados en la base de datos
            metodos = MetodoPagoService.listar_todos()
            # Construir lista de diccionarios con ID y nombre de cada método
            data = [{"idMetodo": m.idMetodo, "nombreMetodo": m.nombreMetodo} for m in metodos]
            # Retornar respuesta exitosa con la lista de métodos de pago
            return jsonify({"status": "success", "data": data}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500
