"""
ARCHIVO: rol_service.py
PROPOSITO: Servicio de gestion de roles del sistema.
           Permite listar todos los roles existentes y crear nuevos roles
           que definen los niveles de acceso y permisos de los usuarios
           dentro de la aplicacion.
"""

# Importacion de la instancia de base de datos para operaciones de persistencia
from app.database.database import db

# Importacion del modelo Rol para interactuar con la tabla de roles
from app.models import Rol

# Importacion de la funcion utilitaria para generar identificadores unicos
from app.utils.generar_id import generar_id


class RolService:
    """Clase que concentra los servicios de gestion de roles."""

    @staticmethod
    def listar_todos():
        """
        Metodo estatico que obtiene todos los roles registrados en el sistema.
        
        Returns:
            list: Lista de todos los objetos Rol existentes en la base de datos.
        """
        # Consultar y retornar todos los roles de la tabla
        return Rol.query.all()

    @staticmethod
    def crear_rol(nombreRol):
        """
        Metodo estatico que registra un nuevo rol en el sistema.
        Genera automaticamente un ID unico con prefijo "ROL" y convierte
        el nombre del rol a mayusculas para consistencia.
        
        Args:
            nombreRol (str): Nombre del rol a crear (ej: Administrador, Empleado).
        
        Returns:
            Rol: Objeto del rol recien creado con su ID asignado.
        """
        # Generar un nuevo ID unico con prefijo "ROL" para el modelo Rol
        nuevo_id = generar_id("ROL", Rol, "idRol")

        # Crear la instancia del nuevo rol con el ID generado y el nombre en mayusculas
        rol = Rol(idRol=nuevo_id, nombreRol=nombreRol.upper())

        # Agregar el nuevo rol a la sesion de la base de datos
        db.session.add(rol)

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar el rol recien creado
        return rol
