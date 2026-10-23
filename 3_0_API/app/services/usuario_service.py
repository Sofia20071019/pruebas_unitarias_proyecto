"""
ARCHIVO: usuario_service.py
PROPOSITO: Servicio de gestion de usuarios del sistema. Proporciona operaciones CRUD
           completas para administrar usuarios, incluyendo listado, creacion, actualizacion,
           eliminacion y desactivacion. Tambien maneja el cifrado de contrasenas
           y la generacion automatica de identificadores unicos.
"""

# Importacion de la instancia de base de datos y el generador de hashes de contrasenas
from app.database.database import db, bcrypt

# Importacion del modelo de usuario para interactuar con la tabla de usuarios
from app.models import Usuario

# Importacion de la funcion utilitaria para generar identificadores unicos
from app.utils.generar_id import generar_id


class UsuarioService:
    """Clase que concentra todos los servicios de gestion de usuarios."""

    @staticmethod
    def listar_todos():
        """
        Metodo estatico que obtiene todos los usuarios del sistema.
        
        Returns:
            list: Lista de todos los objetos Usuario ordenados por el primer nombre.
        """
        # Consultar todos los usuarios y ordenarlos alfabeticamente por primer nombre
        return Usuario.query.order_by(Usuario.pNombre).all()

    @staticmethod
    def listar_empleados():
        """
        Metodo estatico que obtiene solo los usuarios con rol de empleado (ROL-002).
        Utilizado para mostrar la lista de empleados disponibles en el sistema.
        
        Returns:
            list: Lista de usuarios con rol de empleado, ordenados por primer nombre.
        """
        # Filtrar usuarios que tengan el rol de empleado (ROL-002) y ordenarlos por nombre
        return Usuario.query.filter_by(idRol="ROL-002").order_by(Usuario.pNombre).all()

    @staticmethod
    def obtener_por_id(idUsuario):
        """
        Metodo estatico que busca un usuario por su identificador unico.
        
        Args:
            idUsuario (str): Identificador unico del usuario a buscar.
        
        Returns:
            Usuario: Objeto usuario si se encuentra, None si no existe.
        """
        # Buscar el usuario por su clave primaria
        return Usuario.query.get(idUsuario)

    @staticmethod
    def crear_usuario(pNombre, sNombre, pApellido, sApellido, correo, password, idRol):
        """
        Metodo estatico que crea un nuevo usuario en el sistema.
        Genera un ID unico automaticamente, cifra la contrasena con bcrypt
        y asigna el estado activo por defecto.
        
        Args:
            pNombre (str): Primer nombre del usuario.
            sNombre (str): Segundo nombre del usuario.
            pApellido (str): Primer apellido del usuario.
            sApellido (str): Segundo apellido del usuario.
            correo (str): Correo electronico del usuario (se normaliza a minusculas).
            password (str): Contrasena en texto plano que sera cifrada.
            idRol (str): Identificador del rol a asignar al usuario.
        
        Returns:
            Usuario: Objeto del usuario recien creado con todos sus atributos.
        """
        # Generar un nuevo ID unico con prefijo "USR" para el modelo Usuario
        nuevo_id = generar_id("USR", Usuario, "idUsuario")

        # Cifrar la contrasena usando bcrypt para almacenamiento seguro
        hash_pw = bcrypt.generate_password_hash(password).decode("utf-8")

        # Crear la instancia del nuevo usuario con todos sus atributos
        usuario = Usuario(
            idUsuario=nuevo_id,          # ID unico generado automaticamente
            pNombre=pNombre,             # Primer nombre proporcionado
            sNombre=sNombre,             # Segundo nombre proporcionado
            pApellido=pApellido,         # Primer apellido proporcionado
            sApellido=sApellido,         # Segundo apellido proporcionado
            correo=correo.lower().strip(),  # Correo normalizado a minusculas y sin espacios
            passwordHash=hash_pw,        # Hash de la contrasena generada con bcrypt
            idRol=idRol,                # Rol asignado al usuario
            idEstado="EST-001"           # Estado activo por defecto
        )

        # Agregar el nuevo usuario a la sesion de la base de datos
        db.session.add(usuario)

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar el usuario recien creado
        return usuario

    @staticmethod
    def actualizar_usuario(idUsuario, **kwargs):
        """
        Metodo estatico que actualiza los datos de un usuario existente.
        Permite actualizar campos individuales sin necesidad de enviar todos los datos.
        Si se proporciona una contrasena, se re-cifra automaticamente.
        
        Args:
            idUsuario (str): Identificador unico del usuario a actualizar.
            **kwargs: Argumentos opcionales con los campos a actualizar
                     (pNombre, sNombre, pApellido, sApellido, correo, password, idRol, idEstado).
        
        Returns:
            Usuario: Objeto usuario actualizado si se encontro, None si no existe.
        """
        # Buscar el usuario por su ID en la base de datos
        usuario = Usuario.query.get(idUsuario)

        # Si no se encuentra el usuario, retornar None
        if not usuario:
            return None

        # Si se proporciono una contrasena, cifrarla y actualizarla
        if "password" in kwargs and kwargs["password"]:
            usuario.passwordHash = bcrypt.generate_password_hash(kwargs["password"]).decode("utf-8")

        # Recorrer los campos permitidos para actualizacion y aplicar los cambios
        for key in ["pNombre", "sNombre", "pApellido", "sApellido", "correo", "idRol", "idEstado"]:
            # Solo actualizar si el campo fue proporcionado y tiene valor
            if key in kwargs and kwargs[key] is not None:
                setattr(usuario, key, kwargs[key])

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar el usuario actualizado
        return usuario

    @staticmethod
    def eliminar_usuario(idUsuario):
        """
        Metodo estatico que elimina permanentemente un usuario de la base de datos.
        
        Args:
            idUsuario (str): Identificador unico del usuario a eliminar.
        
        Returns:
            Usuario: Objeto usuario eliminado si existia, None si no se encontro.
        """
        # Buscar el usuario por su ID en la base de datos
        usuario = Usuario.query.get(idUsuario)

        # Si no se encuentra el usuario, retornar None
        if not usuario:
            return None

        # Eliminar el usuario de la sesion de la base de datos
        db.session.delete(usuario)

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar el usuario que fue eliminado
        return usuario

    @staticmethod
    def desactivar_usuario(idUsuario):
        """
        Metodo estatico que desactiva un usuario cambiando su estado a inactivo (EST-002).
        A diferencia de eliminar, este metodo conserva el registro en la base de datos
        pero lo marca como no activo para que no pueda iniciar sesion.
        
        Args:
            idUsuario (str): Identificador unico del usuario a desactivar.
        
        Returns:
            Usuario: Objeto usuario desactivado si existia, None si no se encontro.
        """
        # Buscar el usuario por su ID en la base de datos
        usuario = Usuario.query.get(idUsuario)

        # Si no se encuentra el usuario, retornar None
        if not usuario:
            return None

        # Cambiar el estado del usuario a inactivo (EST-002)
        usuario.idEstado = "EST-002"

        # Confirmar los cambios en la base de datos
        db.session.commit()

        # Retornar el usuario desactivado
        return usuario
    
    @staticmethod
    def activar_usuario(idUsuario):
        """
        Método estático que reactiva un usuario cambiando su estado a activo (EST-001).
        """
        usuario = Usuario.query.get(idUsuario)
        if not usuario:
            return None

        usuario.idEstado = "EST-001"
        db.session.commit()
        return usuario
    
