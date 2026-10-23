"""
ARCHIVO: reporte_service.py
PROPOSITO: Servicio central de reportes del sistema Kimuka. Actua como la UNICA
           fuente de datos de los modulos de reportes: tanto lo que se muestra
           en pantalla (via los controladores existentes) como lo que se exporta
           a Excel se construye a partir de estas consultas, evitando duplicacion
           de logica e inconsistencias entre la vista y la descarga.

           Cada metodo retorna un list[dict] con la MISMA forma que consumen las
           paginas de reportes del frontend, pero ademas enriquece los registros
           con campos calculados (horas trabajadas, anio, mes, unidades por orden)
           que se utilizan para el grafico, la tabla detallada y el Excel.
"""

# Importacion de la clase date y datetime para el calculo de horas trabajadas
from datetime import date, datetime, timedelta

# Importacion de los modelos necesarios para las consultas de reportes
from app.models import (
    Insumo, JornadaLaboral, Usuario, Asignacion,
    OrdenProduccion, Categoria
)


class ReporteService:
    """Clase que concentra la logica de consulta y serializacion de los reportes."""

    # ------------------------------------------------------------------
    # HELPERS PRIVADOS
    # ------------------------------------------------------------------

    @staticmethod
    def _horas_entre(h_inicio, h_fin):
        """
        Calcula las horas transcurridas entre una hora de inicio y una de fin.
        Si la hora de fin es menor que la de inicio se asume turno nocturno.
        Misma logica que la funcion horasEntre del frontend (ReporteHoras.jsx).

        Args:
            h_inicio (time): Hora de inicio de la jornada.
            h_fin (time): Hora de fin de la jornada.

        Returns:
            float: Horas trabajadas redondeadas a 2 decimales.
        """
        if not h_inicio or not h_fin:
            return 0
        inicio = datetime.combine(date.today(), h_inicio)
        fin = datetime.combine(date.today(), h_fin)
        if fin < inicio:
            fin += timedelta(days=1)
        return round((fin - inicio).total_seconds() / 3600, 2)

    @staticmethod
    def _nombre_completo(usuario):
        """Construye el nombre completo de un usuario o 'Desconocido'."""
        if not usuario:
            return "Desconocido"
        return f"{usuario.pNombre or ''} {usuario.pApellido or ''}".strip() or "Desconocido"

    # ------------------------------------------------------------------
    # REPORTE: MATERIAS PRIMAS (INVENTARIO)
    # ------------------------------------------------------------------

    @staticmethod
    def obtener_materias_primas(filtro_categoria=None):
        """
        Obtiene los insumos del inventario con su categoria, unidad y stock.

        Args:
            filtro_categoria (str, optional): idCategoria para filtrar.
                'todos' o None retorna todos los insumos.

        Returns:
            list: Registros serializados con la misma forma que la pagina
                  ReporteMateriasPrimas.jsx consume.
        """
        query = Insumo.query.order_by(Insumo.nombreInsumo)

        if filtro_categoria and filtro_categoria != "todos":
            query = query.filter(Insumo.idCategoria == filtro_categoria)

        insumos = query.all()

        data = []
        for i in insumos:
            data.append({
                "idInsumo": i.idInsumo,
                "nombreInsumo": i.nombreInsumo,
                "idCategoria": i.idCategoria,
                "nombreCategoria": i.categoria.nombreCategoria if i.categoria else None,
                "idUnidad": i.idUnidad,
                "nombreUnidad": i.unidad.nombreUnidad if i.unidad else None,
                "cantidad": float(i.cantidad) if i.cantidad else 0
            })
        return data

    # ------------------------------------------------------------------
    # REPORTE: HORAS TRABAJADAS
    # ------------------------------------------------------------------

    @staticmethod
    def obtener_jornadas(es_admin=True, id_usuario=None, filtro_empleado=None,
                         filtro_mes=None, filtro_anio=None):
        """
        Obtiene las jornadas laborales con datos del empleado y campos
        calculados (horas trabajadas, anio y mes) para el reporte.

        Args:
            es_admin (bool): Si es True retorna todas las jornadas; si es False
                solo las del empleado autenticado.
            id_usuario (str, optional): ID del usuario autenticado (empleado).
            filtro_empleado (str, optional): idUsuario_Empleado para filtrar.
            filtro_mes (str, optional): Mes 'MM' para filtrar.
            filtro_anio (str, optional): Anio 'YYYY' para filtrar.

        Returns:
            list: Registros serializados, incluyendo los campos horas, anio y mes.
        """
        query = JornadaLaboral.query.order_by(JornadaLaboral.fecha.desc())

        if not es_admin:
            query = query.filter(JornadaLaboral.idUsuario_Empleado == id_usuario)
        elif filtro_empleado:
            query = query.filter(JornadaLaboral.idUsuario_Empleado == filtro_empleado)

        if filtro_mes:
            query = query.filter(JornadaLaboral.fecha.like(f"%-{filtro_mes}-%"))
        if filtro_anio:
            query = query.filter(JornadaLaboral.fecha.like(f"{filtro_anio}-%"))

        jornadas = query.all()

        data = []
        for j in jornadas:
            empleado = Usuario.query.get(j.idUsuario_Empleado)
            data.append({
                "idJornada": j.idJornada,
                "idUsuario_Empleado": j.idUsuario_Empleado,
                "nombreEmpleado": ReporteService._nombre_completo(empleado),
                "fecha": str(j.fecha) if j.fecha else None,
                "hInicio": str(j.hInicio) if j.hInicio else None,
                "hFin": str(j.hFin) if j.hFin else None,
                "horas": ReporteService._horas_entre(j.hInicio, j.hFin),
                "anio": (str(j.fecha) or "")[:4],
                "mes": (str(j.fecha) or "")[5:7]
            })
        return data

    # ------------------------------------------------------------------
    # REPORTE: TRABAJOS MAS REALIZADOS (ASIGNACIONES)
    # ------------------------------------------------------------------

    @staticmethod
    def obtener_asignaciones(filtro_empleado=None, filtro_mes=None,
                             filtro_anio=None, filtro_estado=None):
        """
        Obtiene las asignaciones de insumos a empleados con datos del empleado
        y del insumo, aplicando los filtros del reporte de trabajos.

        Args:
            filtro_empleado (str, optional): idUsuario_Empleado para filtrar.
            filtro_mes (str, optional): Mes 'MM' para filtrar.
            filtro_anio (str, optional): Anio 'YYYY' para filtrar.
            filtro_estado (str, optional): Estado de la asignacion.

        Returns:
            list: Registros serializados de asignaciones.
        """
        query = Asignacion.query.order_by(Asignacion.fechaAsignacion.desc())

        if filtro_empleado:
            query = query.filter(Asignacion.idUsuario_Empleado == filtro_empleado)
        if filtro_mes:
            query = query.filter(Asignacion.fechaAsignacion.like(f"%-{filtro_mes}-%"))
        if filtro_anio:
            query = query.filter(Asignacion.fechaAsignacion.like(f"{filtro_anio}-%"))
        if filtro_estado:
            query = query.filter(Asignacion.estado == filtro_estado)

        asignaciones = query.all()

        data = []
        for a in asignaciones:
            empleado = Usuario.query.get(a.idUsuario_Empleado)
            insumo = Insumo.query.get(a.idInsumo)
            data.append({
                "idAsignacion": a.idAsignacion,
                "idUsuario_Empleado": a.idUsuario_Empleado,
                "nombreEmpleado": ReporteService._nombre_completo(empleado),
                "idInsumo": a.idInsumo,
                "nombreInsumo": insumo.nombreInsumo if insumo else "Desconocido",
                "cantidad": float(a.cantidad) if a.cantidad else 0,
                "fechaAsignacion": str(a.fechaAsignacion) if a.fechaAsignacion else None,
                "estado": a.estado
            })
        return data

    @staticmethod
    def ranking_materiales(asignaciones):
        """
        Calcula el ranking de materiales mas asignados a partir de una lista
        de asignaciones serializadas (misma agregacion que ReporteTrabajos.jsx).

        Args:
            asignaciones (list): Lista de asignaciones del servicio.

        Returns:
            list: Registros {nombre, count, cantidad} ordenados de mayor a menor.
        """
        mapa = {}
        for a in asignaciones:
            if a["nombreInsumo"] not in mapa:
                mapa[a["nombreInsumo"]] = {"nombre": a["nombreInsumo"], "count": 0, "cantidad": 0}
            mapa[a["nombreInsumo"]]["count"] += 1
            mapa[a["nombreInsumo"]]["cantidad"] += a["cantidad"] or 0
        return sorted(mapa.values(), key=lambda m: m["count"], reverse=True)

    @staticmethod
    def ranking_empleados(asignaciones):
        """
        Calcula el ranking de empleados mas activos a partir de una lista
        de asignaciones serializadas (misma agregacion que ReporteTrabajos.jsx).

        Args:
            asignaciones (list): Lista de asignaciones del servicio.

        Returns:
            list: Registros {nombre, count, completadas} ordenados de mayor a menor.
        """
        mapa = {}
        for a in asignaciones:
            if a["nombreEmpleado"] not in mapa:
                mapa[a["nombreEmpleado"]] = {"nombre": a["nombreEmpleado"], "count": 0, "completadas": 0}
            mapa[a["nombreEmpleado"]]["count"] += 1
            if a["estado"] == "Completada":
                mapa[a["nombreEmpleado"]]["completadas"] += 1
        return sorted(mapa.values(), key=lambda m: m["count"], reverse=True)

    # ------------------------------------------------------------------
    # REPORTE: PRODUCCION (ORDENES)
    # ------------------------------------------------------------------

    @staticmethod
    def obtener_ordenes(filtro_cliente=None, filtro_mes=None, filtro_anio=None,
                        filtro_estado=None):
        """
        Obtiene las ordenes de produccion con datos del cliente, sus detalles
        de productos y el total de unidades por orden.

        Args:
            filtro_cliente (str, optional): Nombre del cliente para filtrar.
            filtro_mes (str, optional): Mes 'MM' para filtrar.
            filtro_anio (str, optional): Anio 'YYYY' para filtrar.
            filtro_estado (str, optional): Estado de produccion ('✔', '..', '✖').

        Returns:
            list: Registros serializados de ordenes, incluyendo el campo unidades.
        """
        query = OrdenProduccion.query

        if filtro_cliente:
            query = query.filter(
                OrdenProduccion.cliente.has(nombreCliente=filtro_cliente)
            )
        if filtro_mes:
            query = query.filter(OrdenProduccion.fechaPedido.like(f"%-{filtro_mes}-%"))
        if filtro_anio:
            query = query.filter(OrdenProduccion.fechaPedido.like(f"{filtro_anio}-%"))
        if filtro_estado:
            query = query.filter(OrdenProduccion.estadoProd == filtro_estado)

        ordenes = query.order_by(OrdenProduccion.fechaPedido.desc()).all()

        data = []
        for o in ordenes:
            detalles = [
                {
                    "idDetalle": d.idDetalle,
                    "idProducto": d.idProducto,
                    "nombreProducto": d.producto.nombreProducto if d.producto else None,
                    "talla": d.producto.talla if d.producto else None,
                    "color": d.producto.color if d.producto else None,
                    "cantidadTotal": d.cantidadTotal
                } for d in o.detalles
            ]
            data.append({
                "idOrden": o.idOrden,
                "idCliente": o.idCliente,
                "nombreCliente": o.cliente.nombreCliente if o.cliente else None,
                "telefonoCliente": o.cliente.telefono if o.cliente else None,   
                "correoCliente": getattr(o.cliente, 'correo', None),
                "idUsuario_Admin": o.idUsuario_Admin,
                "fechaPedido": str(o.fechaPedido) if o.fechaPedido else None,
                "estadoProd": o.estadoProd,
                "detalles": detalles,
                "unidades": sum(d.get("cantidadTotal") or 0 for d in detalles)
            })
        return data

    @staticmethod
    def ranking_productos(ordenes):
        """
        Calcula el ranking de productos con mas unidades fabricadas a partir
        de una lista de ordenes serializadas (misma agregacion que
        ReporteProduccion.jsx).

        Args:
            ordenes (list): Lista de ordenes del servicio.

        Returns:
            list: Registros {nombre, unidades, ordenes} ordenados de mayor a menor.
        """
        mapa = {}
        for o in ordenes:
            for d in o["detalles"]:
                nombre = d["nombreProducto"]
                if nombre not in mapa:
                    mapa[nombre] = {"nombre": nombre, "unidades": 0, "ordenes": 0}
                mapa[nombre]["unidades"] += d["cantidadTotal"] or 0
                mapa[nombre]["ordenes"] += 1
        return sorted(mapa.values(), key=lambda p: p["unidades"], reverse=True)

    # ------------------------------------------------------------------
    # VALIDACIONES AUXILIARES
    # ------------------------------------------------------------------

    @staticmethod
    def existe_categoria(id_categoria):
        """Verifica que exista una categoria por su idCategoria."""
        return Categoria.query.get(id_categoria) is not None

    @staticmethod
    def existe_usuario(id_usuario):
        """Verifica que exista un usuario por su idUsuario."""
        return Usuario.query.get(id_usuario) is not None
