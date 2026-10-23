"""
ARCHIVO: unidad_medida_service.py
PROPOSITO: Servicio de gestion de unidades de medida del sistema.
           Permite listar todas las unidades de medida existentes y registrar
           nuevas unidades que se utilizan para medir los insumos del inventario
           (ej: kilogramos, litros, metros, unidades).
"""

# Importacion de la instancia de base de datos para operaciones de persistencia
from app.database.database import db

# Importacion del modelo UnidadMedida para interactuar con la tabla de unidades
from app.models import UnidadMedida

# Importacion de la funcion utilitaria para generar identificadores unicos
from app.utils.generar_id import generar_id


class UnidadMedidaService:
    """Clase que concentra los servicios de gestion de unidades de medida."""

    @staticmethod
    def listar_todas():
        """
        Metodo estatico que obtiene todas las unidades de medida registradas en el sistema.
        
        Returns:
            list: Lista de todos los objetos UnidadMedida existentes en la base de datos.
        """
        # Consultar y retornar todas las unidades de medida de la tabla
        return UnidadMedida.query.all()

    @staticmethod
    def crear_unidad(nombreUnidad):
        """
        Metodo estatico que registra una nueva unidad de medida en el sistema.
        Genera automaticamente un ID unico con prefijo "MED".
        
        Args:
            nombreUnidad (str): Nombre de la unidad de medida (ej: kg, l, m, und).
        
        Returns:
            UnidadMedida: Objeto de la unidad de medida recien creada con su ID asignado.
        """
        # Generar un nuevo ID unico con prefijo "MED" para el modelo UnidadMedida
        nuevo_id = generar_id("MED", UnidadMedida, "idUnidad")

        # Crear la instancia de la nueva unidad de medida con el ID generado y el nombre
        u = UnidadMedida(idUnidad=nuevo_id, nombreUnidad=nombreUnidad)

        # Agregar la nueva unidad de medida a la sesion de la base de datos
        db.session.add(u)

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar la unidad de medida recien creada
        return u
