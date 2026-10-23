"""
ARCHIVO: categoria_service.py
PROPOSITO: Servicio de gestion de categorias de insumos del sistema.
           Permite listar todas las categorias existentes y crear nuevas categorias
           para organizar los insumos del inventario por tipo o clasificacion.
"""

# Importacion de la instancia de base de datos para operaciones de persistencia
from app.database.database import db

# Importacion del modelo Categoria para interactuar con la tabla de categorias
from app.models import Categoria

# Importacion de la funcion utilitaria para generar identificadores unicos
from app.utils.generar_id import generar_id


class CategoriaService:
    """Clase que concentra los servicios de gestion de categorias de insumos."""

    @staticmethod
    def listar_todas():
        """
        Metodo estatico que obtiene todas las categorias registradas en el sistema.
        
        Returns:
            list: Lista de todos los objetos Categoria existentes en la base de datos.
        """
        # Consultar y retornar todas las categorias de la tabla
        return Categoria.query.all()

    @staticmethod
    def crear_categoria(nombreCategoria):
        """
        Metodo estatico que crea una nueva categoria de insumo.
        Genera automaticamente un ID unico con prefijo "CAT" para la categoria.
        
        Args:
            nombreCategoria (str): Nombre descriptivo de la categoria a crear.
        
        Returns:
            Categoria: Objeto de la categoria recien creada con su ID asignado.
        """
        # Generar un nuevo ID unico con prefijo "CAT" para el modelo Categoria
        nuevo_id = generar_id("CAT", Categoria, "idCategoria")

        # Crear la instancia de la nueva categoria con el ID generado y el nombre proporcionado
        cat = Categoria(idCategoria=nuevo_id, nombreCategoria=nombreCategoria)

        # Agregar la nueva categoria a la sesion de la base de datos
        db.session.add(cat)

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar la categoria recien creada
        return cat
