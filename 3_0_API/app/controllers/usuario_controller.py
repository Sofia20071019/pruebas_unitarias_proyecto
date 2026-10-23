"""
ARCHIVO: usuario_controller.py
PROPOSITO: Controlador de usuarios encargado de gestionar todas las operaciones
           CRUD (Crear, Leer, Actualizar, Eliminar) relacionadas con los usuarios
           del sistema. Permite listar, crear, obtener, actualizar, eliminar,
           desactivar usuarios y listar empleados. Incluye controles de acceso
           basados en roles para operaciones administrativas.
"""

# Importación de 'request' para acceder a los datos de la petición HTTP entrante
from flask import request
# Importación de 'jsonify' para construir respuestas HTTP en formato JSON
from flask import jsonify
# Importación de decoradores para control de acceso: token JWT y roles
from app.utils.decorators import token_requerido, rol_requerido


class UsuarioController:
    """
    Clase controladora que agrupa los métodos estáticos para la gestión
    completa de usuarios del sistema, incluyendo operaciones administrativas
    y de consulta.
    """

    @staticmethod
    @rol_requerido("ROL-001")
    def listar_usuarios():
        """
        Endpoint para listar todos los usuarios del sistema.
        Requiere rol de administrador (ROL-001).
        Retorna una lista con la información completa de cada usuario
        incluyendo nombre, correo, rol y estado.
        """
        try:
            # Importación diferida del servicio de usuarios para evitar dependencias circulares
            from app.services.usuario_service import UsuarioService
            # Obtener todos los usuarios registrados en la base de datos
            usuarios = UsuarioService.listar_todos()
            # Lista para almacenar los datos formateados de cada usuario
            data = []
            # Iterar sobre cada usuario para construir la respuesta
            for u in usuarios:
                # Construir el nombre completo combinando primer y segundo nombre
                pNombreCompleto = f"{u.pNombre or ''} {u.sNombre or ''}".strip()
                # Construir los apellidos completos combinando primer y segundo apellido
                pApellidoCompleto = f"{u.pApellido or ''} {u.sApellido or ''}".strip()
                # Concatenar nombres y apellidos para el nombre completo
                nombreCompleto = f"{pNombreCompleto} {pApellidoCompleto}".strip()
                # Agregar el diccionario con los datos del usuario a la lista
                data.append({
                    "idUsuario": u.idUsuario,
                    "nombre": nombreCompleto,
                    "pNombre": u.pNombre,
                    "sNombre": u.sNombre,
                    "pApellido": u.pApellido,
                    "sApellido": u.sApellido,
                    "correo": u.correo,
                    "idRol": u.idRol,
                    "rol": u.rol.nombreRol if u.rol else None,
                    "idEstado": u.idEstado,
                    "estado": u.estado.nombreEstado if u.estado else None
                })
            # Retornar respuesta exitosa con la lista de usuarios
            return jsonify({"status": "success", "data": data}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 500 con el mensaje de error
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @rol_requerido("ROL-001")
    def crear_usuario():
        """
        Endpoint para crear un nuevo usuario en el sistema.
        Requiere rol de administrador (ROL-001).
        Recibe los datos del usuario en el cuerpo de la petición JSON
        y retorna los datos básicos del usuario creado con código 201.
        """
        # Obtener el cuerpo de la petición HTTP en formato JSON
        data = request.get_json()
        try:
            # Importación diferida del servicio de usuarios
            from app.services.usuario_service import UsuarioService
            # Llamar al servicio para crear el usuario con los datos recibidos
            usuario = UsuarioService.crear_usuario(
                pNombre=data.get("pNombre"),
                sNombre=data.get("sNombre"),
                pApellido=data.get("pApellido"),
                sApellido=data.get("sApellido"),
                correo=data.get("correo"),
                password=data.get("password"),
                idRol=data.get("idRol")
            )
            # Retornar respuesta exitosa con los datos del usuario creado (código 201 = Created)
            return jsonify({
                "status": "success",
                "data": {
                    "idUsuario": usuario.idUsuario,
                    "nombre": f"{usuario.pNombre} {usuario.pApellido}",
                    "correo": usuario.correo
                }
            }), 201
        except Exception as e:
            # Capturar excepciones y retornar error 400 (solicitud incorrecta)
            return jsonify({"status": "error", "message": str(e)}), 400

    @staticmethod
    @token_requerido
    def obtener_usuario(idUsuario):
        """
        Endpoint para obtener los detalles de un usuario específico por su ID.
        Requiere autenticación válida (token JWT).
        Retorna la información completa del usuario encontrado o error 404
        si no existe.
        """
        try:
            # Importación diferida del servicio de usuarios
            from app.services.usuario_service import UsuarioService
            # Buscar el usuario por su ID en la base de datos
            usuario = UsuarioService.obtener_por_id(idUsuario)
            # Si no se encontró el usuario, retornar error 404
            if not usuario:
                return jsonify({"status": "error", "message": "Usuario no encontrado"}), 404
            # Retornar respuesta exitosa con los datos completos del usuario
            return jsonify({
                "status": "success",
                "data": {
                    "idUsuario": usuario.idUsuario,
                    "pNombre": usuario.pNombre,
                    "sNombre": usuario.sNombre,
                    "pApellido": usuario.pApellido,
                    "sApellido": usuario.sApellido,
                    "correo": usuario.correo,
                    "idRol": usuario.idRol,
                    "rol": usuario.rol.nombreRol if usuario.rol else None,
                    "idEstado": usuario.idEstado,
                    "estado": usuario.estado.nombreEstado if usuario.estado else None
                }
            }), 200
        except Exception as e:
            # Capturar excepciones y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    @rol_requerido("ROL-001")
    def actualizar_usuario(idUsuario):
        """
        Endpoint para actualizar los datos de un usuario existente.
        Requiere rol de administrador (ROL-001).
        Recibe los campos a actualizar en el cuerpo JSON y los aplica
        al usuario identificado por idUsuario.
        """
        # Obtener el cuerpo de la petición HTTP en formato JSON
        data = request.get_json()
        try:
            # Importación diferida del servicio de usuarios
            from app.services.usuario_service import UsuarioService
            # Llamar al servicio para actualizar el usuario con los datos recibidos
            # Se desempaqueta el diccionario **data para pasar cada campo como argumento
            usuario = UsuarioService.actualizar_usuario(idUsuario, **data)
            # Si el usuario no fue encontrado, retornar error 404
            if not usuario:
                return jsonify({"status": "error", "message": "Usuario no encontrado"}), 404
            # Retornar mensaje de éxito si la actualización fue correcta
            return jsonify({"status": "success", "message": "Usuario actualizado"}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 400
            return jsonify({"status": "error", "message": str(e)}), 400

    @staticmethod
    @rol_requerido("ROL-001")
    def eliminar_usuario(idUsuario):
        """
        Endpoint para eliminar un usuario del sistema por su ID.
        Requiere rol de administrador (ROL-001).
        Retorna mensaje de éxito o error si el usuario no existe.
        """
        try:
            # Importación diferida del servicio de usuarios
            from app.services.usuario_service import UsuarioService
            # Llamar al servicio para eliminar el usuario por su ID
            usuario = UsuarioService.eliminar_usuario(idUsuario)
            # Si el usuario no fue encontrado, retornar error 404
            if not usuario:
                return jsonify({"status": "error", "message": "Usuario no encontrado"}), 404
            # Retornar mensaje de éxito tras la eliminación
            return jsonify({"status": "success", "message": "Usuario eliminado"}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 400
            return jsonify({"status": "error", "message": str(e)}), 400

    @staticmethod
    @rol_requerido("ROL-001")
    def desactivar_usuario(idUsuario):
        """
        Endpoint para desactivar un usuario sin eliminarlo del sistema.
        Requiere rol de administrador (ROL-001).
        Cambia el estado del usuario a inactivo manteniendo su registro.
        """
        try:
            # Importación diferida del servicio de usuarios
            from app.services.usuario_service import UsuarioService
            # Llamar al servicio para desactivar el usuario por su ID
            usuario = UsuarioService.desactivar_usuario(idUsuario)
            # Si el usuario no fue encontrado, retornar error 404
            if not usuario:
                return jsonify({"status": "error", "message": "Usuario no encontrado"}), 404
            # Retornar mensaje de éxito tras la desactivación
            return jsonify({"status": "success", "message": "Usuario desactivado"}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 400
            return jsonify({"status": "error", "message": str(e)}), 400
        
    @staticmethod
    @rol_requerido("ROL-001")
    def activar_usuario(idUsuario):
        """
        Endpoint para activar un usuario previamente desactivado.
        Requiere rol de administrador (ROL-001).
        """
        try:
            from app.services.usuario_service import UsuarioService
            usuario = UsuarioService.activar_usuario(idUsuario)
            if not usuario:
                return jsonify({"status": "error", "message": "Usuario no encontrado"}), 404
            return jsonify({"status": "success", "message": "Usuario activado correctamente"}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 400
        
    @staticmethod
    @token_requerido
    def listar_empleados():
        """
        Endpoint para listar todos los usuarios que son empleados.
        Requiere autenticación válida (token JWT).
        Retorna una lista simplificada con información de empleados
        incluyendo nombre, correo y estado.
        """
        try:
            # Importación diferida del servicio de usuarios
            from app.services.usuario_service import UsuarioService
            # Obtener solo los usuarios que tienen rol de empleado
            empleados = UsuarioService.listar_empleados()
            # Lista para almacenar los datos formateados de cada empleado
            data = []
            # Iterar sobre cada empleado para construir la respuesta
            for u in empleados:
                # Construir el nombre completo combinando primer y segundo nombre
                pNombreCompleto = f"{u.pNombre or ''} {u.sNombre or ''}".strip()
                # Construir los apellidos completos combinando primer y segundo apellido
                pApellidoCompleto = f"{u.pApellido or ''} {u.sApellido or ''}".strip()
                # Concatenar nombres y apellidos para el nombre completo
                nombreCompleto = f"{pNombreCompleto} {pApellidoCompleto}".strip()
                # Agregar los datos del empleado a la lista de respuesta
                data.append({
                    "idUsuario": u.idUsuario,
                    "nombre": nombreCompleto,
                    "correo": u.correo,
                    "idEstado": u.idEstado,
                    "estado": u.estado.nombreEstado if u.estado else None
                })
            # Retornar respuesta exitosa con la lista de empleados
            return jsonify({"status": "success", "data": data}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500
