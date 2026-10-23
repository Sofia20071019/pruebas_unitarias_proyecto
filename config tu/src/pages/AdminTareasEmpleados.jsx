/*
 * ARCHIVO: AdminTareasEmpleados.jsx
 * PROPOSITO: Página de administración que permite al administrador visualizar todas las
 *            asignaciones de tareas/materiales a empleados. Incluye un filtro por empleado
 *            para facilitar la búsqueda y una tabla completa que muestra el ID de la asignación,
 *            nombre del empleado, material asignado, cantidad, fecha de asignación y estado
 *            actual de la tarea (Pendiente, En Proceso o Completada).
 */

/* Importación de hooks de estado y efecto de React */
import { useState, useEffect } from 'react';
/* Link de react-router-dom para navegación interna sin recarga de página */
import { Link } from 'react-router-dom';
/* Cliente API centralizado para realizar peticiones al backend */
import { api } from '../api';

/**
 * Componente funcional AdminTareasEmpleados
 * Panel de administración para gestionar y visualizar las asignaciones de materiales
 * a empleados. Carga las asignaciones y la lista de empleados al montar, y permite
 * filtrar las asignaciones por empleado específico.
 */
function AdminTareasEmpleados() {
  /* Estado que almacena la lista completa de asignaciones de materiales a empleados */
  const [asignaciones, setAsignaciones] = useState([]);
  /* Estado que almacena la lista de empleados disponibles para el filtro */
  const [empleados, setEmpleados] = useState([]);
  /* Estado que almacena el ID del empleado seleccionado en el filtro (vacío = todos) */
  const [filtroEmpleado, setFiltroEmpleado] = useState('');
  /* Estado que almacena el nombre del administrador logueado para mostrarlo en el header.
     Se inicializa de forma perezosa desde localStorage para no depender de un
     setState dentro del useEffect (evita lint set-state-in-effect) */
  const [adminName] = useState(() => {
    const nombreSesion = localStorage.getItem('kimuka_sesion_activa');
    return nombreSesion ? nombreSesion.toUpperCase() : 'ADMINISTRADOR';
  });

  /**
   * Efecto que se ejecuta una sola vez al montar el componente.
   * Realiza dos peticiones API: listar todas las asignaciones y listar todos los empleados.
   */
  useEffect(() => {
    /* Petición API: obtener todas las asignaciones de materiales a empleados */
    api.asignaciones.listar()
      .then((r) => setAsignaciones(r.data || [])) /* Guardar las asignaciones, fallback a array vacío */
      .catch(() => {}); /* Silenciar errores de red */

    /* Petición API: obtener la lista de todos los empleados registrados */
    api.empleados.listar()
      .then((r) => setEmpleados(r.data || [])) /* Guardar los empleados, fallback a array vacío */
      .catch(() => {}); /* Silenciar errores de red */
  }, []); /* Array de dependencias vacío: se ejecuta solo al montar el componente */

  /**
   * Variable calculada: filtra las asignaciones según el empleado seleccionado.
   * Si no hay filtro seleccionado, retorna todas las asignaciones.
   * Si hay un filtro, retorna solo las asignaciones del empleado con ese ID.
   */
  const filtradas = filtroEmpleado
    ? asignaciones.filter((a) => a.idUsuario_Empleado === filtroEmpleado) /* Filtrar por ID de empleado */
    : asignaciones; /* Sin filtro: retornar todas las asignaciones */

  /**
   * Función auxiliar que determina la clase CSS según el estado de una asignación.
   * @param {string} estado - Estado actual de la asignación (Completada, En Proceso, Pendiente)
   * @returns {string} Nombre de la clase CSS correspondiente al estado
   */
  const getStatusClass = (estado) => {
    /* Si el estado es 'Completada', aplicar clase de éxito (verde) */
    if (estado === 'Completada') return 'status-success';
    /* Si el estado es 'En Proceso', aplicar clase de pendiente (amarillo/naranja) */
    if (estado === 'En Proceso') return 'status-pending';
    /* Para cualquier otro estado (Pendiente), aplicar clase de pendiente */
    return 'status-pending';
  };

  /* ========== RENDERIZADO DEL COMPONENTE ========== */
  return (
    /* Fragmento vacío para agrupar elementos sin nodo div extra */
    <>
      {/* Barra de navegación superior con enlace para volver al dashboard admin */}
      <nav className="top-nav">
        {/* Enlace que redirige al panel de administración principal */}
        <Link to="/dashboardadmin">VOLVER</Link>
      </nav>

      {/* Encabezado principal de la página con logo y nombre del administrador */}
      <header className="main-header">
        {/* Contenedor flex del header que distribuye logo y acciones */}
        <div className="header-container">
          {/* Celda izquierda con el logo principal */}
          <div className="logo-principal-cell">
            {/* Contenedor del logo que agrupa imagen y título */}
            <div className="logo-principal">
              {/* Círculo decorativo con la imagen del logo */}
              <div className="logo-circle">
                {/* Imagen del logo de Kimuka */}
                <img src="../img/logo kimuka.png" alt="Logo" />
              </div>
              {/* Título de la página indicando la sección de tareas de empleados */}
              <h1>Tareas de Empleados</h1>
            </div>
          </div>
          {/* Celda derecha con el botón que muestra el nombre del administrador */}
          <div className="header-actions-cell">
            {/* Botón que muestra el nombre del administrador logueado */}
            <button className="btn-login">{adminName}</button>
          </div>
        </div>
      </header>

      {/* Contenido principal de la página */}
      <main className="content-wrapper">
        {/* Sección de filtros de búsqueda */}
        <section className="panel-gestion">
          {/* Contenedor del grid de filtros */}
          <div className="filters-grid">
            {/* Celda del filtro por empleado */}
            <div className="filter-cell">
              {/* Etiqueta del select de filtro */}
              <label>Filtrar por Empleado</label>
              {/* Select desplegable con la lista de empleados para filtrar las asignaciones */}
              <select value={filtroEmpleado} onChange={(e) => setFiltroEmpleado(e.target.value)}>
                {/* Opción por defecto: mostrar todas las asignaciones */}
                <option value="">Todos</option>
                {/* Iterar sobre el array de empleados para crear las opciones del select */}
                {empleados.map((emp) => (
                  /* Cada opción tiene como valor el ID del empleado y muestra su nombre */
                  <option key={emp.idUsuario} value={emp.idUsuario}>{emp.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Sección de la tabla de asignaciones filtradas */}
        <section className="panel-gestion">
          {/* Contenedor de la tabla con scroll horizontal si es necesario */}
          <div className="table-container">
            {/* Tabla que muestra las asignaciones de materiales a empleados */}
            <table className="kimukaPedidos-table">
              {/* Encabezado de la tabla con los nombres de las columnas */}
              <thead>
                <tr>
                  {/* Columna: identificador de la asignación */}
                  <th>ID</th>
                  {/* Columna: nombre del empleado asignado */}
                  <th>Empleado</th>
                  {/* Columna: nombre del material/insumo asignado */}
                  <th>Material</th>
                  {/* Columna: cantidad del material asignado */}
                  <th>Cantidad</th>
                  {/* Columna: fecha en que se realizó la asignación */}
                  <th>Fecha</th>
                  {/* Columna: estado actual de la asignación */}
                  <th>Estado</th>
                </tr>
              </thead>
              {/* Cuerpo de la tabla con las filas de asignaciones */}
              <tbody>
                {/* Renderizado condicional: si no hay asignaciones filtradas, mostrar mensaje */}
                {filtradas.length === 0 ? (
                  /* Fila vacía con mensaje que ocupa las 6 columnas de la tabla */
                  <tr><td colSpan="6" className="text-center text-secondary">Sin asignaciones.</td></tr>
                ) : (
                  /* Iterar sobre las asignaciones filtradas para crear las filas de la tabla */
                  filtradas.map((a) => (
                    /* Fila de la tabla con clave única basada en el ID de la asignación */
                    <tr key={a.idAsignacion}>
                      {/* Celda: ID de la asignación */}
                      <td>{a.idAsignacion}</td>
                      {/* Celda: nombre del empleado que recibió la asignación */}
                      <td>{a.nombreEmpleado}</td>
                      {/* Celda: nombre del material o insumo asignado */}
                      <td>{a.nombreInsumo}</td>
                      {/* Celda: cantidad asignada del material */}
                      <td>{a.cantidad}</td>
                      {/* Celda: fecha de la asignación */}
                      <td>{a.fechaAsignacion}</td>
                      {/* Celda: estado de la asignación con clase CSS dinámica según su estado */}
                      <td>
                        {/* Span con clase de estilo condicional según el estado de la asignación */}
                        <span className={`status ${getStatusClass(a.estado)}`}>{a.estado}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

/* Exportar el componente AdminTareasEmpleados como exportación por defecto */
export default AdminTareasEmpleados;
