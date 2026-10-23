"""
ARCHIVO: cliente_service.py
PROPOSITO: Servicio de gestion de clientes del sistema.
           Permite listar todos los clientes existentes y registrar nuevos clientes
           que realizan pedidos en la empresa. Los clientes son utilizados
           en las ordenes de produccion.
"""

# Importacion de la instancia de base de datos para operaciones de persistencia
from app.database.database import db

# Importacion del modelo Cliente para interactuar con la tabla de clientes
from app.models import Cliente

# Importacion de la funcion utilitaria para generar identificadores unicos
from app.utils.generar_id import generar_id


class ClienteService:
    """Clase que concentra los servicios de gestion de clientes."""

    @staticmethod
    def listar_todos():
        """
        Metodo estatico que obtiene todos los clientes registrados en el sistema.
        
        Returns:
            list: Lista de todos los objetos Cliente existentes en la base de datos.
        """
        # Consultar y retornar todos los clientes de la tabla
        return Cliente.query.all()

    @staticmethod
    def crear_cliente(nombreCliente, telefono=None, correo=None):
        """
        Método estático que registra un nuevo cliente en el sistema.
        Genera automáticamente un ID único con prefijo "CLI" para el cliente.
        
        Args:
            nombreCliente (str): Nombre o razón social del cliente.
            telefono (str, optional): Número de teléfono del cliente.
            correo (str, optional): Correo electrónico del cliente.
        
        Returns:
            Cliente: Objeto del cliente recién creado con su ID asignado.
        """
        # Generar un nuevo ID único con prefijo "CLI" para el modelo Cliente
        nuevo_id = generar_id("CLI", Cliente, "idCliente")

        # Crear la instancia del nuevo cliente con correo incluido
        c = Cliente(
            idCliente=nuevo_id,
            nombreCliente=nombreCliente,
            telefono=telefono,
            correo=correo.lower().strip() if correo else None
        )

        # Agregar a la sesión y confirmar
        db.session.add(c)
        db.session.commit()

        return c
