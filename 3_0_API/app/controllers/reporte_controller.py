"""
ARCHIVO: reporte_controller.py
PROPOSITO: Controlador del modulo de reportes del sistema Kimuka. Expone los
           endpoints de consulta (JSON) y de exportacion a Excel (.xlsx) para
           los cuatro reportes del negocio: materias primas, horas trabajadas,
           trabajos mas realizados y produccion.

           Todos los endpoints requieren rol de administrador (ROL-001).
           Tanto la vista (JSON) como la exportacion a Excel se construyen con
           el mismo ReporteService, por lo que los datos descargados son
           identicos a los mostrados en pantalla.
"""

import re
from flask import request
from flask import jsonify
from flask import send_file

from app.utils.decorators import rol_requerido
from app.utils.generador_excel import crear_excel_reporte, nombre_archivo_excel


class ReporteController:
    """Clase controladora de los endpoints de consulta y exportacion de reportes."""

    MESES_VALIDOS = {f"{m:02d}" for m in range(1, 13)}
    # Normalizados para aceptar tanto "En proceso" como "En Proceso"
    ESTADOS_TRABAJOS = {"pendiente", "en proceso", "completada"}
    ESTADOS_PRODUCCION = {"✔", "..", "✖", "entregado", "en proceso", "cancelado"}
    NOMBRES_MESES = {
        "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
        "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
        "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre"
    }

    # ------------------------------------------------------------------
    # VALIDACION DE FILTROS
    # ------------------------------------------------------------------

    @staticmethod
    def _validar_categoria(valor):
        if not valor or valor.lower() == "todos":
            return None
        from app.services.reporte_service import ReporteService
        if not ReporteService.existe_categoria(valor):
            raise ValueError("La categoria indicada no existe.")
        return valor

    @staticmethod
    def _validar_empleado(valor):
        if not valor or valor.lower() == "todos":
            return None
        from app.services.reporte_service import ReporteService
        if not ReporteService.existe_usuario(valor):
            raise ValueError("El empleado indicado no existe.")
        return valor

    @staticmethod
    def _validar_mes(valor):
        if not valor or valor.lower() == "todos":
            return None
        if valor not in ReporteController.MESES_VALIDOS:
            raise ValueError("El mes debe tener formato MM (01-12).")
        return valor

    @staticmethod
    def _validar_anio(valor):
        if not valor or valor.lower() == "todos":
            return None
        if not re.fullmatch(r"\d{4}", valor):
            raise ValueError("El anio debe tener 4 digitos.")
        return valor

    @staticmethod
    def _validar_estado_trabajos(valor):
        if not valor or valor.lower() == "todos":
            return None
        if valor.strip().lower() not in ReporteController.ESTADOS_TRABAJOS:
            raise ValueError("El estado indicado no es valido.")
        # Retornar con la capitalización estándar esperada por la BD
        val_clean = valor.strip().lower()
        if val_clean == "completada":
            return "Completada"
        elif val_clean == "en proceso":
            return "En proceso"
        return "Pendiente"

    @staticmethod
    def _validar_estado_produccion(valor):
        if not valor or valor.lower() == "todos":
            return None
        return valor

    @staticmethod
    def _leer_filtros(validaciones):
        filtros = {}
        for parametro, validador in validaciones.items():
            # Acepta tanto "empleado" como "idUsuario_Empleado"
            valor_crudo = request.args.get(parametro)
            if valor_crudo is None and parametro == "empleado":
                valor_crudo = request.args.get("idUsuario_Empleado")
            try:
                filtros[parametro] = validador(valor_crudo)
            except ValueError as e:
                return None, str(e)
        return filtros, None

    @staticmethod
    def _filtros_resumen(filtros):
        etiquetas = {
            "categoria": "Categoria",
            "empleado": "Empleado",
            "mes": "Mes",
            "anio": "Anio",
            "estado": "Estado",
            "cliente": "Cliente",
        }
        resumen = []
        for clave, valor in filtros.items():
            if not valor:
                continue
            etiqueta = etiquetas.get(clave, clave)
            if clave == "mes":
                valor = ReporteController.NOMBRES_MESES.get(valor, valor)
            resumen.append((etiqueta, valor))
        return resumen

    @staticmethod
    def _usuario_autenticado():
        from app.models import Usuario
        usuario_dict = getattr(request, 'usuario', {}) or {}
        usuario_id = usuario_dict.get("idUsuario")
        usuario = Usuario.query.get(usuario_id) if usuario_id else None
        if usuario:
            nombre = f"{usuario.pNombre or ''} {usuario.pApellido or ''}".strip()
            if nombre:
                return nombre
            return usuario.correo or usuario_id
        return usuario_id or "Administrador"

    @staticmethod
    def _nombre_estado_produccion(estado):
        if estado == "✔" or str(estado).lower() == "entregado":
            return "Entregado"
        if estado == "✖" or str(estado).lower() == "cancelado":
            return "Cancelado"
        return "En Proceso"

    # ==================================================================
    # REPORTE: MATERIAS PRIMAS
    # ==================================================================

    @staticmethod
    @rol_requerido("ROL-001")
    def listar_materias_primas():
        filtros, error = ReporteController._leer_filtros({
            "categoria": ReporteController._validar_categoria,
        })
        if error:
            return jsonify({"status": "error", "message": error}), 400
        try:
            from app.services.reporte_service import ReporteService
            data = ReporteService.obtener_materias_primas(filtro_categoria=filtros["categoria"])
            return jsonify({
                "status": "success",
                "data": data,
                "filtros": {k: v for k, v in filtros.items() if v}
            }), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @rol_requerido("ROL-001")
    def exportar_materias_primas():
        filtros, error = ReporteController._leer_filtros({
            "categoria": ReporteController._validar_categoria,
        })
        if error:
            return jsonify({"status": "error", "message": error}), 400
        try:
            from app.services.reporte_service import ReporteService
            data = ReporteService.obtener_materias_primas(filtro_categoria=filtros["categoria"])

            total_stock = sum(i["cantidad"] or 0 for i in data)
            sin_stock = sum(1 for i in data if not i["cantidad"])

            filas = [
                [
                    i["nombreInsumo"],
                    i["nombreCategoria"],
                    i["nombreUnidad"],
                    i["cantidad"],
                    "Disponible" if (i["cantidad"] or 0) > 0 else "Sin stock"
                ] for i in data
            ]

            secciones = [{
                "hoja": "Inventario",
                "titulo": "Inventario de Materias Primas",
                "encabezados": ["Material", "Categoria", "Unidad", "Stock", "Estado"],
                "filas": filas,
                "ancho_columnas": [38, 22, 16, 12, 14],
                "formatos": {4: "#,##0.00"},
                "totales": ["TOTALES", None, None, total_stock, None],
            }]

            buffer = crear_excel_reporte(
                nombre_reporte="Reporte de Materias Primas",
                usuario=ReporteController._usuario_autenticado(),
                filtros=ReporteController._filtros_resumen(filtros),
                estadisticas=[
                    ("Total de materiales", len(data)),
                    ("Stock total", total_stock),
                    ("Materiales sin stock", sin_stock),
                ],
                secciones=secciones,
            )
            return send_file(
                buffer,
                as_attachment=True,
                download_name=nombre_archivo_excel("Reporte de Materias Primas"),
                mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    # ==================================================================
    # REPORTE: HORAS TRABAJADAS
    # ==================================================================

    @staticmethod
    @rol_requerido("ROL-001")
    def listar_horas():
        filtros, error = ReporteController._leer_filtros({
            "empleado": ReporteController._validar_empleado,
            "mes": ReporteController._validar_mes,
            "anio": ReporteController._validar_anio,
        })
        if error:
            return jsonify({"status": "error", "message": error}), 400
        try:
            from app.services.reporte_service import ReporteService
            data = ReporteService.obtener_jornadas(
                es_admin=True,
                filtro_empleado=filtros["empleado"],
                filtro_mes=filtros["mes"],
                filtro_anio=filtros["anio"],
            )
            return jsonify({
                "status": "success",
                "data": data,
                "filtros": {k: v for k, v in filtros.items() if v}
            }), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @rol_requerido("ROL-001")
    def exportar_horas():
        filtros, error = ReporteController._leer_filtros({
            "empleado": ReporteController._validar_empleado,
            "mes": ReporteController._validar_mes,
            "anio": ReporteController._validar_anio,
        })
        if error:
            return jsonify({"status": "error", "message": error}), 400
        try:
            from app.services.reporte_service import ReporteService
            data = ReporteService.obtener_jornadas(
                es_admin=True,
                filtro_empleado=filtros["empleado"],
                filtro_mes=filtros["mes"],
                filtro_anio=filtros["anio"],
            )

            total_jornadas = len(data)
            total_horas = sum(j["horas"] for j in data)
            promedio = round(total_horas / total_jornadas, 2) if total_jornadas else 0
            en_curso = sum(1 for j in data if not j["hFin"])

            filas = [
                [
                    j["nombreEmpleado"],
                    j["fecha"],
                    (j["hInicio"] or "")[:5],
                    (j["hFin"] or "")[:5] or "---",
                    j["horas"],
                    "En curso" if not j["hFin"] else "Completada",
                ] for j in data
            ]

            secciones = [{
                "hoja": "Jornadas",
                "titulo": "Detalle de Jornadas Laborales",
                "encabezados": ["Empleado", "Fecha", "Entrada", "Salida", "Horas", "Estado"],
                "filas": filas,
                "ancho_columnas": [30, 14, 10, 10, 10, 12],
                "formatos": {2: "DD/MM/YYYY", 5: "0.00"},
                "totales": ["TOTALES", None, None, None, total_horas, None],
            }]

            buffer = crear_excel_reporte(
                nombre_reporte="Reporte de Horas Trabajadas",
                usuario=ReporteController._usuario_autenticado(),
                filtros=ReporteController._filtros_resumen(filtros),
                estadisticas=[
                    ("Total de horas", f"{total_horas:.2f} hrs"),
                    ("Total de jornadas", total_jornadas),
                    ("Promedio por jornada", f"{promedio:.2f} hrs"),
                    ("Jornadas en curso", en_curso),
                ],
                secciones=secciones,
            )
            return send_file(
                buffer,
                as_attachment=True,
                download_name=nombre_archivo_excel("Reporte de Horas Trabajadas"),
                mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    # ==================================================================
    # REPORTE: TRABAJOS MAS REALIZADOS
    # ==================================================================

    @staticmethod
    @rol_requerido("ROL-001")
    def listar_trabajos():
        filtros, error = ReporteController._leer_filtros({
            "empleado": ReporteController._validar_empleado,
            "mes": ReporteController._validar_mes,
            "anio": ReporteController._validar_anio,
            "estado": ReporteController._validar_estado_trabajos,
        })
        if error:
            return jsonify({"status": "error", "message": error}), 400
        try:
            from app.services.reporte_service import ReporteService
            asignaciones = ReporteService.obtener_asignaciones(
                filtro_empleado=filtros["empleado"],
                filtro_mes=filtros["mes"],
                filtro_anio=filtros["anio"],
                filtro_estado=filtros["estado"],
            )
            materiales = ReporteService.ranking_materiales(asignaciones)
            empleados = ReporteService.ranking_empleados(asignaciones)

            total_asignaciones = len(asignaciones)
            completadas = sum(1 for a in asignaciones if a.get("estado") == "Completada")
            en_proceso = sum(1 for a in asignaciones if a.get("estado") == "En proceso")
            pendientes = sum(1 for a in asignaciones if a.get("estado") == "Pendiente")

            return jsonify({
                "status": "success",
                "data": {
                    "asignaciones": asignaciones,
                    "rankingMateriales": materiales,
                    "rankingEmpleados": empleados,
                    "total": total_asignaciones,
                    "completadas": completadas,
                    "enProceso": en_proceso,
                    "pendientes": pendientes,
                },
                "filtros": {k: v for k, v in filtros.items() if v}
            }), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @rol_requerido("ROL-001")
    def exportar_trabajos():
        filtros, error = ReporteController._leer_filtros({
            "empleado": ReporteController._validar_empleado,
            "mes": ReporteController._validar_mes,
            "anio": ReporteController._validar_anio,
            "estado": ReporteController._validar_estado_trabajos,
        })
        if error:
            return jsonify({"status": "error", "message": error}), 400
        try:
            from app.services.reporte_service import ReporteService
            asignaciones = ReporteService.obtener_asignaciones(
                filtro_empleado=filtros["empleado"],
                filtro_mes=filtros["mes"],
                filtro_anio=filtros["anio"],
                filtro_estado=filtros["estado"],
            )
            materiales = ReporteService.ranking_materiales(asignaciones)
            empleados = ReporteService.ranking_empleados(asignaciones)

            total_asignaciones = len(asignaciones)
            completadas = sum(1 for a in asignaciones if a.get("estado") == "Completada")
            en_proceso = sum(1 for a in asignaciones if a.get("estado") == "En proceso")
            pendientes = sum(1 for a in asignaciones if a.get("estado") == "Pendiente")

            filas_materiales = [
                [idx, m["nombre"], m["count"], round(m["cantidad"], 2)]
                for idx, m in enumerate(materiales, start=1)
            ]
            filas_empleados = [
                [idx, e["nombre"], e["count"], e["completadas"]]
                for idx, e in enumerate(empleados, start=1)
            ]

            secciones = [
                {
                    "hoja": "Materiales Asignados",
                    "titulo": "Ranking de Materiales Mas Asignados",
                    "encabezados": ["#", "Material", "Asignaciones", "Cantidad Total"],
                    "filas": filas_materiales,
                    "ancho_columnas": [6, 38, 16, 16],
                    "formatos": {4: "#,##0.00"},
                },
                {
                    "hoja": "Empleados Activos",
                    "titulo": "Ranking de Empleados Mas Activos",
                    "encabezados": ["#", "Empleado", "Total Trabajos", "Completados"],
                    "filas": filas_empleados,
                    "ancho_columnas": [6, 35, 16, 14],
                },
            ]

            buffer = crear_excel_reporte(
                nombre_reporte="Reporte de Trabajos Mas Realizados",
                usuario=ReporteController._usuario_autenticado(),
                filtros=ReporteController._filtros_resumen(filtros),
                estadisticas=[
                    ("Total de asignaciones", total_asignaciones),
                    ("Completadas", completadas),
                    ("En proceso", en_proceso),
                    ("Pendientes", pendientes),
                ],
                secciones=secciones,
            )
            return send_file(
                buffer,
                as_attachment=True,
                download_name=nombre_archivo_excel("Reporte de Trabajos"),
                mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    # ==================================================================
    # REPORTE: PRODUCCION
    # ==================================================================

    @staticmethod
    @rol_requerido("ROL-001")
    def listar_produccion():
        filtros, error = ReporteController._leer_filtros({
            "cliente": lambda v: v or None,
            "mes": ReporteController._validar_mes,
            "anio": ReporteController._validar_anio,
            "estado": ReporteController._validar_estado_produccion,
        })
        if error:
            return jsonify({"status": "error", "message": error}), 400
        try:
            from app.services.reporte_service import ReporteService
            data = ReporteService.obtener_ordenes(
                filtro_cliente=filtros["cliente"],
                filtro_mes=filtros["mes"],
                filtro_anio=filtros["anio"],
                filtro_estado=filtros["estado"],
            )
            return jsonify({
                "status": "success",
                "data": data,
                "productos": ReporteService.ranking_productos(data),
                "filtros": {k: v for k, v in filtros.items() if v}
            }), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @rol_requerido("ROL-001")
    def exportar_produccion():
        filtros, error = ReporteController._leer_filtros({
            "cliente": lambda v: v or None,
            "mes": ReporteController._validar_mes,
            "anio": ReporteController._validar_anio,
            "estado": ReporteController._validar_estado_produccion,
        })
        if error:
            return jsonify({"status": "error", "message": error}), 400
        try:
            from app.services.reporte_service import ReporteService
            data = ReporteService.obtener_ordenes(
                filtro_cliente=filtros["cliente"],
                filtro_mes=filtros["mes"],
                filtro_anio=filtros["anio"],
                filtro_estado=filtros["estado"],
            )
            productos = ReporteService.ranking_productos(data)

            total_ordenes = len(data)
            total_unidades = sum(o["unidades"] for o in data)
            entregadas = sum(1 for o in data if o["estadoProd"] == "✔" or str(o["estadoProd"]).lower() == "entregado")
            en_proceso = sum(1 for o in data if o["estadoProd"] == ".." or str(o["estadoProd"]).lower() == "en proceso")
            canceladas = sum(1 for o in data if o["estadoProd"] == "✖" or str(o["estadoProd"]).lower() == "cancelado")
            total_clientes = len({o["nombreCliente"] for o in data if o["nombreCliente"]})

            filas_ordenes = [
                [
                    o["idOrden"],
                    o["nombreCliente"] or "---",
                    o["fechaPedido"],
                    ReporteController._nombre_estado_produccion(o["estadoProd"]),
                    len(o["detalles"]),
                    o["unidades"],
                ] for o in data
            ]
            filas_productos = [
                [idx, p["nombre"], p["unidades"], p["ordenes"]]
                for idx, p in enumerate(productos, start=1)
            ]

            secciones = [
                {
                    "hoja": "Ordenes",
                    "titulo": "Detalle de Ordenes de Produccion",
                    "encabezados": ["ID Orden", "Cliente", "Fecha Pedido", "Estado", "N° Productos", "Unidades"],
                    "filas": filas_ordenes,
                    "ancho_columnas": [12, 30, 14, 14, 14, 12],
                    "formatos": {3: "DD/MM/YYYY", 6: "#,##0"},
                    "totales": ["TOTALES", None, None, None, None, total_unidades],
                },
                {
                    "hoja": "Productos Fabricados",
                    "titulo": "Unidades Fabricadas por Producto",
                    "encabezados": ["#", "Producto", "Unidades", "N° Ordenes"],
                    "filas": filas_productos,
                    "ancho_columnas": [6, 38, 14, 14],
                    "formatos": {3: "#,##0"},
                },
            ]

            buffer = crear_excel_reporte(
                nombre_reporte="Reporte de Produccion",
                usuario=ReporteController._usuario_autenticado(),
                filtros=ReporteController._filtros_resumen(filtros),
                estadisticas=[
                    ("Total de unidades", total_unidades),
                    ("Total de ordenes", total_ordenes),
                    ("Entregadas", entregadas),
                    ("En proceso", en_proceso),
                    ("Canceladas", canceladas),
                    ("Clientes distintos", total_clientes),
                ],
                secciones=secciones,
            )
            return send_file(
                buffer,
                as_attachment=True,
                download_name=nombre_archivo_excel("Reporte de Produccion"),
                mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500