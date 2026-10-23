/* ==========================================================================
   ARCHIVO: InventarioEmpleado.jsx
   PROPÓSITO: Página de consulta de inventario de materia prima para el rol
              Empleado. Permite visualizar los insumos disponibles con filtros
              de búsqueda por nombre y categoría. Es una versión de solo
              lectura (sin opciones de crear o editar).
   ========================================================================== */

// Importa los hooks useState (estado local) y useEffect (efectos secundarios)
import { useState, useEffect } from 'react';
// Importa Link para navegación entre rutas sin recargar la página
import { Link } from 'react-router-dom';
// Importa el módulo api que contiene los métodos para llamar al backend
import { api } from '../api';

// Define el componente funcional InventarioEmpleado
function InventarioEmpleado() {
  // Estado: lista completa de insumos obtenida del backend
  const [inventario, setInventario] = useState([]);
  // Estado: lista de categorías para el filtro desplegable
  const [categorias, setCategorias] = useState([]);
  // Estado: nombre del empleado obtenido de la sesión activa
  // Se inicializa de forma perezosa desde localStorage para no depender de un
  // setState dentro del useEffect (evita lint set-state-in-effect)
  const [empleadoName] = useState(() => {
    const nombreSesion = localStorage.getItem('kimuka_sesion_activa');
    return nombreSesion ? nombreSesion.toUpperCase() : 'EMPLEADO';
  });

  // Estado: texto de búsqueda para filtrar insumos por nombre
  const [buscarNombre, setBuscarNombre] = useState('');
  // Estado: valor del filtro de categoría (por defecto "todos")
  const [filtroCategoria, setFiltroCategoria] = useState('todos');

  // useEffect que se ejecuta al montar el componente para cargar datos iniciales
  useEffect(() => {
    // Llama al endpoint para listar todos los insumos y los guarda en el estado
    api.insumos.listar()
      .then((res) => setInventario(res.data || []))
      .catch(() => {});

    // Llama al endpoint para listar todas las categorías disponibles
    api.categorias.listar()
      .then((res) => setCategorias(res.data || []))
      .catch(() => {});
  }, []); // Dependencia vacía: solo se ejecuta una vez al montar

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
      { /* Barra de navegación superior con enlace de retorno al dashboard de empleado */}
      <nav className="top-nav">
        <Link to="/dashboard-empleado">VOLVER</Link>
      </nav>

      { /* Encabezado principal con logo, título y nombre del empleado */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo-principal-cell">
            <div className="logo-principal">
              <div className="logo-circle">
                { /* Imagen del logo de la empresa */}
                <img src="../img/logo kimuka.png" alt="Logo" />
              </div>
              { /* Título de la página */}
              <h1>Kimuka - Inventario</h1>
            </div>
          </div>
          <div className="header-actions-cell">
            { /* Botón que muestra el nombre del empleado (solo visual, sin acción) */}
            <button className="btn-login">{empleadoName}</button>
          </div>
        </div>
      </header>

      { /* Contenedor principal del contenido */}
      <main className="content-wrapper">
        { /* Sección de filtros de búsqueda */}
        <section className="panel-gestion">
          <div className="filters-grid">
            { /* Campo de texto para filtrar insumos por nombre */}
            <div className="filter-cell">
              <label>Buscar por Nombre</label>
              <input type="text" placeholder="Escriba el nombre..." value={buscarNombre} onChange={(e) => setBuscarNombre(e.target.value)} />
            </div>
            { /* Selector para filtrar insumos por categoría */}
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

        { /* Grid de tarjetas de materia prima (solo visualización, sin acciones) */}
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
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}

// Exporta el componente para ser usado en el enrutador
export default InventarioEmpleado;
