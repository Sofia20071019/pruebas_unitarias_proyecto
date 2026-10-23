"""
ARCHIVO: reporte_routes.py
PROPOSITO: Definicion de las rutas HTTP para el modulo de reportes del sistema.
           Registra los endpoints de consulta (JSON) y de exportacion a Excel
           (.xlsx) para los cuatro reportes: materias primas, horas trabajadas,
           trabajos mas realizados y produccion. Todos los endpoints requieren
           rol de administrador (ROL-001).
"""

# Importacion de Blueprint para crear un grupo de rutas modular
from flask import Blueprint

# Importacion del controlador de reportes que maneja la logica de cada endpoint
from app.controllers.reporte_controller import ReporteController

# Crear el Blueprint de reportes con el nombre "reporte"
reporte_bp = Blueprint("reporte", __name__)

# ---------------------------------------------------------------------------
# REPORTE: MATERIAS PRIMAS (inventario)
# ---------------------------------------------------------------------------

# GET /api/reportes/materias-primas: consulta JSON con los datos filtrados
reporte_bp.add_url_rule(
    "/api/reportes/materias-primas",
    view_func=ReporteController.listar_materias_primas,
    methods=["GET"],
)

# GET /api/reportes/materias-primas/excel: descarga el reporte en .xlsx
reporte_bp.add_url_rule(
    "/api/reportes/materias-primas/excel",
    view_func=ReporteController.exportar_materias_primas,
    methods=["GET"],
)

# ---------------------------------------------------------------------------
# REPORTE: HORAS TRABAJADAS
# ---------------------------------------------------------------------------

# GET /api/reportes/horas: consulta JSON con las jornadas filtradas
reporte_bp.add_url_rule(
    "/api/reportes/horas",
    view_func=ReporteController.listar_horas,
    methods=["GET"],
)

# GET /api/reportes/horas/excel: descarga el reporte en .xlsx
reporte_bp.add_url_rule(
    "/api/reportes/horas/excel",
    view_func=ReporteController.exportar_horas,
    methods=["GET"],
)

# ---------------------------------------------------------------------------
# REPORTE: TRABAJOS MAS REALIZADOS
# ---------------------------------------------------------------------------

# GET /api/reportes/trabajos: consulta JSON con asignaciones y rankings
reporte_bp.add_url_rule(
    "/api/reportes/trabajos",
    view_func=ReporteController.listar_trabajos,
    methods=["GET"],
)

# GET /api/reportes/trabajos/excel: descarga el reporte en .xlsx
reporte_bp.add_url_rule(
    "/api/reportes/trabajos/excel",
    view_func=ReporteController.exportar_trabajos,
    methods=["GET"],
)

# ---------------------------------------------------------------------------
# REPORTE: PRODUCCION
# ---------------------------------------------------------------------------

# GET /api/reportes/produccion: consulta JSON con las ordenes filtradas
reporte_bp.add_url_rule(
    "/api/reportes/produccion",
    view_func=ReporteController.listar_produccion,
    methods=["GET"],
)

# GET /api/reportes/produccion/excel: descarga el reporte en .xlsx
reporte_bp.add_url_rule(
    "/api/reportes/produccion/excel",
    view_func=ReporteController.exportar_produccion,
    methods=["GET"],
)
