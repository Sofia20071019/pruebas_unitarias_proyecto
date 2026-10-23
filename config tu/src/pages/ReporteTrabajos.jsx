/**
 * ======================================================================
 * ARCHIVO: ReporteTrabajos.jsx
 * PROPOSITO: Componente de página que genera el reporte de trabajos más
 *            realizados del sistema Kimuka. Muestra dos métricas:
 *            los materiales (insumos) más asignados y los empleados más
 *            activos. Permite filtrar las asignaciones por empleado, mes,
 *            año y estado, y presenta gráficos de barras, estadísticas
 *            resumidas y tablas de ranking para cada métrica.
 * ======================================================================
 */

/* Importación de Link de react-router-dom para navegación entre rutas */
import { Link } from 'react-router-dom';

/* Importación de hooks de React: useState para estado local,
   useEffect para efectos al montar */
import { useState, useEffect } from 'react';

/* Importación del módulo de API centralizado para llamadas HTTP y
   del helper de descarga de Blob para exportar el reporte a Excel */
import { api, descargarBlob } from '../api';

/* Importación del componente Bar de react-chartjs-2 para gráficos de barras */
import { Bar } from 'react-chartjs-2';

/* Importación de componentes y escalas de Chart.js */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

/* Registro de los componentes de Chart.js */
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* Nombres de los meses del año para etiquetas de gráficos y filtros */
const MESES = [
  { value: '01', name: 'Enero' },
  { value: '02', name: 'Febrero' },
  { value: '03', name: 'Marzo' },
  { value: '04', name: 'Abril' },
  { value: '05', name: 'Mayo' },
  { value: '06', name: 'Junio' },
  { value: '07', name: 'Julio' },
  { value: '08', name: 'Agosto' },
  { value: '09', name: 'Septiembre' },
  { value: '10', name: 'Octubre' },
  { value: '11', name: 'Noviembre' },
  { value: '12', name: 'Diciembre' }
];

