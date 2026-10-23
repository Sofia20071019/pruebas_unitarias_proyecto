"""
ARCHIVO: jornada_controller.py
PROPOSITO: Controlador de jornadas encargado de gestionar las operaciones
           relacionadas con las jornadas laborales de los empleados del sistema.
           Permite listar jornadas (todas o por empleado), crear jornadas,
           finalizar jornadas, obtener jornadas de un empleado específico y
           calcular el pago total de horas trabajadas. El acceso varía según
           el rol del usuario autenticado.
"""

# Importación de 'request' para acceder a los datos de la petición HTTP entrante
from flask import request
# Importación de 'jsonify' para construir respuestas HTTP en formato JSON
from flask import jsonify
# Importación de decoradores para control de acceso: token JWT y roles
from app.utils.decorators import token_requerido, rol_requerido


class JornadaController:
    """
    Clase controladora que agrupa los métodos estáticos para la gestión
    de jornadas laborales de los empleados del sistema.
    """

    @staticmethod
    @token_requerido
    def listar_jornadas():
        """
        Endpoint para listar jornadas laborales.
        Requiere autenticación válida (token JWT).
        Si el usuario tiene rol de administrador (ROL-001), retorna todas
        las jornadas del sistema. De lo contrario, retorna solo las jornadas
        del empleado autenticado.
        """
        try:
            # Importación diferida del servicio de reportes para evitar dependencias circulares.
            # El servicio de reportes es la fuente única de datos que comparten la vista
            # y la exportación a Excel, garantizando consistencia entre ambas.
            from app.services.reporte_service import ReporteService
            # Obtener el ID del usuario autenticado desde el token JWT
            usuario_id = request.usuario.get("idUsuario")
            # Obtener el ID del rol del usuario autenticado
            id_rol = request.usuario.get("idRol")

            # Verificar si el usuario es administrador para mostrar todas las jornadas
            es_admin = id_rol == "ROL-001"

            # Obtener las jornadas con la misma lógica que comparte el Excel:
            # el administrador ve todas, el empleado solo sus propias jornadas.
            data = ReporteService.obtener_jornadas(es_admin=es_admin, id_usuario=usuario_id)

            # Retornar respuesta exitosa con la lista de jornadas
            return jsonify({"status": "success", "data": data}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @token_requerido
    def crear_jornada():
        """
        Endpoint para crear una nueva jornada laboral.
        Requiere autenticación válida (token JWT).
        Recibe ID del empleado, fecha, hora de inicio y hora de fin
        en el cuerpo JSON. Retorna los datos de la jornada creada con código 201.
        Maneja errores de conflicto (ValueError) cuando la jornada ya existe.
        """
        # Obtener el cuerpo de la petición HTTP en formato JSON
        data = request.get_json()
        try:
            # Importación diferida del servicio de jornadas
            from app.services.jornada_service import JornadaService
            # Crear la jornada con los datos recibidos del JSON
            jornada = JornadaService.crear_jornada(
                idUsuario_Empleado=data.get("idUsuario_Empleado"),
                fecha=data.get("fecha"),
                hInicio=data.get("hInicio"),
                hFin=data.get("hFin")
            )
            # Retornar respuesta exitosa con los datos de la jornada creada (código 201)
            return jsonify({
                "status": "success",
                "data": {
                    "idJornada": jornada.idJornada,
                    "operario": jornada.empleado.pNombre if jornada.empleado else None,
                    "horaEntrada": str(jornada.hInicio) if jornada.hInicio else None
                }
            }), 201
        except ValueError as e:
            # Capturar error de conflicto (ej: jornada duplicada) y retornar código 409
            return jsonify({"status": "error", "message": str(e)}), 409
        except Exception as e:
            # Capturar otras excepciones y retornar error 400
            return jsonify({"status": "error", "message": str(e)}), 400

    @staticmethod
    @token_requerido
    def finalizar_jornada(idJornada):
        """
        Endpoint para finalizar una jornada laboral existente.
        Requiere autenticación válida (token JWT).
        Recibe la hora de fin en el cuerpo JSON.
        Retorna mensaje de éxito o error 404 si la jornada no existe.
        """
        # Obtener el cuerpo de la petición HTTP en formato JSON
        data = request.get_json()
        try:
            # Importación diferida del servicio de jornadas
            from app.services.jornada_service import JornadaService
            # Llamar al servicio para finalizar la jornada con la hora de fin proporcionada
            jornada = JornadaService.finalizar_jornada(idJornada, hFin=data.get("hFin"))
            # Si la jornada no fue encontrada, retornar error 404
            if not jornada:
                return jsonify({"status": "error", "message": "Jornada no encontrada"}), 404
            # Retornar mensaje de éxito tras finalizar la jornada
            return jsonify({"status": "success", "message": "Jornada finalizada"}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 400
            return jsonify({"status": "error", "message": str(e)}), 400

    @staticmethod
    @token_requerido
    def jornadas_empleado(idUsuario):
        """
        Endpoint para obtener todas las jornadas de un empleado específico.
        Requiere autenticación válida (token JWT).
        Retorna las jornadas del empleado junto con su nombre y ID.
        """
        try:
            # Importación diferida del servicio de jornadas
            from app.services.jornada_service import JornadaService
            # Importación del modelo Usuario para resolver la relación
            from app.models import Usuario
            # Obtener todas las jornadas del empleado especificado
            jornadas = JornadaService.listar_por_empleado(idUsuario)
            # Buscar los datos del empleado por su ID
            empleado = Usuario.query.get(idUsuario)
            # Construir el nombre completo del empleado o usar "Desconocido"
            nombre_empleado = f"{empleado.pNombre or ''} {empleado.pApellido or ''}".strip() if empleado else "Desconocido"
            # Lista para almacenar los datos formateados de cada jornada
            data = []
            # Iterar sobre cada jornada para construir la respuesta
            for j in jornadas:
                # Agregar los datos de la jornada a la lista
                data.append({
                    "idJornada": j.idJornada,
                    "fecha": str(j.fecha) if j.fecha else None,
                    "hInicio": str(j.hInicio) if j.hInicio else None,
                    "hFin": str(j.hFin) if j.hFin else None
                })
            # Retornar respuesta exitosa con la información del empleado y sus jornadas
            return jsonify({
                "status": "success",
                "data": {
                    "empleado": nombre_empleado,
                    "idUsuario": idUsuario,
                    "jornadas": data
                }
            }), 200
        except Exception as e:
            # Capturar excepciones y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @token_requerido
    def calcular_pago(idUsuario):
        """
        Endpoint para calcular el pago total de horas trabajadas de un empleado.
        Requiere autenticación válida (token JWT).
        Retorna el cálculo de horas totales y monto a pagar.
        """
        try:
            # Importación diferida del servicio de jornadas
            from app.services.jornada_service import JornadaService
            # Llamar al servicio para calcular las horas totales trabajadas por el empleado
            calculo = JornadaService.calcular_horas_totales(idUsuario)
            # Retornar respuesta exitosa con el cálculo de pago
            return jsonify({"status": "success", "data": calculo}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500
        
    @staticmethod
    @token_requerido
    def jornadas_pendientes(idUsuario_Empleado):
        """Endpoint para listar jornadas sin pagar de un empleado."""
        try:
            from app.services.jornada_service import JornadaService
            pendientes = JornadaService.listar_pendientes_pago(idUsuario_Empleado)
            return jsonify({"status": "success", "data": pendientes}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500        