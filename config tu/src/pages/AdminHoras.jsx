/* ==========================================================================
   ARCHIVO: AdminHoras.jsx
   PROPÓSITO: Página de administración para visualizar y gestionar las
              jornadas laborales de los empleados. Permite filtrar por
              empleado, ver cálculo de horas totales y pago, y consultar
              el detalle de cada jornada (entrada, salida, estado).
   ========================================================================== */

// Importa los hooks useState (estado local) y useEffect (efectos secundarios)
import { useState, useEffect } from 'react';
// Importa Link para navegación entre rutas sin recargar la página
import { Link } from 'react-router-dom';
// Importa el módulo api que contiene los métodos para llamar al backend
import { api } from '../api';

// Define el componente funcional AdminHoras
function AdminHoras() {
  // Estado: lista de empleados registrados en el sistema
  const [empleados, setEmpleados] = useState([]);
  // Estado: lista de jornadas laborales obtenidas del backend
  const [jornadas, setJornadas] = useState([]);
  // Estado: ID del empleado seleccionado en el filtro (cadena vacía = todos)
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  // Estado: resultado del cálculo de pago del empleado seleccionado (null si no hay selección)
  const [calculo, setCalculo] = useState(null);
  // Estado: nombre del administrador obtenido de la sesión activa
  // Se inicializa de forma perezosa desde localStorage para no depender
  // de un setState dentro del useEffect (evita lint set-state-in-effect)
  const [adminName] = useState(() => {
    const nombreSesion = localStorage.getItem('kimuka_sesion_activa');
    return nombreSesion ? nombreSesion.toUpperCase() : 'ADMINISTRADOR';
  });

  // useEffect que se ejecuta al montar el componente para cargar datos iniciales
  useEffect(() => {
    // Llama al endpoint para listar todos los empleados
    api.empleados.listar()
      .then((res) => setEmpleados(res.data || []))
      .catch(() => {});

    // Llama al endpoint para listar todas las jornadas laborales
    api.jornadas.listar()
      .then((res) => setJornadas(res.data || []))
      .catch(() => {});
  }, []); // Dependencia vacía: solo se ejecuta una vez al montar

  /*
   * Función: handleSeleccionarEmpleado
   * Propósito: Maneja el cambio en el selector de empleados. Actualiza el
   *            estado con el ID seleccionado y, si hay un empleado, llama
   *            al endpoint de cálculo de pago para ese empleado.
   * Parámetros:
   *   e - Evento onChange del select (contiene el valor del ID seleccionado)
   */
  const handleSeleccionarEmpleado = (e) => {
    // Obtiene el ID del empleado seleccionado desde el evento
    const id = e.target.value;
    // Actualiza el estado con el empleado seleccionado
    setEmpleadoSeleccionado(id);
    if (id) {
      // Si hay un ID válido, llama al endpoint para calcular el pago de ese empleado
      api.jornadas.calcularPago(id)
        .then((res) => setCalculo(res.data))
        .catch(() => setCalculo(null));
    } else {
      // Si no hay selección (opción "Todos"), resetea el cálculo a null
      setCalculo(null);
    }
  };

  // Filtra las jornadas: si hay un empleado seleccionado, solo las suyas; si no, todas
  const jornadasFiltradas = empleadoSeleccionado
    ? jornadas.filter((j) => j.idUsuario_Empleado === empleadoSeleccionado)
    : jornadas;

  /*
   * Función: getStatusClass
   * Propósito: Retorna la clase CSS según si la jornada tiene hora de fin.
   *            Si tiene hFin, está completada; si no, está pendiente.
   * Parámetros:
   *   hFin - String con la hora de fin de la jornada (null/undefined si no ha terminado)
   * Retorno: Nombre de la clase CSS ('status-success' o 'status-pending')
   */
  const getStatusClass = (hFin) => {
    return hFin ? 'status-success' : 'status-pending';
  };

  /*
   * Función: getStatusText
   * Propósito: Retorna el texto descriptivo del estado de la jornada.
   * Parámetros:
   *   hFin - String con la hora de fin de la jornada
   * Retorno: 'Completada' si tiene hora de fin, 'En curso' si no
   */
  const getStatusText = (hFin) => {
    return hFin ? 'Completada' : 'En curso';
  };

  // Renderiza el JSX del componente
  return (
    <div className="dark-theme">
      { /* Barra de navegación superior con enlace de retorno al dashboard */}
      <nav className="top-nav">
        <Link to="/dashboardadmin" className="no-text-decor">VOLVER</Link>
      </nav>

      { /* Encabezado principal con logo, título y nombre del administrador */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo-principal-cell">
            <div className="logo-principal">
              <div className="logo-circle">
                { /* Imagen del logo de la empresa */}
                <img src="../img/logo kimuka.png" alt="Logo Kimuka" />
              </div>
              { /* Título de la página */}
              <h1>Kimuka - Horas Empleados</h1>
            </div>
          </div>
          <div className="header-actions-cell">
            { /* Botón que muestra el nombre del administrador (solo visual) */}
            <button className="btn-login">{adminName}</button>
          </div>
        </div>
      </header>

      { /* Contenedor principal del contenido */}
      <main className="content-wrapper">
        { /* Sección del filtro por empleado */}
        <section className="panel-gestion">
          <div className="filters-grid">
            <div className="filter-cell">
              <label>Filtrar por Empleado</label>
              { /* Selector que al cambiar dispara handleSeleccionarEmpleado */}
              <select value={empleadoSeleccionado} onChange={handleSeleccionarEmpleado}>
                <option value="">Todos los empleados</option>
                { /* Itera sobre los empleados para las opciones del select */}
                {empleados.map((emp) => (
                  <option key={emp.idUsuario} value={emp.idUsuario}>{emp.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        { /* Renderiza condicionalmente el panel de cálculo cuando hay un empleado seleccionado */}
        {calculo && (
          <section className="panel-gestion">
            <div className="stats-container">
              { /* Columna izquierda: total de horas trabajadas */}
              <div className="stats-cell-left">
                <div className="highlight-info">
                  <h4>Total Horas</h4>
                  <p>{calculo.horasTotales} hrs</p>
                </div>
              </div>
              { /* Columna derecha: total a pagar y detalles adicionales */}
              <div className="stats-cell-right">
                <div className="highlight-info">
                  <h4>Total a Pagar</h4>
                  { /* Formatea el pago en pesos colombianos con toLocaleString */}
                  <p>$ {Number(calculo.pagoTotal).toLocaleString('es-CO')}</p>
                </div>
                <div className="margin-t-15 text-secondary font-size-sm">
                  { /* Muestra la tarifa por hora calculada */}
                  <p>Tarifa por hora: $ {Number(calculo.tarifaPorHora).toLocaleString('es-CO')}</p>
                  { /* Muestra el total de jornadas contabilizadas */}
                  <p>Jornadas: {calculo.totalJornadas}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        { /* Sección de la tabla de jornadas */}
        <section className="panel-gestion">
          { /* Título dinámico según si hay filtro activo */}
          <h3 className="table-title margin-b-25">
            {empleadoSeleccionado ? 'Jornadas del Empleado' : 'Todas las Jornadas'}
          </h3>
          <div className="table-container">
            <table className="kimukaPedidos-table">
              { /* Cabecera de la tabla con las columnas de información de jornada */}
              <thead>
                <tr>
                  <th>ID Jornada</th>
                  <th>Empleado</th>
                  <th>Fecha</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                { /* Si no hay jornadas filtradas, muestra fila de tabla vacía */}
                {jornadasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-secondary">No hay jornadas registradas.</td>
                  </tr>
                ) : (
                  // Itera sobre las jornadas filtradas para generar las filas
                  jornadasFiltradas.map((j) => (
                    <tr key={j.idJornada}>
                      <td>{j.idJornada}</td>
                      <td>{j.nombreEmpleado}</td>
                      <td>{j.fecha}</td>
                      { /* Muestra solo los primeros 5 caracteres de la hora (HH:MM) o "---" si no hay */}
                      <td>{j.hInicio ? j.hInicio.substring(0, 5) : '---'}</td>
                      <td>{j.hFin ? j.hFin.substring(0, 5) : '---'}</td>
                      <td>
                        { /* Badge de estado dinámico según si hay hora de fin */}
                        <span className={`status ${getStatusClass(j.hFin)}`}>
                          {getStatusText(j.hFin)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

// Exporta el componente para ser usado en el enrutador
export default AdminHoras;