/* Definición del componente funcional ReporteTrabajos */
function ReporteTrabajos() {

  /* ---------- ESTADOS DEL COMPONENTE ---------- */

  /* Nombre del administrador logueado.
     Se inicializa de forma perezosa desde localStorage para no depender de un
     setState dentro del useEffect (evita lint set-state-in-effect) */
  const [adminName] = useState(() => {
    const nombreSesion = localStorage.getItem('kimuka_sesion_activa');
    return nombreSesion ? nombreSesion.toUpperCase() : 'ADMINISTRADOR';
  });

  /* Lista de todas las asignaciones de materiales a empleados */
  const [asignaciones, setAsignaciones] = useState([]);

  /* Filtro de empleado seleccionado ('' = todos) */
  const [filtroEmpleado, setFiltroEmpleado] = useState('');

  /* Filtro de mes seleccionado ('' = todos los meses) */
  const [filtroMes, setFiltroMes] = useState('');

  /* Filtro de año seleccionado ('' = todos los años) */
  const [filtroAnio, setFiltroAnio] = useState('');

  /* Filtro de estado de la asignación ('' = todos los estados) */
  const [filtroEstado, setFiltroEstado] = useState('');

  /* Bandera que indica si se está generando la descarga del Excel */
  const [exportando, setExportando] = useState(false);

  /* Mensaje de error al intentar exportar el reporte */
  const [errorExcel, setErrorExcel] = useState('');

  /* ---------- MANEJADOR DE EXPORTACIÓN A EXCEL ---------- */

  /* Genera el archivo .xlsx en el backend con los filtros actuales
     y dispara la descarga en el navegador. */
  const manejarExportar = async () => {
    if (exportando) return; /* Evita clics duplicados mientras se descarga */
    setExportando(true);
    setErrorExcel('');
    try {
      /* Pide al backend el Excel del reporte filtrado por empleado/mes/año/estado */
      const { blob, nombreArchivo } = await api.reportes.exportarTrabajos({
        empleado: filtroEmpleado,
        mes: filtroMes,
        anio: filtroAnio,
        estado: filtroEstado,
      });
      /* Dispara la descarga del archivo en el navegador */
      descargarBlob(blob, nombreArchivo);
    } catch (err) {
      /* Muestra el mensaje de error si el backend falla */
      setErrorExcel(err.message || 'No se pudo generar el archivo Excel.');
    } finally {
      setExportando(false);
    }
  };

  /* ---------- EFECTO AL MONTAR EL COMPONENTE ---------- */

  /* useEffect con dependencias vacías: lista todas las asignaciones
     al montar el componente. */
  useEffect(() => {

    /* Petición GET para listar todas las asignaciones de materiales */
    api.asignaciones.listar().then((r) => setAsignaciones(r.data || [])).catch(() => {});
  }, []);

  /* ---------- DATOS DERIVADOS ---------- */

  /* Lista de empleados únicos obtenida a partir de las asignaciones */
  const empleados = [];
  const empleadosVistos = new Set();
  asignaciones.forEach((a) => {
    if (!empleadosVistos.has(a.idUsuario_Empleado)) {
      empleadosVistos.add(a.idUsuario_Empleado);
      empleados.push({ id: a.idUsuario_Empleado, nombre: a.nombreEmpleado });
    }
  });

  /* Años disponibles para el filtro, obtenidos de las fechas de asignación */
  const aniosDisponibles = [];
  const aniosVistos = new Set();
  asignaciones.forEach((a) => {
    const anio = (a.fechaAsignacion || '').substring(0, 4);
    if (anio && !aniosVistos.has(anio)) {
      aniosVistos.add(anio);
      aniosDisponibles.push(anio);
    }
  });
  aniosDisponibles.sort((x, y) => y - x);

  /* Aplicar los filtros seleccionados (empleado, mes, año y estado) */
  const filtradas = asignaciones.filter((a) =>
    (!filtroEmpleado || a.idUsuario_Empleado === filtroEmpleado) &&
    (!filtroMes || (a.fechaAsignacion || '').substring(5, 7) === filtroMes) &&
    (!filtroAnio || (a.fechaAsignacion || '').substring(0, 4) === filtroAnio) &&
    (!filtroEstado || a.estado === filtroEstado)
  );

  /* ---------- AGREGACIÓN: MATERIALES MÁS ASIGNADOS ---------- */

  /* Agrupar las asignaciones filtradas por material/insumo:
     se cuenta cuántas veces fue asignado y la cantidad total entregada. */
  const materialesMap = {};
  filtradas.forEach((a) => {
    if (!materialesMap[a.nombreInsumo]) {
      materialesMap[a.nombreInsumo] = { nombre: a.nombreInsumo, count: 0, cantidad: 0 };
    }
    materialesMap[a.nombreInsumo].count += 1;
    materialesMap[a.nombreInsumo].cantidad += Number(a.cantidad) || 0;
  });

  /* Ranking de materiales ordenado de mayor a menor número de asignaciones */
  const materialesRanking = Object.values(materialesMap).sort((a, b) => b.count - a.count);

  /* Datos para el gráfico: los 8 materiales más asignados */
  const topMateriales = materialesRanking.slice(0, 8);
  const chartMateriales = {
    labels: topMateriales.map((m) => m.nombre),
    datasets: [{
      label: 'N° de Asignaciones',
      data: topMateriales.map((m) => m.count),
      backgroundColor: '#e74c3c',
      borderColor: '#c0392b',
      borderWidth: 1,
      borderRadius: 5
    }]
  };

  /* Opciones del gráfico de materiales */
  const optionsMateriales = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#ffffff' } },
      title: { display: true, text: 'Materiales Más Asignados', color: '#ffffff', font: { size: 16 } }
    },
    scales: {
      x: { ticks: { color: '#aaaaaa' }, grid: { color: '#2d2d2d' } },
      y: { ticks: { color: '#aaaaaa' }, grid: { color: '#2d2d2d' }, beginAtZero: true }
    }
  };

  /* ---------- AGREGACIÓN: EMPLEADOS MÁS ACTIVOS ---------- */

  /* Agrupar las asignaciones filtradas por empleado:
     se cuenta el total de asignaciones y las completadas. */
  const empleadosMap = {};
  filtradas.forEach((a) => {
    if (!empleadosMap[a.nombreEmpleado]) {
      empleadosMap[a.nombreEmpleado] = { nombre: a.nombreEmpleado, count: 0, completadas: 0 };
    }
    empleadosMap[a.nombreEmpleado].count += 1;
    if (a.estado === 'Completada') empleadosMap[a.nombreEmpleado].completadas += 1;
  });

  /* Ranking de empleados ordenado de mayor a menor número de asignaciones */
  const empleadosRanking = Object.values(empleadosMap).sort((a, b) => b.count - a.count);

  /* Datos para el gráfico: los 8 empleados más activos */
  const topEmpleados = empleadosRanking.slice(0, 8);
  const chartEmpleados = {
    labels: topEmpleados.map((e) => e.nombre),
    datasets: [{
      label: 'N° de Trabajos',
      data: topEmpleados.map((e) => e.count),
      backgroundColor: '#2ecc71',
      borderColor: '#27ae60',
      borderWidth: 1,
      borderRadius: 5
    }]
  };

  /* Opciones del gráfico de empleados */
  const optionsEmpleados = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#ffffff' } },
      title: { display: true, text: 'Empleados Más Activos', color: '#ffffff', font: { size: 16 } }
    },
    scales: {
      x: { ticks: { color: '#aaaaaa' }, grid: { color: '#2d2d2d' } },
      y: { ticks: { color: '#aaaaaa' }, grid: { color: '#2d2d2d' }, beginAtZero: true }
    }
  };

  /* ---------- ESTADÍSTICAS RESUMEN ---------- */

  /* Total de asignaciones dentro del filtro aplicado */
  const totalAsignaciones = filtradas.length;

  /* Cantidad de asignaciones completadas */
  const completadas = filtradas.filter((a) => a.estado === 'Completada').length;

  /* Cantidad de asignaciones en proceso */
  const enProceso = filtradas.filter((a) => a.estado === 'En Proceso').length;

  /* Cantidad de asignaciones pendientes */
  const pendientes = filtradas.filter((a) => a.estado === 'Pendiente').length;

  /* ---------- RENDERIZADO DEL COMPONENTE ---------- */

  return (
    /* Contenedor principal con tema oscuro */
    <div className="dark-theme">

      {/* Barra de navegación superior */}
      <nav className="top-nav">
        {/* Enlace para volver al hub de reportes */}
        <Link to="/reportes" className="no-text-decor">VOLVER A REPORTES</Link>
      </nav>

      {/* Encabezado principal de la página */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo-principal-cell">
            <div className="logo-principal">
              <div className="logo-circle">
                <img src="../img/logo kimuka.png" alt="Logo Kimuka" />
              </div>
              <h1>Trabajos Más Realizados</h1>
            </div>
          </div>
          <div className="header-actions-cell">
            <button className="btn-login">{adminName}</button>
          </div>
        </div>
      </header>

      {/* Contenido principal de la página */}
      <main className="content-wrapper">

        {/* Sección de título descriptivo del módulo */}
        <div className="text-center margin-b-40">
          <h2 className="font-size-xl">Trabajos Más Realizados</h2>
          <p className="text-secondary">Materiales más asignados y empleados más activos del sistema Kimuka.</p>
        </div>

        {/* Sección de filtros del reporte */}
        <section className="panel-gestion">
          <div className="filters-grid">
            {/* Filtro por empleado */}
            <div className="filter-cell">
              <label>Empleado</label>
              <select value={filtroEmpleado} onChange={(e) => setFiltroEmpleado(e.target.value)}>
                <option value="">Todos los empleados</option>
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                ))}
              </select>
            </div>
            {/* Filtro por mes */}
            <div className="filter-cell">
              <label>Mes</label>
              <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
                <option value="">Todos los meses</option>
                {MESES.map((m) => (
                  <option key={m.value} value={m.value}>{m.name}</option>
                ))}
              </select>
            </div>
            {/* Filtro por año */}
            <div className="filter-cell">
              <label>Año</label>
              <select value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)}>
                <option value="">Todos los años</option>
                {aniosDisponibles.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            {/* Filtro por estado */}
            <div className="filter-cell">
              <label>Estado</label>
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Completada">Completada</option>
              </select>
            </div>
            {/* Celda del botón de exportación a Excel */}
            <div className="filter-cell filter-cell-btn">
              <button className="btn-export" onClick={manejarExportar} disabled={exportando}>
                {/* Ícono de descarga */}
                <span aria-hidden="true">&#11015;</span>
                {exportando ? 'Generando Excel...' : 'Exportar a Excel'}
              </button>
              {/* Mensaje de error si la exportación falla */}
              {errorExcel && <p className="text-error margin-t-10">{errorExcel}</p>}
            </div>
          </div>
        </section>

        {/* Sección de estadísticas resumen */}
        <section className="panel-gestion">
          <div className="stats-container">
            <div className="stats-cell-left">
              <div className="highlight-info">
                <h4>Total Asignaciones</h4>
                <p>{totalAsignaciones}</p>
              </div>
            </div>
            <div className="stats-cell-right">
              <div className="highlight-info">
                <h4>Completadas</h4>
                <p>{completadas}</p>
              </div>
              <div className="margin-t-15 text-secondary font-size-sm">
                <p>En proceso: {enProceso}</p>
                <p>Pendientes: {pendientes}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección del gráfico de materiales más asignados */}
        <section className="panel-gestion">
          <div style={{ height: '350px' }}>
            {topMateriales.length > 0 ? (
              <Bar data={chartMateriales} options={optionsMateriales} />
            ) : (
              <p className="text-secondary text-center">No hay datos para mostrar.</p>
            )}
          </div>
        </section>

        {/* Sección de la tabla de ranking de materiales */}
        <section className="panel-gestion">
          <h3 className="margin-b-20">Ranking de Materiales Más Asignados</h3>
          <div className="table-container">
            <table className="kimukaPedidos-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Material</th>
                  <th>Asignaciones</th>
                  <th>Cantidad Total</th>
                </tr>
              </thead>
              <tbody>
                {materialesRanking.length === 0 ? (
                  <tr><td colSpan="4" className="text-center text-secondary">Sin asignaciones registradas.</td></tr>
                ) : (
                  materialesRanking.map((m, idx) => (
                    <tr key={m.nombre}>
                      <td>{idx + 1}</td>
                      <td>{m.nombre}</td>
                      <td>{m.count}</td>
                      <td>{m.cantidad.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sección del gráfico de empleados más activos */}
        <section className="panel-gestion">
          <div style={{ height: '350px' }}>
            {topEmpleados.length > 0 ? (
              <Bar data={chartEmpleados} options={optionsEmpleados} />
            ) : (
              <p className="text-secondary text-center">No hay datos para mostrar.</p>
            )}
          </div>
        </section>

        {/* Sección de la tabla de ranking de empleados */}
        <section className="panel-gestion">
          <h3 className="margin-b-20">Ranking de Empleados Más Activos</h3>
          <div className="table-container">
            <table className="kimukaPedidos-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Empleado</th>
                  <th>Total Trabajos</th>
                  <th>Completados</th>
                </tr>
              </thead>
              <tbody>
                {empleadosRanking.length === 0 ? (
                  <tr><td colSpan="4" className="text-center text-secondary">Sin trabajos registrados.</td></tr>
                ) : (
                  empleadosRanking.map((e, idx) => (
                    <tr key={e.nombre}>
                      <td>{idx + 1}</td>
                      <td>{e.nombre}</td>
                      <td>{e.count}</td>
                      <td>{e.completadas}</td>
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

/* Exportación del componente como exportación por defecto */
export default ReporteTrabajos;
