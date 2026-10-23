"""
ARCHIVO: generar_id.py

PROPOSITO: Genera identificadores unicos secuenciales para los registros de la base
de datos. Cada ID sigue un formato prefijo-numero incremental (por ejemplo: USU-001,
CLI-003, PRO-012). La funcion consulta el ultimo registro existente en la tabla
correspondiente, extrae su numero secuencial, le suma uno y retorna el nuevo ID
con el formato adecuado. Esto garantiza que cada nuevo registro tenga un ID unico
y ordenado de forma secuencial dentro de su categoria.
"""

# Importa la instancia de la base de datos desde el modulo de configuracion de database
# db permite ejecutar consultas SQLAlchemy como session.query() para interactuar con las tablas
from app.database.database import db


def generar_id(prefijo, modelo, columna_pk):
    """
    Genera un identificador unico secuencial para un registro en la base de datos.
    Consulta el ultimo registro de la tabla ordenado por la columna PK de forma
    descendente, extrae el numero secuencial y le suma uno para generar el siguiente.

    Parametros:
        prefijo (str): Prefijo categorico del ID (ej: 'USU' para usuarios,
                       'CLI' para clientes, 'PRO' para productos).
        modelo (SQLAlchemy model): El modelo de SQLAlchemy que representa la tabla
                                    de la cual se obtendra el ultimo registro.
        columna_pk (str): Nombre de la columna que contiene la clave primaria
                          en la tabla representada por el modelo.

    Retorna:
        str: Un string con el formato 'prefijo-NNN' donde NNN es el numero
             secuencial incrementado con ceros a la izquierda (minimo 3 digitos).
    """
    # Consulta la base de datos para obtener el ultimo registro de la tabla
    # order_by con .desc() ordena de mayor a menor por la columna PK
    # .first() retorna solo el primer resultado (el registro con el numero mas alto)
    ultimo = db.session.query(modelo).order_by(modelo.__table__.c[columna_pk].desc()).first()

    # Verifica si existe algun registro previo en la tabla
    if ultimo:
        # Si ya existen registros, obtiene el valor de la PK del ultimo registro
        # getattr(ultimo, columna_pk) accede dinamicamente al atributo del modelo
        # .split("-")[1] separa el ID por el guion y obtiene la parte numerica (ej: de "USU-003" obtiene "003")
        # int() convierte la cadena numerica a entero y se suma 1 para el siguiente ID
        num = int(getattr(ultimo, columna_pk).split("-")[1]) + 1
    else:
        # Si la tabla esta vacia (no hay registros previos), inicia la secuencia en 1
        num = 1

    # Retorna el nuevo ID formateado con f-string:
    # - prefijo: la categoria del registro (ej: "USU")
    # - num:03d: el numero formateado con minimamente 3 digitos, rellenando con ceros
    #   a la izquierda (ej: 1 se convierte en "001", 12 se convierte en "012")
    return f"{prefijo}-{num:03d}"
