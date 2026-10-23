"""
ARCHIVO: pago_controller.py
PROPOSITO: Controlador de pagos encargado de gestionar las operaciones
           relacionadas con los pagos realizados a empleados por sus jornadas
           laborales. Permite listar todos los pagos, crear nuevos pagos,
           aprobar pagos y consultar pagos por jornada. Todas las operaciones
           requieren rol de administrador (ROL-001).
"""

# Importación de 'request' para acceder a los datos de la petición HTTP entrante
from flask import request
# Importación de 'jsonify' para construir respuestas HTTP en formato JSON
from flask import jsonify
# Importación de decoradores para control de acceso: token JWT y roles
from app.utils.decorators import token_requerido, rol_requerido


class PagoController:
    """
    Clase controladora que agrupa los métodos estáticos para la gestión
    de pagos realizados a empleados del sistema.
    """

    @staticmethod
    @rol_requerido("ROL-001")
    def listar_pagos():
        """
        Endpoint para listar todos los pagos registrados en el sistema.
        Requiere rol de administrador (ROL-001).
        Retorna una lista completa con la información de cada pago incluyendo
        jornada asociada, administrador que realizó el pago, monto, método
        de pago y fecha.
        """
        try:
            # Importación diferida del servicio de pagos para evitar dependencias circulares
            from app.services.pago_service import PagoService
            # Obtener todos los pagos registrados en la base de datos
            pagos = PagoService.listar_todos()
            # Lista para almacenar los datos formateados de cada pago
            data = []
            # Iterar sobre cada pago para construir la respuesta
            for p in pagos:
                # Agregar los datos formateados del pago a la lista
                data.append({
                    "idPago": p.idPago,
                    "idJornada": p.idJornada,
                    "idUsuario_Admin": p.idUsuario_Admin,
                    "montoPagado": float(p.montoPagado) if p.montoPagado else None,
                    "idMetodo": p.idMetodo,
                    "nombreMetodo": p.metodo.nombreMetodo if p.metodo else None,
                    "fechaPago": str(p.fechaPago) if p.fechaPago else None
                })
            # Retornar respuesta exitosa con la lista de pagos
            return jsonify({"status": "success", "data": data}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @rol_requerido("ROL-001")
    def crear_pago():
        """
        Endpoint para registrar un nuevo pago en el sistema.
        Requiere rol de administrador (ROL-001).
        Recibe ID de la jornada, ID del administrador, monto, método de pago
        y fecha en el cuerpo JSON. Retorna el ID del pago creado con código 201.
        """
        # Obtener el cuerpo de la petición HTTP en formato JSON
        data = request.get_json()
        try:
            # Importación diferida del servicio de pagos
            from app.services.pago_service import PagoService
            # Crear el pago con los datos recibidos del JSON
            pago = PagoService.crear_pago(
                idJornada=data.get("idJornada"),
                idUsuario_Admin=data.get("idUsuario_Admin"),
                montoPagado=data.get("montoPagado"),
                idMetodo=data.get("idMetodo"),
                fechaPago=data.get("fechaPago")
            )
            # Retornar respuesta exitosa con el ID del pago creado (código 201)
            return jsonify({
                "status": "success",
                "data": {"idPago": pago.idPago}
            }), 201
        except Exception as e:
            # Capturar excepciones y retornar error 400
            return jsonify({"status": "error", "message": str(e)}), 400

    @staticmethod
    @rol_requerido("ROL-001")
    def aprobar_pago(idPago):
        """
        Endpoint para aprobar o actualizar un pago existente.
        Requiere rol de administrador (ROL-001).
        Recibe los campos a actualizar en el cuerpo JSON.
        Retorna mensaje de éxito o error 404 si el pago no existe.
        """
        # Obtener el cuerpo de la petición HTTP en formato JSON
        data = request.get_json()
        try:
            # Importación diferida del servicio de pagos
            from app.services.pago_service import PagoService
            # Llamar al servicio para aprobar el pago con los datos recibidos
            # Se desempaqueta el diccionario **data para pasar cada campo como argumento
            pago = PagoService.aprobar_pago(idPago, **data)
            # Si el pago no fue encontrado, retornar error 404
            if not pago:
                return jsonify({"status": "error", "message": "Pago no encontrado"}), 404
            # Retornar mensaje de éxito si la aprobación fue correcta
            return jsonify({"status": "success", "message": "Pago actualizado"}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 400
            return jsonify({"status": "error", "message": str(e)}), 400

    @staticmethod
    @rol_requerido("ROL-001")
    def pagos_por_jornada(idJornada):
        """
        Endpoint para listar todos los pagos asociados a una jornada específica.
        Requiere rol de administrador (ROL-001).
        Retorna una lista con los pagos de la jornada indicada incluyendo
        monto, método de pago y fecha.
        """
        try:
            # Importación diferida del servicio de pagos
            from app.services.pago_service import PagoService
            # Obtener todos los pagos asociados a la jornada especificada
            pagos = PagoService.listar_por_jornada(idJornada)
            # Lista para almacenar los datos formateados de cada pago
            data = []
            # Iterar sobre cada pago para construir la respuesta
            for p in pagos:
                # Agregar los datos formateados del pago a la lista
                data.append({
                    "idPago": p.idPago,
                    "montoPagado": float(p.montoPagado) if p.montoPagado else None,
                    "nombreMetodo": p.metodo.nombreMetodo if p.metodo else None,
                    "fechaPago": str(p.fechaPago) if p.fechaPago else None
                })
            # Retornar respuesta exitosa con la lista de pagos de la jornada
            return jsonify({"status": "success", "data": data}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500
