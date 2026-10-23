"""
ARCHIVO: orden_service.py
PROPOSITO: Servicio de gestion de ordenes de produccion del sistema.
           Permite crear, listar, actualizar y gestionar las ordenes de produccion
           que contienen los pedidos de clientes. Tambien administra los detalles
           de cada orden que especifican los productos y cantidades solicitadas.
"""

# Importacion de la instancia de base de datos para operaciones de persistencia
from app.database.database import db

# Importacion de los modelos de orden de produccion y detalle de orden
from app.models import OrdenProduccion, DetalleOrden

# Importacion de la funcion utilitaria para generar identificadores unicos
from app.utils.generar_id import generar_id


class OrdenService:
    """Clase que concentra todos los servicios de gestion de ordenes de produccion."""

    @staticmethod
    def listar_todas():
        """
        Metodo estatico que obtiene todas las ordenes de produccion del sistema.
        
        Returns:
            list: Lista de todos los objetos OrdenProduccion existentes en la base de datos.
        """
        # Consultar y retornar todas las ordenes de produccion
        return OrdenProduccion.query.all()

    @staticmethod
    def obtener_por_id(idOrden):
        """
        Metodo estatico que busca una orden de produccion por su identificador unico.
        
        Args:
            idOrden (str): Identificador de la orden a buscar.
        
        Returns:
            OrdenProduccion: Objeto orden si se encuentra, None si no existe.
        """
        # Buscar la orden por su clave primaria
        return OrdenProduccion.query.get(idOrden)

    @staticmethod
    def crear_orden(idCliente, idUsuario_Admin, fechaPedido, estadoProd=".."):
        """
        Metodo estatico que crea una nueva orden de produccion.
        Genera automaticamente un ID unico con prefijo "ORD".
        
        Args:
            idCliente (str): Identificador del cliente que realizo el pedido.
            idUsuario_Admin (str): Identificador del administrador que registra la orden.
            fechaPedido (date): Fecha en que se realizo el pedido.
            estadoProd (str): Estado de produccion inicial. Por defecto ".." (pendiente).
        
        Returns:
            OrdenProduccion: Objeto de la orden recien creada con su ID asignado.
        """
        # Generar un nuevo ID unico con prefijo "ORD" para la orden
        nuevo_id = generar_id("ORD", OrdenProduccion, "idOrden")

        # Crear la instancia de la nueva orden con los datos proporcionados
        orden = OrdenProduccion(
            idOrden=nuevo_id,           # ID unico generado automaticamente
            idCliente=idCliente,        # Cliente que realizo el pedido
            idUsuario_Admin=idUsuario_Admin,  # Administrador que registra la orden
            fechaPedido=fechaPedido,    # Fecha del pedido
            estadoProd=estadoProd       # Estado de produccion
        )

        # Agregar la nueva orden a la sesion de la base de datos
        db.session.add(orden)

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar la orden recien creada
        return orden

    @staticmethod
    def actualizar_orden(idOrden, **kwargs):
        """
        Metodo estatico que actualiza los datos de una orden existente.
        Permite modificar campos individuales sin necesidad de enviar todos los datos.
        
        Args:
            idOrden (str): Identificador unico de la orden a actualizar.
            **kwargs: Argumentos opcionales con los campos a actualizar
                     (idCliente, idUsuario_Admin, fechaPedido, estadoProd, etc.).
        
        Returns:
            OrdenProduccion: Objeto orden actualizada si se encontro, None si no existe.
        """
        # Buscar la orden por su ID en la base de datos
        orden = OrdenProduccion.query.get(idOrden)

        # Si no se encuentra la orden, retornar None
        if not orden:
            return None

        # Recorrer los argumentos proporcionados y aplicar los cambios
        for key, value in kwargs.items():
            # Solo actualizar si el valor no es None y el atributo existe en el modelo
            if value is not None and hasattr(orden, key):
                setattr(orden, key, value)

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar la orden actualizada
        return orden

    @staticmethod
    def agregar_detalle(idOrden, idProducto, cantidadTotal):
        """
        Metodo estatico que agrega un detalle (linea de producto) a una orden existente.
        Cada detalle especifica un producto y la cantidad solicitada dentro de la orden.
        
        Args:
            idOrden (str): Identificador de la orden a la que se agregara el detalle.
            idProducto (str): Identificador del producto solicitado.
            cantidadTotal (int): Cantidad total del producto solicitado en la orden.
        
        Returns:
            DetalleOrden: Objeto del detalle recien creado con su ID asignado.
        """
        # Generar un nuevo ID unico con prefijo "DET" para el detalle
        nuevo_id = generar_id("DET", DetalleOrden, "idDetalle")

        # Crear la instancia del nuevo detalle con los datos proporcionados
        detalle = DetalleOrden(
            idDetalle=nuevo_id,          # ID unico generado automaticamente
            idOrden=idOrden,             # Orden a la que pertenece el detalle
            idProducto=idProducto,       # Producto solicitado
            cantidadTotal=cantidadTotal  # Cantidad del producto
        )

        # Agregar el nuevo detalle a la sesion de la base de datos
        db.session.add(detalle)

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar el detalle recien creado
        return detalle
