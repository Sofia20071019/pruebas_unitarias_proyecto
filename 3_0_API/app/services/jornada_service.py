"""
ARCHIVO: jornada_service.py
PROPOSITO: Servicio de gestion de jornadas laborales de los empleados.
           Permite registrar, finalizar y calcular el pago de las jornadas de trabajo.
           Incluye la logica de calculo de horas trabajadas y el monto a pagar
           segun una tarifa por hora establecida.
"""

# Importacion de clases de fecha y tiempo para operaciones con fechas y horas
from datetime import date, time, datetime, timedelta

# Importacion de la instancia de base de datos para operaciones de persistencia
from app.database.database import db

# Importacion de los modelos de jornada laboral y usuario
from app.models import JornadaLaboral, Usuario

# Importacion de la funcion utilitaria para generar identificadores unicos
from app.utils.generar_id import generar_id

# Tarifa por hora de trabajo utilizada para calcular el pago a empleados
TARIFA_POR_HORA = 15000


class JornadaService:
    """Clase que concentra todos los servicios de gestion de jornadas laborales."""

    @staticmethod
    def listar_todas():
        """
        Metodo estatico que obtiene todas las jornadas laborales registradas.
        
        Returns:
            list: Lista de todas las jornadas ordenadas por fecha de forma descendente.
        """
        # Consultar todas las jornadas y ordenarlas por fecha descendente (mas recientes primero)
        return JornadaLaboral.query.order_by(JornadaLaboral.fecha.desc()).all()

    @staticmethod
    def obtener_por_id(idJornada):
        """
        Metodo estatico que busca una jornada por su identificador unico.
        
        Args:
            idJornada (str): Identificador de la jornada a buscar.
        
        Returns:
            JornadaLaboral: Objeto jornada si se encuentra, None si no existe.
        """
        # Buscar la jornada por su clave primaria
        return JornadaLaboral.query.get(idJornada)

    @staticmethod
    def listar_por_empleado(idUsuario_Empleado):
        """
        Metodo estatico que obtiene todas las jornadas de un empleado especifico.
        
        Args:
            idUsuario_Empleado (str): Identificador del empleado cuyas jornadas se desean consultar.
        
        Returns:
            list: Lista de jornadas del empleado, ordenadas por fecha descendente.
        """
        # Filtrar jornadas por el ID del empleado y ordenar por fecha descendente
        return JornadaLaboral.query.filter_by(idUsuario_Empleado=idUsuario_Empleado).order_by(JornadaLaboral.fecha.desc()).all()

    @staticmethod
    def iniciar_jornada(idUsuario_Empleado, fecha=None, hInicio=None):
        """
        Metodo estatico que inicia una nueva jornada laboral para un empleado.
        Utiliza la fecha y hora actual del sistema si no se proporcionan valores.
        
        Args:
            idUsuario_Empleado (str): Identificador del empleado que inicia la jornada.
            fecha (date, optional): Fecha de la jornada. Si es None, usa la fecha actual.
            hInicio (time, optional): Hora de inicio. Si es None, usa la hora actual.
        
        Returns:
            JornadaLaboral: Objeto de la jornada recien iniciada.
        """
        # Generar un nuevo ID unico con prefijo "JOR" para la jornada
        nuevo_id = generar_id("JOR", JornadaLaboral, "idJornada")

        # Crear la instancia de la nueva jornada con los datos proporcionados o valores por defecto
        jornada = JornadaLaboral(
            idJornada=nuevo_id,                # ID unico generado automaticamente
            idUsuario_Empleado=idUsuario_Empleado,  # Empleado que inicia la jornada
            fecha=fecha or date.today(),       # Fecha proporcionada o fecha actual
            hInicio=hInicio or datetime.now().time().replace(microsecond=0)  # Hora proporcionada o hora actual sin microsegundos
        )

        # Agregar la nueva jornada a la sesion de la base de datos
        db.session.add(jornada)

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar la jornada recien creada
        return jornada

    @staticmethod
    def finalizar_jornada(idJornada, hFin=None):
        """
        Metodo estatico que finaliza una jornada laboral estableciendo la hora de fin.
        Utiliza la hora actual del sistema si no se proporciona una hora de finalizacion.
        
        Args:
            idJornada (str): Identificador de la jornada a finalizar.
            hFin (time, optional): Hora de finalizacion. Si es None, usa la hora actual.
        
        Returns:
            JornadaLaboral: Objeto jornada finalizada si se encontro, None si no existe.
        """
        # Buscar la jornada por su ID en la base de datos
        jornada = JornadaLaboral.query.get(idJornada)

        # Si no se encuentra la jornada, retornar None
        if not jornada:
            return None

        # Establecer la hora de fin con el valor proporcionado o la hora actual
        jornada.hFin = hFin or datetime.now().time().replace(microsecond=0)

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar la jornada finalizada
        return jornada

    @staticmethod
    def crear_jornada(idUsuario_Empleado, fecha, hInicio, hFin=None):
        """
        Metodo estatico que crea una jornada laboral completa con inicio y fin.
        Verifica que el empleado no tenga otra jornada activa antes de crear una nueva.
        
        Args:
            idUsuario_Empleado (str): Identificador del empleado.
            fecha (date): Fecha de la jornada laboral.
            hInicio (time): Hora de inicio de la jornada.
            hFin (time, optional): Hora de finalizacion de la jornada. Si es None, queda abierta.
        
        Returns:
            JornadaLaboral: Objeto de la jornada recien creada.
        
        Raises:
            ValueError: Si el empleado ya tiene una jornada activa sin finalizar.
        """
        # Verificar si el empleado tiene alguna jornada activa (sin hora de fin)
        activa = JornadaLaboral.query.filter_by(
            idUsuario_Empleado=idUsuario_Empleado,
            hFin=None  # Filtrar jornadas donde la hora de fin es nula (activas)
        ).first()

        # Si existe una jornada activa, no permitir crear otra
        if activa:
            raise ValueError("El empleado ya tiene una jornada activa sin finalizar. Debe cerrarla primero.")

        # Generar un nuevo ID unico con prefijo "JOR" para la jornada
        nuevo_id = generar_id("JOR", JornadaLaboral, "idJornada")

        # Crear la instancia de la nueva jornada con todos los datos proporcionados
        jornada = JornadaLaboral(
            idJornada=nuevo_id,                # ID unico generado automaticamente
            idUsuario_Empleado=idUsuario_Empleado,  # Empleado asociado a la jornada
            fecha=fecha,                       # Fecha de la jornada
            hInicio=hInicio,                   # Hora de inicio
            hFin=hFin                          # Hora de fin (puede ser None si la jornada esta abierta)
        )

        # Agregar la nueva jornada a la sesion de la base de datos
        db.session.add(jornada)

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar la jornada recien creada
        return jornada

    @staticmethod
    def calcular_horas_totales(idUsuario_Empleado):
        """
        Metodo estatico que calcula el total de horas trabajadas y el pago correspondiente
        para un empleado, sumando todas sus jornadas finalizadas.
        
        Args:
            idUsuario_Empleado (str): Identificador del empleado cuyo pago se va a calcular.
        
        Returns:
            dict: Diccionario con el desglose del calculo que contiene:
                  - horasTotales (float): Total de horas trabajadas redondeadas a 2 decimales.
                  - pagoTotal (float): Monto total a pagar segun la tarifa por hora.
                  - tarifaPorHora (float): Tarifa por hora utilizada en el calculo.
                  - totalJornadas (int): Numero total de jornadas finalizadas.
        """
        # Consultar todas las jornadas finalizadas del empleado (con hora de fin no nula)
        jornadas = JornadaLaboral.query.filter(
            JornadaLaboral.idUsuario_Empleado == idUsuario_Empleado,
            JornadaLaboral.hFin.isnot(None)  # Solo jornadas que ya fueron finalizadas
        ).all()

        # Inicializar acumulador de segundos totales trabajados
        total_segundos = 0

        # Iterar sobre cada jornada para calcular las horas trabajadas
        for j in jornadas:
            # Verificar que la jornada tenga hora de inicio y fin validas
            if j.hInicio and j.hFin:
                # Combinar fecha con hora para crear objetos datetime completos
                inicio = datetime.combine(date.today(), j.hInicio)
                fin = datetime.combine(date.today(), j.hFin)

                # Si la hora de fin es menor que la de inicio, significa turno nocturno
                # Se suma un dia para calcular correctamente el tiempo transcurrido
                if fin < inicio:
                    fin += timedelta(days=1)

                # Acumular la diferencia en segundos entre fin e inicio
                total_segundos += (fin - inicio).total_seconds()

        # Convertir los segundos totales a horas
        horas_totales = total_segundos / 3600

        # Calcular el pago total multiplicando las horas por la tarifa por hora
        pago_total = round(horas_totales * TARIFA_POR_HORA, 2)

        # Retornar el desglose del calculo en un diccionario
        return {
            "horasTotales": round(horas_totales, 2),    # Total de horas redondeadas
            "pagoTotal": pago_total,                      # Monto total a pagar
            "tarifaPorHora": TARIFA_POR_HORA,             # Tarifa por hora aplicada
            "totalJornadas": len(jornadas)                # Numero de jornadas consideradas
        }
        
        
    @staticmethod
    def listar_pendientes_pago(idUsuario_Empleado):
        """
        Obtiene las jornadas finalizadas de un empleado que aún no tienen pago registrado.
        Calcula horas trabajadas y pago sugerido según TARIFA_POR_HORA.
        """
        from app.models import Pago

        jornadas = JornadaLaboral.query.filter(
            JornadaLaboral.idUsuario_Empleado == idUsuario_Empleado,
            JornadaLaboral.hFin.isnot(None)
        ).order_by(JornadaLaboral.fecha.desc()).all()

        pendientes = []
        for j in jornadas:
            # Si ya fue pagada, se omite
            ya_pagada = Pago.query.filter_by(idJornada=j.idJornada).first()
            if ya_pagada:
                continue

            inicio = datetime.combine(date.today(), j.hInicio)
            fin = datetime.combine(date.today(), j.hFin)
            if fin < inicio:
                fin += timedelta(days=1)
            horas = round((fin - inicio).total_seconds() / 3600, 2)
            pago_estimado = round(horas * TARIFA_POR_HORA, 2)

            pendientes.append({
                "idJornada": j.idJornada,
                "fecha": str(j.fecha),
                "hInicio": str(j.hInicio),
                "hFin": str(j.hFin),
                "horas": horas,
                "pagoEstimado": pago_estimado
            })

        return pendientes