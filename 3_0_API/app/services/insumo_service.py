"""
ARCHIVO: insumo_service.py
PROPOSITO: Servicio de gestion de insumos del sistema.
           Permite realizar operaciones CRUD completas sobre el inventario de insumos,
           incluyendo listado, creacion, actualizacion y eliminacion. Los insumos
           representan los materiales utilizados en la produccion y estan
           organizados por categorias y unidades de medida.
"""

# Importacion de la instancia de base de datos para operaciones de persistencia
from app.database.database import db

# Importacion del modelo Insumo para interactuar con la tabla de insumos
from app.models import Insumo

# Importacion de la funcion utilitaria para generar identificadores unicos
from app.utils.generar_id import generar_id


class InsumoService:
    """Clase que concentra todos los servicios de gestion de insumos."""

    @staticmethod
    def listar_todos():
        """
        Metodo estatico que obtiene todos los insumos del inventario.
        
        Returns:
            list: Lista de todos los objetos Insumo ordenados alfabeticamente
                  por nombre del insumo.
        """
        # Consultar todos los insumos y ordenarlos alfabeticamente por nombre
        return Insumo.query.order_by(Insumo.nombreInsumo).all()

    @staticmethod
    def crear_insumo(nombreInsumo, idCategoria, idUnidad, cantidad=0):
        """
        Método estático que registra un nuevo insumo en el inventario.
        Genera automáticamente un ID único con prefijo "INS" y establece
        la cantidad inicial proporcionada.
        
        Args:
            nombreInsumo (str): Nombre descriptivo del insumo.
            idCategoria (str): Identificador de la categoría a la que pertenece el insumo.
            idUnidad (str): Identificador de la unidad de medida del insumo.
            cantidad (float, optional): Cantidad inicial ingresada. Por defecto 0.
        
        Returns:
            Insumo: Objeto del insumo recién creado con su ID asignado.
        """
        # Generar un nuevo ID único con prefijo "INS" para el modelo Insumo
        nuevo_id = generar_id("INS", Insumo, "idInsumo")

        # Crear la instancia del nuevo insumo asignando la cantidad recibida
        insumo = Insumo(
            idInsumo=nuevo_id,
            nombreInsumo=nombreInsumo,
            idCategoria=idCategoria,
            idUnidad=idUnidad,
            cantidad=float(cantidad or 0)
        )

        # Agregar el nuevo insumo a la sesión de la base de datos
        db.session.add(insumo)

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar el insumo recién creado
        return insumo

    @staticmethod
    def actualizar_insumo(idInsumo, **kwargs):
        """
        Metodo estatico que actualiza los datos de un insumo existente.
        Permite modificar campos individuales sin necesidad de enviar todos los datos.
        
        Args:
            idInsumo (str): Identificador unico del insumo a actualizar.
            **kwargs: Argumentos opcionales con los campos a actualizar
                     (nombreInsumo, idCategoria, idUnidad, cantidad).
        
        Returns:
            Insumo: Objeto insumo actualizado si se encontro, None si no existe.
        """
        # Buscar el insumo por su ID en la base de datos
        insumo = Insumo.query.get(idInsumo)

        # Si no se encuentra el insumo, retornar None
        if not insumo:
            return None

        # Recorrer los campos permitidos para actualizacion y aplicar los cambios
        for key in ["nombreInsumo", "idCategoria", "idUnidad", "cantidad"]:
            # Solo actualizar si el campo fue proporcionado y tiene valor
            if key in kwargs and kwargs[key] is not None:
                setattr(insumo, key, kwargs[key])

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar el insumo actualizado
        return insumo

    @staticmethod
    def eliminar_insumo(idInsumo):
        """
        Metodo estatico que elimina permanentemente un insumo de la base de datos.
        
        Args:
            idInsumo (str): Identificador unico del insumo a eliminar.
        
        Returns:
            Insumo: Objeto insumo eliminado si existia, None si no se encontro.
        """
        # Buscar el insumo por su ID en la base de datos
        insumo = Insumo.query.get(idInsumo)

        # Si no se encuentra el insumo, retornar None
        if not insumo:
            return None

        # Eliminar el insumo de la sesion de la base de datos
        db.session.delete(insumo)

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar el insumo que fue eliminado
        return insumo
