/* ==========================================================================
   ARCHIVO: MateriaPrima.jsx
   PROPÓSITO: Página de gestión de inventario de materia prima para el rol
              Administrador. Permite listar, filtrar, registrar nuevos insumos
              y agregar stock a materiales existentes. Se conecta con los
              endpoints de insumos, categorías y unidades de medida.
   ========================================================================== */

// Importa los hooks useState (estado local) y useEffect (efectos secundarios)
import { useState, useEffect } from 'react';
// Importa Link para navegación entre rutas sin recargar la página
import { Link } from 'react-router-dom';
// Importa el módulo api que contiene los métodos para llamar al backend
import { api } from '../api';

// Define el componente funcional MateriaPrima
function MateriaPrima() {
  // Estado: lista completa de insumos obtenida del backend
  const [inventario, setInventario] = useState([]);
  // Estado: lista de categorías para filtros y formularios
  const [categorias, setCategorias] = useState([]);
  // Estado: lista de unidades de medida para el formulario de registro
  const [unidades, setUnidades] = useState([]);
  // Estado: controla si se muestra u oculta el formulario de registro de material
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  // Estado: nombre del administrador obtenido de la sesión activa.
  // Se inicializa de forma perezosa desde localStorage para no depender de un
  // setState dentro del useEffect (evita lint set-state-in-effect)
  const [adminName] = useState(() => {
    const nombreSesion = localStorage.getItem('kimuka_sesion_activa');
    return nombreSesion ? nombreSesion.toUpperCase() : 'ADMINISTRADOR';
  });

  // Estado: texto de búsqueda para filtrar insumos por nombre
  const [buscarNombre, setBuscarNombre] = useState('');
  // Estado: valor del filtro de categoría (por defecto "todos")
  const [filtroCategoria, setFiltroCategoria] = useState('todos');

  // Estado: nombre del material en el formulario de registro
  const [formNombre, setFormNombre] = useState('');
  // Estado: categoría seleccionada en el formulario de registro
  const [formCategoria, setFormCategoria] = useState('');
  // Estado: unidad de medida seleccionada en el formulario de registro
  const [formUnidad, setFormUnidad] = useState('');
  // Estado: cantidad inicial del material en el formulario de registro
  const [formCantidad, setFormCantidad] = useState('');
  // Estado: mapa de cantidades a agregar a cada insumo (key = idInsumo)
  const [stockAgregar, setStockAgregar] = useState({});

  // useEffect que se ejecuta al montar el componente para cargar datos iniciales
  useEffect(() => {
    // Llama al endpoint para listar todos los insumos y los guarda en el estado
    api.insumos.listar()
      .then((res) => setInventario(res.data || []))
      .catch(() => {});

    // Llama al endpoint para listar todas las categorías
    api.categorias.listar()
      .then((res) => setCategorias(res.data || []))
      .catch(() => {});

    // Llama al endpoint para listar todas las unidades de medida
    api.unidadesMedida.listar()
      .then((res) => setUnidades(res.data || []))
      .catch(() => {});
  }, []); // Dependencia vacía: solo se ejecuta una vez al montar

  // Función que recarga la lista de inventario desde el backend
  const cargarInventario = () => {
    api.insumos.listar()
      .then((res) => setInventario(res.data || []))
      .catch(() => {});
  };

  /*
   * Función: registrarMaterial
   * Propósito: Maneja el envío del formulario para crear un nuevo insumo.
   *            Llama al endpoint de creación, muestra alerta de éxito y
   *            resetea el formulario. En caso de error, muestra alerta.
   * Parámetros:
   *   e - Evento del formulario (se previene el comportamiento por defecto)
   */
  const registrarMaterial = async (e) => {
    e.preventDefault();
    try {
      // Llama al endpoint para crear un nuevo insumo con los datos del formulario
      await api.insumos.crear({
        nombreInsumo: formNombre.trim(),
        idCategoria: formCategoria,
        idUnidad: formUnidad,
        cantidad: formCantidad || 0
      });

      // Muestra mensaje de éxito al usuario
      alert(`¡Material ${formNombre} registrado con éxito!`);
      // Limpia todos los campos del formulario
      setFormNombre('');
      setFormCategoria('');
      setFormUnidad('');
      setFormCantidad('');
      // Oculta el formulario y recarga el inventario
      setMostrarFormulario(false);
      cargarInventario();
    } catch (error) {
      // Muestra el mensaje de error si la creación falla
      alert(error.message || "Error al registrar el insumo.");
    }
  };

  // Aplica filtros sobre el inventario: por nombre y por categoría
  const itemsFiltrados = inventario.filter(item => {
    // Normaliza el nombre a minúsculas para comparación case-insensitive
    const nombreSeguro = item.nombreInsumo ? item.nombreInsumo.toLowerCase() : '';
    // Verifica si el nombre coincide con el texto de búsqueda (si está vacío, pasa todos)
    const coincideNombre = buscarNombre === "" || nombreSeguro.includes(buscarNombre.toLowerCase());
    // Verifica si la categoría coincide con el filtro (si es "todos", pasa todos)
    const coincideCat = filtroCategoria === "todos" || item.idCategoria === filtroCategoria;
    // Retorna verdadero solo si ambos filtros coinciden
    return coincideNombre && coincideCat;
  });

  // Renderiza el JSX del componente
  return (
    <>
      { /* Barra de navegación superior con enlace de retorno al dashboard */}
      <nav className="top-nav">
        <Link to="/dashboardadmin">VOLVER</Link>
      </nav>

      { /* Encabezado principal con logo, título y botones de acción */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo-principal-cell">
            <div className="logo-principal">
              <div className="logo-circle">
                { /* Imagen del logo de la empresa */}
                <img src="../img/logo kimuka.png" alt="Logo" />
              </div>
              { /* Título de la página */}
              <h1>Kimuka - Materia Prima</h1>
            </div>
          </div>
          <div className="header-actions-cell">
            { /* Botón que muestra el nombre del administrador (solo visual) */}
            <button className="btn-login">{adminName}</button>
            { /* Botón que abre el formulario para añadir un nuevo insumo */}
            <button className="btn-login" onClick={() => setMostrarFormulario(true)}>
              Añadir Insumo
            </button>
          </div>
        </div>
      </header>

      { /* Contenedor principal del contenido */}
      <main className="content-wrapper">
        { /* Sección de filtros de búsqueda */}
        <section className="panel-gestion">
          <div className="filters-grid">
            { /* Campo de texto para filtrar por nombre (solo letras, sin números) */}
            <div className="filter-cell">
              <label>Buscar por Nombre</label>
              <input type="text" placeholder="Escriba el nombre..." value={buscarNombre} onChange={(e) => setBuscarNombre(e.target.value.replace(/[0-9]/g, ''))} />
            </div>
            { /* Selector para filtrar por categoría */}
            <div className="filter-cell">
              <label>Categoría</label>
              <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                <option value="todos">Todas las categorías</option>
                { /* Itera sobre las categorías para generar las opciones del select */}
                {categorias.map((c) => (
                  <option key={c.idCategoria} value={c.idCategoria}>{c.nombreCategoria}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        { /* Renderiza condicionalmente el formulario de registro de material */}
        {mostrarFormulario && (
          <section className="panel-gestion">
            <h3 className="margin-b-20">REGISTRAR INGRESO DE MATERIAL</h3>
            { /* Formulario para registrar un nuevo material, onSubmit llama a registrarMaterial */}
            <form className="grid-form" onSubmit={registrarMaterial}>
              <div className="input-row">
                { /* Campo: nombre del material (solo letras) */}
                <div className="input-cell">
                  <label>NOMBRE DEL MATERIAL</label>
                  <input type="text" placeholder="Ej: Tela Algodón" value={formNombre} onChange={(e) => setFormNombre(e.target.value.replace(/[0-9]/g, ''))} required />
                </div>
                { /* Campo: categoría del material (selector) */}
                <div className="input-cell">
                  <label>CATEGORÍA</label>
                  <select value={formCategoria} onChange={(e) => setFormCategoria(e.target.value)} required>
                    <option value="">Seleccione</option>
                    { /* Itera sobre las categorías para las opciones */}
                    {categorias.map((c) => (
                      <option key={c.idCategoria} value={c.idCategoria}>{c.nombreCategoria}</option>
                    ))}
                  </select>
                </div>
              </div>
              { /* Campo: unidad de medida del material */}
              <div className="input-group">
                <label>UNIDAD DE MEDIDA</label>
                <select value={formUnidad} onChange={(e) => setFormUnidad(e.target.value)} required>
                  <option value="">Seleccione</option>
                  { /* Itera sobre las unidades de medida para las opciones */}
                  {unidades.map((u) => (
                    <option key={u.idUnidad} value={u.idUnidad}>{u.nombreUnidad}</option>
                  ))}
                </select>
              </div>
              { /* Campo: cantidad inicial del material */}
              <div className="input-group">
                <label>CANTIDAD INICIAL</label>
                <input type="number" step="0.01" min="0" value={formCantidad} onChange={(e) => setFormCantidad(e.target.value)} placeholder="0" />
              </div>
              { /* Botones de acción del formulario */}
              <div className="flex-row-gap-10 margin-t-20-end">
                { /* Botón para cerrar el formulario sin guardar */}
                <button type="button" className="btn-login" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
                { /* Botón para enviar el formulario y registrar el material */}
                <button type="submit" className="btn-submit">Registrar en Inventario</button>
              </div>
            </form>
          </section>
        )}

        { /* Grid de tarjetas de materia prima */}
        <div className="materia-prima-grid">
          { /* Si no hay resultados del filtro, muestra mensaje de vacío */}
          {itemsFiltrados.length === 0 ? (
            <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#888", padding: "20px" }}>
              No se encontraron materiales.
            </p>
          ) : (
            // Itera sobre los items filtrados para renderizar cada tarjeta
            itemsFiltrados.map((item) => (
              <div key={item.idInsumo} className="card-materia-prima">
                { /* Nombre del insumo */}
                <h2>{item.nombreInsumo || 'Sin nombre'}</h2>
                { /* Categoría del insumo */}
                <p className="text-secondary">{item.nombreCategoria}</p>
                { /* Unidad de medida del insumo */}
                <p className="text-muted font-size-sm">{item.nombreUnidad}</p>
                { /* Cantidad disponible, cambia de color si es cero (rojo) o positiva (verde) */}
                <p className={`font-size-lg margin-t-10 ${item.cantidad > 0 ? 'text-primary' : 'status-fail'}`}>
                  {item.cantidad || 0}
                </p>
                { /* Controles para agregar stock a este insumo específico */}
                <div className="flex-row-gap-10 margin-t-10" style={{ justifyContent: 'center' }}>
                  { /* Input numérico para la cantidad a agregar */}
                  <input type="number" min="0" style={{ width: '80px', padding: '6px' }}
                    value={stockAgregar[item.idInsumo] || ''}
                    onChange={(e) => setStockAgregar({ ...stockAgregar, [item.idInsumo]: e.target.value })}
                    placeholder="+" />
                  { /* Botón que agrega la cantidad ingresada al stock del insumo */}
                  <button className="btn-login" style={{ padding: '6px 12px' }}
                    onClick={async () => {
                      // Convierte el valor ingresado a número flotante
                      const cantidad = parseFloat(stockAgregar[item.idInsumo]);
                      // Si no es un número válido o es <= 0, no hace nada
                      if (!cantidad || cantidad <= 0) return;
                      try {
                        // Llama al endpoint para actualizar la cantidad del insumo sumando el nuevo valor
                        await api.insumos.actualizar(item.idInsumo, { cantidad: (item.cantidad || 0) + cantidad });
                        // Limpia el campo de entrada para este insumo
                        setStockAgregar({ ...stockAgregar, [item.idInsumo]: '' });
                        // Recarga el inventario para reflejar el cambio
                        cargarInventario();
                      } catch (err) { alert(err.message); }
                    }}>Agregar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}

// Exporta el componente para ser usado en el enrutador
export default MateriaPrima;
