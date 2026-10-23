"""
ARCHIVO: __init__.py
PROPOSITO: Inicializa el paquete de modelos de la aplicacion. Importa todas las clases de modelos
           desde sus respectivos modulos y las expone como parte del paquete 'app.models'.
           Esto permite importar todos los modelos desde un solo punto de entrada
           (por ejemplo: from app.models import Usuario, Rol, etc.) sin necesidad de
           conocer la estructura interna del paquete.
"""

# Importa el modelo Rol desde el modulo rol.py - Define los roles del sistema (admin, empleado, etc.)
from app.models.rol import Rol

# Importa el modelo EstadoUsuario desde el modulo estado_usuario.py - Define los estados posibles de un usuario (activo, inactivo, etc.)
from app.models.estado_usuario import EstadoUsuario

# Importa el modelo Usuario desde el modulo usuario.py - Representa a los usuarios del sistema con sus datos personales y credenciales
from app.models.usuario import Usuario

# Importa el modelo Categoria desde el modulo categoria.py - Define las categorias de insumos (telas, botones, hilos, etc.)
from app.models.categoria import Categoria

# Importa el modelo UnidadMedida desde el modulo unidad_medida.py - Define las unidades de medida para los insumos (metros, kilogramos, unidades, etc.)
from app.models.unidad_medida import UnidadMedida

# Importa el modelo Insumo desde el modulo insumo.py - Representa los insumos o materias primas utilizados en la produccion
from app.models.insumo import Insumo

# Importa el modelo Producto desde el modulo producto.py - Representa los productos finales que se fabrican en la empresa
from app.models.producto import Producto

# Importa el modelo FichaTecnica desde el modulo ficha_tecnica.py - Define la composicion de cada producto en terminos de insumos y cantidades necesarias
from app.models.ficha_tecnica import FichaTecnica

# Importa el modelo Cliente desde el modulo cliente.py - Representa a los clientes que realizan pedidos a la empresa
from app.models.cliente import Cliente

# Importa el modelo OrdenProduccion desde el modulo orden_produccion.py - Representa las ordenes de produccion solicitadas por los clientes
from app.models.orden_produccion import OrdenProduccion

# Importa el modelo DetalleOrden desde el modulo detalle_orden.py - Define los detalles (productos y cantidades) de cada orden de produccion
from app.models.detalle_orden import DetalleOrden

# Importa el modelo MetodoPago desde el modulo metodo_pago.py - Define los metodos de pago aceptados (efectivo, transferencia, etc.)
from app.models.metodo_pago import MetodoPago

# Importa el modelo JornadaLaboral desde el modulo jornada_laboral.py - Registra las jornadas laborales de los empleados (fecha, hora inicio y fin)
from app.models.jornada_laboral import JornadaLaboral

# Importa el modelo Pago desde el modulo pago.py - Registra los pagos realizados a los empleados por sus jornadas laborales
from app.models.pago import Pago

# Importa el modelo Asignacion desde el modulo asignacion.py - Registra la asignacion de insumos a empleados para su uso en produccion
from app.models.asignacion import Asignacion
