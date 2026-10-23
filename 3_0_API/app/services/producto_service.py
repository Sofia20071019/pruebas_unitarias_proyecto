"""
ARCHIVO: producto_service.py
PROPOSITO: Servicio de gestion de productos del sistema.
           Permite listar todos los productos existentes y registrar nuevos productos
           que se fabrican en la empresa. Los productos incluyen atributos opcionales
           como talla y color para caracterizacion adicional.
"""

# Importacion de la instancia de base de datos para operaciones de persistencia
from app.database.database import db

# Importacion del modelo Producto para interactuar con la tabla de productos
from app.models import Producto

# Importacion de la funcion utilitaria para generar identificadores unicos
from app.utils.generar_id import generar_id


class ProductoService:
    """Clase que concentra los servicios de gestion de productos."""

    @staticmethod
    def listar_todos():
        """
        Metodo estatico que obtiene todos los productos registrados en el sistema.
        
        Returns:
            list: Lista de todos los objetos Producto existentes en la base de datos.
        """
        # Consultar y retornar todos los productos de la tabla
        return Producto.query.all()

    @staticmethod
    def crear_producto(nombreProducto, talla=None, color=None):
        """
        Metodo estatico que registra un nuevo producto en el sistema.
        Genera automaticamente un ID unico con prefijo "PRO".
        
        Args:
            nombreProducto (str): Nombre descriptivo del producto.
            talla (str, optional): Talla del producto. Por defecto None.
            color (str, optional): Color del producto. Por defecto None.
        
        Returns:
            Producto: Objeto del producto recien creado con su ID asignado.
        """
        # Generar un nuevo ID unico con prefijo "PRO" para el modelo Producto
        nuevo_id = generar_id("PRO", Producto, "idProducto")

        # Crear la instancia del nuevo producto con los datos proporcionados
        p = Producto(
            idProducto=nuevo_id,          # ID unico generado automaticamente
            nombreProducto=nombreProducto, # Nombre del producto
            talla=talla,                  # Talla del producto (opcional)
            color=color                   # Color del producto (opcional)
        )

        # Agregar el nuevo producto a la sesion de la base de datos
        db.session.add(p)

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar el producto recien creado
        return p
