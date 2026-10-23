"""
ARCHIVO: cliente_controller.py
PROPOSITO: Controlador de clientes encargado de gestionar las operaciones
           CRUD relacionadas con los clientes del sistema. Permite listar
           todos los clientes y crear nuevos clientes. No requiere
           autenticación para acceder a los endpoints.
"""

# Importación de 'request' para acceder a los datos de la petición HTTP entrante
from flask import request
# Importación de 'jsonify' para construir respuestas HTTP en formato JSON
from flask import jsonify


class ClienteController:
    """
    Clase controladora que agrupa los métodos estáticos para la gestión
    de clientes del sistema.
    """

    @staticmethod
    def listar_clientes():
        """
        Endpoint para listar todos los clientes registrados en el sistema.
        No requiere autenticación.
        Retorna una lista con el ID, nombre y teléfono de cada cliente.
        """
        try:
            # Importación diferida del servicio de clientes para evitar dependencias circulares
            from app.services.cliente_service import ClienteService
            # Obtener todos los clientes registrados en la base de datos
            clientes = ClienteService.listar_todos()
            # Construir lista de diccionarios con los datos de cada cliente
            data = [{"idCliente": c.idCliente, "nombreCliente": c.nombreCliente, "telefono": c.telefono} for c in clientes]
            # Retornar respuesta exitosa con la lista de clientes
            return jsonify({"status": "success", "data": data}), 200
        except Exception as e:
            # Capturar excepciones y retornar error 500
            return jsonify({"status": "error", "message": str(e)}), 500

    @staticmethod
    def crear_cliente():
        """
        Endpoint para crear un nuevo cliente en el sistema.
        No requiere autenticación.
        Recibe el nombre y teléfono del cliente en el cuerpo JSON.
        Retorna el ID del cliente creado con código 201.
        """
        # Obtener el cuerpo de la petición HTTP en formato JSON
        data = request.get_json()
        try:
            # Importación diferida del servicio de clientes
            from app.services.cliente_service import ClienteService
            # Crear el cliente con los datos recibidos del JSON
            c = ClienteService.crear_cliente(data.get("nombreCliente"), telefono=data.get("telefono"))
            # Retornar respuesta exitosa con el ID del cliente creado (código 201 = Created)
            return jsonify({"status": "success", "data": {"idCliente": c.idCliente}}), 201
        except Exception as e:
            # Capturar excepciones y retornar error 400 (solicitud incorrecta)
            return jsonify({"status": "error", "message": str(e)}), 400
