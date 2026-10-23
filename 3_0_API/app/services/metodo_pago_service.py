"""
ARCHIVO: metodo_pago_service.py
PROPOSITO: Servicio de gestion de metodos de pago del sistema.
           Permite listar todos los metodos de pago disponibles y registrar nuevos
           metodos que se utilizan en las operaciones de pago a empleados.
"""

# Importacion de la instancia de base de datos para operaciones de persistencia
from app.database.database import db

# Importacion del modelo MetodoPago para interactuar con la tabla de metodos de pago
from app.models import MetodoPago

# Importacion de la funcion utilitaria para generar identificadores unicos
from app.utils.generar_id import generar_id


class MetodoPagoService:
    """Clase que concentra los servicios de gestion de metodos de pago."""

    @staticmethod
    def listar_todos():
        """
        Metodo estatico que obtiene todos los metodos de pago registrados en el sistema.
        
        Returns:
            list: Lista de todos los objetos MetodoPago existentes en la base de datos.
        """
        # Consultar y retornar todos los metodos de pago de la tabla
        return MetodoPago.query.all()

    @staticmethod
    def crear_metodo(nombreMetodo):
        """
        Metodo estatico que registra un nuevo metodo de pago en el sistema.
        Genera automaticamente un ID unico con prefijo "MET".
        
        Args:
            nombreMetodo (str): Nombre descriptivo del metodo de pago (ej: Efectivo, Transferencia).
        
        Returns:
            MetodoPago: Objeto del metodo de pago recien creado con su ID asignado.
        """
        # Generar un nuevo ID unico con prefijo "MET" para el modelo MetodoPago
        nuevo_id = generar_id("MET", MetodoPago, "idMetodo")

        # Crear la instancia del nuevo metodo de pago con el ID generado y el nombre
        m = MetodoPago(idMetodo=nuevo_id, nombreMetodo=nombreMetodo)

        # Agregar el nuevo metodo de pago a la sesion de la base de datos
        db.session.add(m)

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar el metodo de pago recien creado
        return m
