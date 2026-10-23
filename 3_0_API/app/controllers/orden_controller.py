"""
ARCHIVO: orden_controller.py
PROPOSITO: Controlador de órdenes encargado de gestionar las operaciones CRUD
           (Crear, Leer, Actualizar) relacionadas con las órdenes de producción
           del sistema. Permite listar todas las órdenes, obtener una orden
           específica por ID, crear nuevas órdenes con sus detalles y actualizar
           órdenes existentes. No requiere autenticación para acceder a los endpoints.
"""

from flask import request
from flask import jsonify


class OrdenController:
    """
    Clase controladora que agrupa los métodos estáticos para la gestión
    completa de órdenes de producción del sistema.
    """

    @staticmethod
    def listar_ordenes():
        try:
            from app.services.reporte_service import ReporteService
            data = ReporteService.obtener_ordenes()
            return jsonify({"status": "success", "data": data}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    def obtener_orden(idOrden):
        try:
            from app.services.orden_service import OrdenService
            o = OrdenService.obtener_por_id(idOrden)
            if not o:
                return jsonify({"status": "error", "message": "Orden no encontrada"}), 404
            return jsonify({
                "status": "success",
                "data": {
                    "idOrden": o.idOrden,
                    "idCliente": o.idCliente,
                    "nombreCliente": o.cliente.nombreCliente if o.cliente else None,
                    "idUsuario_Admin": o.idUsuario_Admin,
                    "fechaPedido": str(o.fechaPedido) if o.fechaPedido else None,
                    "estadoProd": o.estadoProd,
                    "detalles": [
                        {
                            "idDetalle": d.idDetalle,
                            "idProducto": d.idProducto,
                            "nombreProducto": d.producto.nombreProducto if d.producto else None,
                            "talla": d.producto.talla if d.producto else None,
                            "color": d.producto.color if d.producto else None,
                            "cantidadTotal": d.cantidadTotal
                        } for d in o.detalles
                    ]
                }
            }), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    def crear_orden():
        """
        Endpoint para registrar la orden:
        Crea/asocia el cliente, crea/asocia la prenda con talla y color, y registra el detalle.
        """
        from datetime import date
        data = request.get_json()
        try:
            from app.services.orden_service import OrdenService
            from app.services.cliente_service import ClienteService
            from app.models import Producto
            from app.database.database import db
            from app.utils.generar_id import generar_id

            id_cliente = data.get("idCliente")

            # 1. Crear cliente si no existe
            if not id_cliente and data.get("nombreCliente"):
                nuevo_c = ClienteService.crear_cliente(
                    data.get("nombreCliente"),
                    telefono=data.get("telefono"),
                    correo=data.get("correo")
                )
                id_cliente = nuevo_c.idCliente

            if not id_cliente:
                return jsonify({"status": "error", "message": "El cliente es obligatorio"}), 400

            # 2. Fecha automática
            fecha_pedido = data.get("fechaPedido") or date.today().strftime("%Y-%m-%d")

            # 3. Crear cabecera de la orden
            orden = OrdenService.crear_orden(
                idCliente=id_cliente,
                idUsuario_Admin=data.get("idUsuario_Admin"),
                fechaPedido=fecha_pedido,
                estadoProd=data.get("estadoProd", "En proceso")
            )

            # 4. Registrar prenda con su talla y color seleccionados
            nombre_producto = data.get("nombreProducto")
            cantidad = data.get("cantidadTotal")
            talla = data.get("talla", "M")
            color = data.get("color", "Negro")

            if nombre_producto and cantidad:
                # Buscar si existe la prenda con la misma talla y color
                prod = Producto.query.filter_by(
                    nombreProducto=nombre_producto.strip(),
                    talla=talla,
                    color=color
                ).first()

                if not prod:
                    nuevo_id_prod = generar_id("PRD", Producto, "idProducto")
                    prod = Producto(
                        idProducto=nuevo_id_prod,
                        nombreProducto=nombre_producto.strip(),
                        talla=talla,
                        color=color
                    )
                    db.session.add(prod)
                    db.session.commit()

                # Vincular en detalle_orden
                OrdenService.agregar_detalle(
                    idOrden=orden.idOrden,
                    idProducto=prod.idProducto,
                    cantidadTotal=int(cantidad)
                )

            return jsonify({
                "status": "success",
                "message": "Pedido registrado exitosamente",
                "data": {"idOrden": orden.idOrden}
            }), 201
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 400

    @staticmethod
    def actualizar_orden(idOrden):
        data = request.get_json()
        try:
            from app.services.orden_service import OrdenService
            orden = OrdenService.actualizar_orden(idOrden, **data)
            if not orden:
                return jsonify({"status": "error", "message": "Orden no encontrada"}), 404
            return jsonify({"status": "success", "message": "Orden actualizada"}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 400