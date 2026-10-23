"""
ARCHIVO: producto_controller.py
PROPOSITO: Controlador de productos encargado de gestionar las operaciones
           de consulta y creación de productos del sistema. Permite listar
           todos los productos disponibles y crear nuevos productos.
           No requiere autenticación para acceder a los endpoints.
"""

# Importación de 'request' para acceder a los datos de la petición HTTP entrante
from flask import request
# Importación de 'jsonify' para construir respuestas HTTP en formato JSON
from flask import jsonify


class ProductoController:
    """
    Clase controladora que agrupa los métodos estáticos para la gestión
    de productos del sistema.
    """

    @staticmethod
    def listar_productos():
        """
        Endpoint para listar todos los productos registrados en el sistema.
        No requiere autenticación.
        Retorna una lista con el ID, nombre, talla y color de cada producto.
        """
        try:
            # Importación diferida del servicio de productos para evitar dependencias circulares
            from app.services.producto_service import ProductoService
            # Obtener todos los productos registrados en la base de datos
            productos = ProductoService.listar_todos()
            # Construir lista de diccionarios con los datos de cada producto
            data = [{"idProducto": p.idProducto, "nombreProducto": p.nombreProducto, "talla": p.talla, "color": p.color} for p in productos]
            # Retornar respuesta exitosa con la lista de productos
            return jsonify({"status": "success", "data": data}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    def crear_producto():
        """
        Endpoint para crear un nuevo producto en el sistema.
        No requiere autenticación.
        Recibe nombre, talla y color del producto en el cuerpo JSON.
        Retorna el ID del producto creado con código 201.
        """
        # Obtener el cuerpo de la petición HTTP en formato JSON
        data = request.get_json()
        try:
            # Importación diferida del servicio de productos
            from app.services.producto_service import ProductoService
            # Crear el producto con los datos recibidos del JSON
            p = ProductoService.crear_producto(data.get("nombreProducto"), talla=data.get("talla"), color=data.get("color"))
            # Retornar respuesta exitosa con el ID del producto creado (código 201 = Created)
            return jsonify({"status": "success", "data": {"idProducto": p.idProducto}}), 201
        except Exception as e:
            # Capturar excepciones y retornar error 400 (solicitud incorrecta)
            return jsonify({"status": "error", "message": str(e)}), 400
