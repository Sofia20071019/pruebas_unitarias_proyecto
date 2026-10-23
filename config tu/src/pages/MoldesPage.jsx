import React, { useState, useEffect } from 'react';
import { api } from '../api';

const TALLAS_DISPONIBLES = [
  '5XS', '4XS', '3XS', '2XS', 'XS', 
  'S', 'M', 'L', 'XL', 
  '2XL', '3XL', '4XL', '5XL'
];

const sanitizarTexto = (valor) => {
  return valor.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s,.]/g, '');
};

export default function MoldesPage() {
  const [esAdmin, setEsAdmin] = useState(false);
  const [moldes, setMoldes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [generoFiltro, setGeneroFiltro] = useState('todos');

  // Control Formulario Molde
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idMoldeEditar, setIdMoldeEditar] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [subiendoTalla, setSubiendoTalla] = useState(null);

  // Control Formulario Categoría
  const [mostrarGestionCategorias, setMostrarGestionCategorias] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  const [formMolde, setFormMolde] = useState({
    nombreMolde: '',
    idCategoriaMolde: '',
    genero: 'unisex',
    descripcion: '',
    indicaciones: '',
    tallas: []
  });

  useEffect(() => {
    try {
      const sesion = localStorage.getItem('usuarioLogueado');
      if (sesion) {
        const usuario = JSON.parse(sesion);
        if (usuario.idRol === 'ROL-001') {
          setEsAdmin(true);
        }
      }
    } catch {
      setEsAdmin(false);
    }
    cargarCategorias();
  }, []);

  useEffect(() => {
    cargarMoldes();
  }, [busqueda, categoriaFiltro, generoFiltro]);

  const cargarCategorias = async () => {
    try {
      const res = await api.moldes.listarCategorias();
      setCategorias(res.data || []);
    } catch (err) {
      console.error('Error al cargar categorías', err);
    }
  };

  const cargarMoldes = async () => {
    setCargando(true);
    try {
      const res = await api.moldes.listar({
        nombre: busqueda,
        categoria: categoriaFiltro,
        genero: generoFiltro
      });
      setMoldes(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // --- GESTIÓN DE CATEGORÍAS ---
  const handleCrearCategoria = async (e) => {
    e.preventDefault();
    const nombreLimpio = nuevaCategoria.trim();
    if (!nombreLimpio) return;

    try {
      await api.moldes.crearCategoria({ nombreCategoria: nombreLimpio });
      setNuevaCategoria('');
      cargarCategorias();
      alert('Categoría creada correctamente.');
    } catch (err) {
      alert('Error al crear categoría: ' + err.message);
    }
  };

  const handleEliminarCategoria = async (idCategoriaMolde) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta categoría?')) return;
    try {
      await api.moldes.eliminarCategoria(idCategoriaMolde);
      cargarCategorias();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // --- GESTIÓN DE SUBIDA DE IMÁGENES ---
  const handleArchivoSeleccionado = async (tallaNombre, e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    setSubiendoTalla(tallaNombre);
    try {
      const res = await api.moldes.subirImagen(archivo);
      const urlFinal = res.data.url;

      setFormMolde(prev => {
        const tallasActuales = [...prev.tallas];
        const index = tallasActuales.findIndex(t => t.talla === tallaNombre);

        if (index !== -1) {
          tallasActuales[index].imagenUrl = urlFinal;
        } else {
          tallasActuales.push({ talla: tallaNombre, imagenUrl: urlFinal });
        }
        return { ...prev, tallas: tallasActuales };
      });
    } catch (err) {
      alert(`Error al subir la imagen para la talla ${tallaNombre}: ${err.message}`);
    } finally {
      setSubiendoTalla(null);
    }
  };

  const handleEliminarImagenTalla = (tallaNombre) => {
    setFormMolde(prev => ({
      ...prev,
      tallas: prev.tallas.filter(t => t.talla !== tallaNombre)
    }));
  };

  // --- GESTIÓN DE MOLDES ---
  const resetFormulario = () => {
    setFormMolde({
      nombreMolde: '',
      idCategoriaMolde: categorias[0]?.idCategoriaMolde || '',
      genero: 'unisex',
      descripcion: '',
      indicaciones: '',
      tallas: []
    });
    setModoEdicion(false);
    setIdMoldeEditar(null);
    setMostrarFormulario(false);
  };

  const iniciarEdicion = (molde) => {
    setModoEdicion(true);
    setIdMoldeEditar(molde.idMolde);
    setFormMolde({
      nombreMolde: molde.nombreMolde,
      idCategoriaMolde: molde.idCategoriaMolde,
      genero: molde.genero,
      descripcion: molde.descripcion || '',
      indicaciones: molde.indicaciones || '',
      tallas: molde.tallas || []
    });
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (idMolde) => {
    if (!window.confirm('¿Seguro que deseas eliminar este molde?')) return;
    try {
      await api.moldes.eliminar(idMolde);
      cargarMoldes();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicion) {
        await api.moldes.actualizar(idMoldeEditar, formMolde);
      } else {
        await api.moldes.crear(formMolde);
      }
      resetFormulario();
      cargarMoldes();
    } catch (err) {
      alert('Error al guardar el molde: ' + err.message);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="toolbar">
        <h1 className="table-title">Catálogo y Trazabilidad de Moldes</h1>
        <p className="font-size-md text-secondary">
          Patrones, indicaciones y archivos técnicos por talla (5XS a 5XL).
        </p>
      </div>

      {/* PANEL DE FILTROS Y ACCIONES */}
      <div className="panel-gestion margin-b-35">
        <div className="filters-grid">
          <div className="filter-cell">
            <label htmlFor="busqueda">Buscar molde:</label>
            <input
              id="busqueda"
              type="text"
              placeholder="Ej: Camiseta, Sudadera..."
              value={busqueda}
              onChange={(e) => setBusqueda(sanitizarTexto(e.target.value))}
            />
          </div>

          <div className="filter-cell">
            <label htmlFor="filtro-categoria">Categoría:</label>
            <select
              id="filtro-categoria"
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
            >
              <option value="todos">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.idCategoriaMolde} value={cat.idCategoriaMolde}>
                  {cat.nombreCategoria}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-cell">
            <label htmlFor="filtro-genero">Género / Tipo:</label>
            <select
              id="filtro-genero"
              value={generoFiltro}
              onChange={(e) => setGeneroFiltro(e.target.value)}
            >
              <option value="todos">Todos los géneros</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              <option value="niño">Niño</option>
              <option value="niña">Niña</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>

          {esAdmin && (
            <div className="filter-cell filter-cell-btn">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-login"
                  onClick={() => setMostrarGestionCategorias(!mostrarGestionCategorias)}
                >
                  {mostrarGestionCategorias ? 'Cerrar Categorías' : '⚙ Categorías'}
                </button>
                <button
                  type="button"
                  className="btn-submit"
                  onClick={() => setMostrarFormulario(!mostrarFormulario)}
                >
                  {mostrarFormulario ? 'Cerrar Formulario' : '+ Nuevo Molde'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADMINISTRACIÓN DE CATEGORÍAS */}
      {esAdmin && mostrarGestionCategorias && (
        <div className="panel-registro margin-b-35">
          <div className="w-100">
            <h2 className="form-title">Administración de Categorías</h2>
            <form onSubmit={handleCrearCategoria} className="input-row">
              <div className="input-cell">
                <label>Nombre de la Categoría (letras, números, comas y puntos)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sudadera gym, Piyama..."
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(sanitizarTexto(e.target.value))}
                />
              </div>
              <div className="input-cell" style={{ verticalAlign: 'bottom' }}>
                <button type="submit" className="btn-submit">
                  + Guardar Categoría
                </button>
              </div>
            </form>

            <h3 className="margin-t-15 margin-b-10 font-size-md text-secondary">Categorías Existentes:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {categorias.map(c => (
                <div 
                  key={c.idCategoriaMolde} 
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span>{c.nombreCategoria}</span>
                  <button
                    type="button"
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontWeight: 'bold' }}
                    title="Eliminar categoría"
                    onClick={() => handleEliminarCategoria(c.idCategoriaMolde)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FORMULARIO CREAR / EDITAR MOLDE */}
      {esAdmin && mostrarFormulario && (
        <div className="panel-registro margin-b-40">
          <div className="w-100">
            <h2 className="form-title">{modoEdicion ? 'Editar Molde' : 'Crear Nuevo Molde'}</h2>
            <form onSubmit={handleGuardar} className="grid-form">
              <div className="input-row">
                <div className="input-cell">
                  <label>Nombre del Molde</label>
                  <input
                    type="text"
                    required
                    placeholder="Solo letras, números, comas y puntos"
                    value={formMolde.nombreMolde}
                    onChange={(e) => setFormMolde({ ...formMolde, nombreMolde: sanitizarTexto(e.target.value) })}
                  />
                </div>
                <div className="input-cell">
                  <label>Categoría</label>
                  <select
                    required
                    value={formMolde.idCategoriaMolde}
                    onChange={(e) => setFormMolde({ ...formMolde, idCategoriaMolde: e.target.value })}
                  >
                    <option value="">Seleccione Categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.idCategoriaMolde} value={cat.idCategoriaMolde}>
                        {cat.nombreCategoria}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-row">
                <div className="input-cell">
                  <label>Género</label>
                  <select
                    value={formMolde.genero}
                    onChange={(e) => setFormMolde({ ...formMolde, genero: e.target.value })}
                  >
                    <option value="hombre">Hombre</option>
                    <option value="mujer">Mujer</option>
                    <option value="niño">Niño</option>
                    <option value="niña">Niña</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div className="input-cell">
                  <label>Descripción General</label>
                  <input
                    type="text"
                    placeholder="Detalles sobre cortes, tipo de tela, etc."
                    value={formMolde.descripcion}
                    onChange={(e) => setFormMolde({ ...formMolde, descripcion: sanitizarTexto(e.target.value) })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Indicaciones de Confección</label>
                <input
                  type="text"
                  placeholder="Márgenes de costura, ensamble, recomendaciones"
                  value={formMolde.indicaciones}
                  onChange={(e) => setFormMolde({ ...formMolde, indicaciones: sanitizarTexto(e.target.value) })}
                />
              </div>

              {/* SELECCIÓN DE IMÁGENES POR ARCHIVO (5XS A 5XL) */}
              <div className="input-group">
                <label>Subir Imágenes de Moldes por Talla (5XS a 5XL)</label>
                <p className="font-size-sm text-secondary margin-b-15">
                  Selecciona la foto o plano desde tus archivos locales (PNG, JPG, WEBP).
                </p>
                <div className="card-grid">
                  {TALLAS_DISPONIBLES.map(talla => {
                    const tallaData = formMolde.tallas.find(t => t.talla === talla);
                    const estaSubiendo = subiendoTalla === talla;

                    return (
                      <div key={talla} className="highlight-info" style={{ padding: '15px', textAlign: 'center' }}>
                        <h4>Talla {talla}</h4>

                        {tallaData && tallaData.imagenUrl ? (
                          <div style={{ marginTop: '8px' }}>
                            <img
                              src={tallaData.imagenUrl}
                              alt={`Molde ${talla}`}
                              style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
                            />
                            <button
                              type="button"
                              className="btn-login font-size-sm btn-alert-color"
                              style={{ width: '100%' }}
                              onClick={() => handleEliminarImagenTalla(talla)}
                            >
                              Eliminar Imagen
                            </button>
                          </div>
                        ) : (
                          <div style={{ marginTop: '10px' }}>
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              disabled={estaSubiendo}
                              onChange={(e) => handleArchivoSeleccionado(talla, e)}
                            />
                            {estaSubiendo && <p className="font-size-sm text-secondary">Subiendo imagen...</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex-row-gap-10 margin-t-15">
                <button type="submit" className="btn-submit">
                  {modoEdicion ? 'Actualizar Molde' : 'Guardar Molde'}
                </button>
                <button
                  type="button"
                  className="btn-login"
                  onClick={resetFormulario}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LISTADO DE MOLDES */}
      {cargando && <p className="text-secondary">Cargando catálogo...</p>}
      {error && <p className="text-error">Error: {error}</p>}
      {!cargando && moldes.length === 0 && (
        <div className="highlight-info">
          <h4>Sin Registros</h4>
          <p className="font-size-md">No se encontraron moldes que coincidan con la búsqueda.</p>
        </div>
      )}

      <div className="card-grid">
        {moldes.map(molde => (
          <div key={molde.idMolde} className="card-materia-prima module-card">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="status status-pending">{molde.categoria || 'Molde'}</span>
                <span className="status status-success">{molde.genero.toUpperCase()}</span>
              </div>
              <h2 className="margin-b-10 text-primary">{molde.nombreMolde}</h2>
              <p className="font-size-sm text-secondary margin-b-10">
                <strong>Descripción:</strong> {molde.descripcion || 'Sin descripción'}
              </p>
              <p className="font-size-sm text-secondary margin-b-15">
                <strong>Indicaciones:</strong> {molde.indicaciones || 'Sin indicaciones'}
              </p>

              {/* GALERÍA DE TALLAS */}
              <div className="margin-t-10 margin-b-15">
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  TALLAS DISPONIBLES:
                </h4>
                {molde.tallas && molde.tallas.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                    {molde.tallas.map(t => (
                      <a
                        key={t.idMoldeTalla || t.talla}
                        href={t.imagenUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-login font-size-sm"
                        style={{ padding: '4px 10px' }}
                      >
                        {t.talla} ↗
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="font-size-sm text-muted">Sin planos subidos</p>
                )}
              </div>
            </div>

            {/* BOTONES ADMINISTRADOR */}
            {esAdmin && (
              <div className="flex-row-gap-10 margin-t-15" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <button
                  type="button"
                  className="btn-login font-size-sm"
                  onClick={() => iniciarEdicion(molde)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn-login font-size-sm btn-alert-color"
                  onClick={() => handleEliminar(molde.idMolde)}
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}