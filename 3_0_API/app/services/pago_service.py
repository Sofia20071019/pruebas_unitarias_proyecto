"""
ARCHIVO: pago_service.py
PROPOSITO: Servicio de gestion de pagos a empleados del sistema.
           Permite listar, crear y aprobar pagos asociados a las jornadas laborales.
           Cada pago registra el monto pagado, el metodo utilizado y el administrador
           que autoriza la transaccion.
"""

# Importacion de la instancia de base de datos para operaciones de persistencia
from app.database.database import db

# Importacion del modelo Pago para interactuar con la tabla de pagos
from app.models import Pago

# Importacion de la funcion utilitaria para generar identificadores unicos
from app.utils.generar_id import generar_id

from datetime import date

class PagoService:
    """Clase que concentra todos los servicios de gestion de pagos a empleados."""

    @staticmethod
    def listar_todos():
        """
        Metodo estatico que obtiene todos los pagos registrados en el sistema.
        
        Returns:
            list: Lista de todos los objetos Pago ordenados por fecha de pago
                  de forma descendente (mas recientes primero).
        """
        # Consultar todos los pagos y ordenarlos por fecha de pago descendente
        return Pago.query.order_by(Pago.fechaPago.desc()).all()

    @staticmethod
    def listar_por_jornada(idJornada):
        """
        Metodo estatico que obtiene todos los pagos asociados a una jornada especifica.
        
        Args:
            idJornada (str): Identificador de la jornada cuyos pagos se desean consultar.
        
        Returns:
            list: Lista de pagos de la jornada especificada.
        """
        # Filtrar pagos por el ID de la jornada
        return Pago.query.filter_by(idJornada=idJornada).all()

    @staticmethod
    def obtener_por_id(idPago):
        """
        Metodo estatico que busca un pago por su identificador unico.
        
        Args:
            idPago (str): Identificador del pago a buscar.
        
        Returns:
            Pago: Objeto pago si se encuentra, None si no existe.
        """
        # Buscar el pago por su clave primaria
        return Pago.query.get(idPago)

    @staticmethod
    def crear_pago(idJornada, idUsuario_Admin, montoPagado, idMetodo, fechaPago=None):
        """
        Registra un nuevo pago a un empleado.
        Impide registrar más de un pago para la misma jornada laboral.
        """
        # Validación: evitar pagos duplicados sobre la misma jornada
        pago_existente = Pago.query.filter_by(idJornada=idJornada).first()
        if pago_existente:
            raise ValueError("Esta jornada laboral ya ha sido pagada previamente.")

        nuevo_id = generar_id("PAG", Pago, "idPago")

        pago = Pago(
            idPago=nuevo_id,
            idJornada=idJornada,
            idUsuario_Admin=idUsuario_Admin,
            montoPagado=montoPagado,
            idMetodo=idMetodo,
            fechaPago=fechaPago or date.today()
        )

        db.session.add(pago)
        db.session.commit()

        return pago

    @staticmethod
    def aprobar_pago(idPago, **kwargs):
        """
        Metodo estatico que aprueba o actualiza un pago existente.
        Permite modificar campos individuales del pago, como el estado de aprobacion.
        
        Args:
            idPago (str): Identificador unico del pago a aprobar.
            **kwargs: Argumentos opcionales con los campos a actualizar
                     (montoPagado, idMetodo, fechaPago, etc.).
        
        Returns:
            Pago: Objeto pago actualizado si se encontro, None si no existe.
        """
        # Buscar el pago por su ID en la base de datos
        pago = Pago.query.get(idPago)

        # Si no se encuentra el pago, retornar None
        if not pago:
            return None

        # Recorrer los argumentos proporcionados y aplicar los cambios
        for key, value in kwargs.items():
            # Solo actualizar si el valor no es None y el atributo existe en el modelo
            if value is not None and hasattr(pago, key):
                setattr(pago, key, value)

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar el pago actualizado
        return pago
