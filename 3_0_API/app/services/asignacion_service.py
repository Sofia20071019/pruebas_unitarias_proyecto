"""
ARCHIVO: asignacion_service.py
PROPOSITO: Servicio de gestion de asignaciones de insumos a empleados.
           Permite listar, crear y gestionar asignaciones de insumos del inventario
           a los empleados del sistema. Controla el stock disponible antes de cada
           asignacion y mantiene el historial de asignaciones realizadas.
"""

# Importacion de la clase date para obtener la fecha actual del sistema
from datetime import date

# Importacion de la instancia de base de datos para operaciones de persistencia
from app.database.database import db

# Importacion de los modelos Asignacion e Insumo para consultas y actualizaciones
from app.models import Asignacion, Insumo

# Importacion de la funcion utilitaria para generar identificadores unicos
from app.utils.generar_id import generar_id


class AsignacionService:
    """Clase que concentra todos los servicios de gestion de asignaciones de insumos."""

    @staticmethod
    def listar_todas():
        """
        Metodo estatico que obtiene todas las asignaciones registradas en el sistema.
        
        Returns:
            list: Lista de todas las asignaciones ordenadas por fecha de creacion
                  de forma descendente (mas recientes primero).
        """
        # Consultar todas las asignaciones y ordenarlas por fecha descendente
        return Asignacion.query.order_by(Asignacion.fechaAsignacion.desc()).all()

    @staticmethod
    def listar_por_empleado(idUsuario):
        """
        Metodo estatico que obtiene todas las asignaciones de un empleado especifico.
        
        Args:
            idUsuario (str): Identificador del empleado cuyas asignaciones se desean consultar.
        
        Returns:
            list: Lista de asignaciones del empleado, ordenadas por fecha descendente.
        """
        # Filtrar asignaciones por el ID del empleado y ordenar por fecha descendente
        return Asignacion.query.filter_by(idUsuario_Empleado=idUsuario).order_by(Asignacion.fechaAsignacion.desc()).all()

    @staticmethod
    def listar_por_insumo(idInsumo):
        """
        Metodo estatico que obtiene todas las asignaciones realizadas para un insumo especifico.
        
        Args:
            idInsumo (str): Identificador del insumo cuyas asignaciones se desean consultar.
        
        Returns:
            list: Lista de asignaciones del insumo especificado.
        """
        # Filtrar asignaciones por el ID del insumo
        return Asignacion.query.filter_by(idInsumo=idInsumo).all()

    @staticmethod
    def crear_asignacion(idUsuario_Empleado, idInsumo, cantidad):
        """
        Metodo estatico que crea una nueva asignacion de un insumo a un empleado.
        Verifica que haya stock suficiente antes de realizar la asignacion
        y descuenta la cantidad asignada del inventario del insumo.
        
        Args:
            idUsuario_Empleado (str): Identificador del empleado que recibira el insumo.
            idInsumo (str): Identificador del insumo a asignar.
            cantidad (float): Cantidad del insumo a asignar al empleado.
        
        Returns:
            Asignacion: Objeto de la asignacion recien creada.
        
        Raises:
            ValueError: Si el insumo no existe o si no hay stock suficiente.
        """
        # Buscar el insumo en la base de datos
        insumo = Insumo.query.get(idInsumo)

        # Verificar que el insumo exista en el sistema
        if not insumo:
            raise ValueError("Insumo no encontrado")

        # Obtener la cantidad disponible del insumo (default a 0 si es None)
        cantidad_disponible = float(insumo.cantidad or 0)

        # Verificar que haya stock suficiente para la asignacion
        if cantidad_disponible < float(cantidad):
            raise ValueError(f"Stock insuficiente. Disponible: {cantidad_disponible}")

        # Generar un nuevo ID unico con prefijo "ASI" para la asignacion
        nuevo_id = generar_id("ASI", Asignacion, "idAsignacion")

        # Crear la instancia de la nueva asignacion con los datos proporcionados
        asignacion = Asignacion(
            idAsignacion=nuevo_id,           # ID unico generado automaticamente
            idUsuario_Empleado=idUsuario_Empleado,  # Empleado que recibira el insumo
            idInsumo=idInsumo,               # Insumo a asignar
            cantidad=cantidad,               # Cantidad a asignar
            fechaAsignacion=date.today(),    # Fecha actual del sistema
            estado="Pendiente"               # Estado inicial pendiente de revision
        )

        # Descontar la cantidad asignada del stock del insumo
        insumo.cantidad = float(insumo.cantidad or 0) - float(cantidad)

        # Agregar la nueva asignacion a la sesion de la base de datos
        db.session.add(asignacion)

        # Confirmar todos los cambios (asignacion y descuento de stock) en la base de datos
        db.session.commit()

        # Retornar la asignacion recien creada
        return asignacion

    @staticmethod
    def cambiar_estado(idAsignacion, estado):
        """
        Metodo estatico que cambia el estado de una asignacion existente.
        Permite actualizar el estado de una asignacion (ej: Pendiente, Aprobada, Rechazada).
        
        Args:
            idAsignacion (str): Identificador de la asignacion a actualizar.
            estado (str): Nuevo estado a asignar a la asignacion.
        
        Returns:
            Asignacion: Objeto asignacion con el estado actualizado si existia.
            None: Si no se encontro la asignacion.
        """
        # Buscar la asignacion por su ID en la base de datos
        asignacion = Asignacion.query.get(idAsignacion)

        # Si no se encuentra la asignacion, retornar None
        if not asignacion:
            return None

        # Actualizar el estado de la asignacion con el nuevo valor proporcionado
        asignacion.estado = estado

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar la asignacion con el estado actualizado
        return asignacion
