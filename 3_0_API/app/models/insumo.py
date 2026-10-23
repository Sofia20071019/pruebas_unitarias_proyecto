"""
ARCHIVO: insumo.py
PROPOSITO: Define el modelo de base de datos para la tabla 'insumo'. Representa los insumos o
           materias primas utilizados en el proceso de produccion de la empresa. Cada insumo
           tiene un nombre, pertenece a una categoria, se mide en una unidad de medida especifica
           y lleva un registro de su cantidad disponible en inventario. Este modelo establece
           relaciones con categorias, unidades de medida, fichas tecnicas (donde se usa como
           materia prima) y asignaciones (insumos asignados a empleados).
"""

# Importa el objeto 'db' (instancia de SQLAlchemy) desde el modulo de configuracion de base de datos
# Se utiliza para definir columnas, relaciones y como clase base para los modelos
from app.database.database import db

# Define el modelo Insumo que hereda de db.Model, registrandolo como modelo de SQLAlchemy
class Insumo(db.Model):
    # Nombre de la tabla en la base de datos donde se almacenan los registros de insumos
    __tablename__ = "insumo"

    # Campo clave primaria: identificador unico del insumo, cadena de hasta 10 caracteres
    idInsumo = db.Column(db.String(10), primary_key=True)

    # Nombre descriptivo del insumo, cadena de texto de upto 100 caracteres, puede ser nulo
    # Ejemplo: 'Tela Algodon', 'Hilo Rojo', ' boton Negro'
    nombreInsumo = db.Column(db.String(100))

    # Clave foranea que referencia a la categoria del insumo en la tabla 'categoria'
    # Permite agrupar insumos por categorias (telas, botones, hilos, etc.)
    idCategoria = db.Column(db.String(10), db.ForeignKey("categoria.idCategoria"))

    # Clave foranea que referencia a la unidad de medida del insumo en la tabla 'unidad_medida'
    # Define como se mide el insumo (metros, kilogramos, unidades, etc.)
    idUnidad = db.Column(db.String(10), db.ForeignKey("unidad_medida.idUnidad"))

    # Cantidad disponible del insumo en inventario, numero decimal con 10 digitos totales y 2 decimales
    # Valor por defecto es 0 cuando se crea un nuevo insumo
    cantidad = db.Column(db.Numeric(10, 2), default=0)

    # Relacion con el modelo Categoria: accede a la categoria a la que pertenece este insumo
    # back_populates="insumos" permite acceder desde Categoria a todos sus insumos
    categoria = db.relationship("Categoria", back_populates="insumos")

    # Relacion con el modelo UnidadMedida: accede a la unidad de medida de este insumo
    # back_populates="insumos" permite acceder desde UnidadMedida a todos los insumos que usan esa unidad
    unidad = db.relationship("UnidadMedida", back_populates="insumos")

    # Relacion con el modelo FichaTecnica: permite acceder a todas las fichas tecnicas donde se usa este insumo
    # Indica en que productos se utiliza este insumo y en que cantidades
    # back_populates="insumo" permite acceder desde FichaTecnica al insumo referenciado
    fichas_tecnicas = db.relationship("FichaTecnica", back_populates="insumo")

    # Relacion con el modelo Asignacion: permite acceder a todas las asignaciones de este insumo a empleados
    # Registra cuando y a que empleado se le asigno este insumo para su uso
    # back_populates="insumo" permite acceder desde Asignacion al insumo asignado
    asignaciones = db.relationship("Asignacion", back_populates="insumo")
