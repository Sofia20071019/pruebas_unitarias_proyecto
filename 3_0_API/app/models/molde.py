"""
ARCHIVO: app/models/molde.py
PROPOSITO: Modelos SQLAlchemy para la gestion de categorias de moldes,
           moldes principales e imagenes organizadas por tallas (5XS a 5XL).
"""
from app.database.database import db

class CategoriaMolde(db.Model):
    __tablename__ = "categoria_molde"

    idCategoriaMolde = db.Column(db.String(10), primary_key=True)
    nombreCategoria = db.Column(db.String(100), nullable=False)

    moldes = db.relationship("Molde", back_populates="categoria", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "idCategoriaMolde": self.idCategoriaMolde,
            "nombreCategoria": self.nombreCategoria
        }


class Molde(db.Model):
    __tablename__ = "molde"

    idMolde = db.Column(db.String(10), primary_key=True)
    nombreMolde = db.Column(db.String(150), nullable=False)
    descripcion = db.Column(db.Text)
    indicaciones = db.Column(db.Text)
    genero = db.Column(db.Enum('hombre', 'mujer', 'niño', 'niña', 'unisex', name='genero_enum'), nullable=False, default='unisex')
    idCategoriaMolde = db.Column(db.String(10), db.ForeignKey("categoria_molde.idCategoriaMolde", onupdate="CASCADE"), nullable=False)

    categoria = db.relationship("CategoriaMolde", back_populates="moldes")
    imagenes_tallas = db.relationship("MoldeTallaImagen", back_populates="molde", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "idMolde": self.idMolde,
            "nombreMolde": self.nombreMolde,
            "descripcion": self.descripcion,
            "indicaciones": self.indicaciones,
            "genero": self.genero,
            "idCategoriaMolde": self.idCategoriaMolde,
            "categoria": self.categoria.nombreCategoria if self.categoria else None,
            "tallas": [t.to_dict() for t in self.imagenes_tallas]
        }


class MoldeTallaImagen(db.Model):
    __tablename__ = "molde_talla_imagen"

    idMoldeTalla = db.Column(db.String(10), primary_key=True)
    idMolde = db.Column(db.String(10), db.ForeignKey("molde.idMolde", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    talla = db.Column(db.String(10), nullable=False)
    imagenUrl = db.Column(db.Text, nullable=False)

    molde = db.relationship("Molde", back_populates="imagenes_tallas")

    def to_dict(self):
        return {
            "idMoldeTalla": self.idMoldeTalla,
            "talla": self.talla,
            "imagenUrl": self.imagenUrl
        }