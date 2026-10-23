"""
ARCHIVO: categoria_controller.py
PROPOSITO: Controlador de categorías encargado de gestionar las operaciones
           de consulta de categorías de insumos del sistema. Permite listar
           todas las categorías disponibles. Requiere autenticación para
           acceder a los endpoints.
"""

# Importación de 'jsonify' para construir respuestas HTTP en formato JSON
from flask import jsonify
# Importación del decorador de verificación de token JWT
from app.utils.decorators import token_requerido


class CategoriaController:
    """
    Clase controladora que agrupa los métodos estáticos para la consulta
    de categorías de insumos del sistema.
    """

    @staticmethod
    @token_requerido
    def listar_categorias():
        """
        Endpoint para listar todas las categorías de insumos disponibles.
        Requiere autenticación válida (token JWT).
        Retorna una lista con el ID y nombre de cada categoría.
        """
        try:
            # Importación diferida del servicio de categorías para evitar dependencias circulares
            from app.services.categoria_service import CategoriaService
            # Obtener todas las categorías registradas en la base de datos
            cats = CategoriaService.listar_todas()
            # Construir lista de diccionarios con ID y nombre de cada categoría
            data = [{"idCategoria": c.idCategoria, "nombreCategoria": c.nombreCategoria} for c in cats]
            # Retornar respuesta exitosa con la lista de categorías
            return jsonify({"status": "success", "data": data}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500
