"""
ARCHIVO: jornada_routes.py
PROPOSITO: Definicion de las rutas HTTP para el modulo de jornadas laborales.
           Registra los endpoints para listar, crear, finalizar jornadas y calcular
           el pago correspondiente a las horas trabajadas por cada empleado.
           Utiliza el patron Blueprint de Flask para organizar las rutas de forma modular.
"""

# Importacion de Blueprint para crear un grupo de rutas modular
from flask import Blueprint

# Importacion del controlador de jornadas que maneja la logica de cada endpoint
from app.controllers.jornada_controller import JornadaController

# Crear el Blueprint de jornadas con el nombre "jornada"
jornada_bp = Blueprint("jornada", __name__)

# Registrar la ruta GET /api/jornadas que lista todas las jornadas laborales del sistema
# Retorna la lista completa de jornadas ordenadas por fecha descendente
jornada_bp.add_url_rule("/api/jornadas", view_func=JornadaController.listar_jornadas, methods=["GET"])

# Registrar la ruta POST /api/jornadas que permite crear una nueva jornada laboral
# Recibe los datos de la jornada (empleado, fecha, hora inicio/fin) en el cuerpo de la peticion
jornada_bp.add_url_rule("/api/jornadas", view_func=JornadaController.crear_jornada, methods=["POST"])

# Registrar la ruta PUT /api/jornadas/<id> que finaliza una jornada laboral activa
# Establece la hora de fin de la jornada identificada por su ID
jornada_bp.add_url_rule("/api/jornadas/<string:idJornada>", view_func=JornadaController.finalizar_jornada, methods=["PUT"])

# Registrar la ruta GET /api/jornadas/empleado/<id> que lista todas las jornadas
# de un empleado especifico identificado por su ID en la URL
jornada_bp.add_url_rule("/api/jornadas/empleado/<string:idUsuario>", view_func=JornadaController.jornadas_empleado, methods=["GET"])

# Registrar la ruta GET /api/jornadas/calcular-pago/<id> que calcula el pago total
# de un empleado basado en todas sus jornadas finalizadas y la tarifa por hora
jornada_bp.add_url_rule("/api/jornadas/calcular-pago/<string:idUsuario>", view_func=JornadaController.calcular_pago, methods=["GET"])

jornada_bp.add_url_rule("/api/jornadas/pendientes/<string:idUsuario_Empleado>",view_func=JornadaController.jornadas_pendientes, methods=["GET"])