/**
 * ======================================================================
 * ARCHIVO: ReporteHoras.jsx
 * PROPOSITO: Componente de página que genera el reporte de horas
 *            trabajadas del sistema Kimuka. Permite filtrar las jornadas
 *            por empleado, mes y año, y muestra un gráfico de barras con
 *            las horas trabajadas (por empleado o por mes), estadísticas
 *            resumidas (total de jornadas, total de horas, promedio) y
 *            una tabla detallada de cada jornada laboral.
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

/**
 * Función auxiliar: horasEntre
 * Calcula las horas transcurridas entre una hora de inicio y una de fin.
 * Si la hora de fin es menor que la de inicio se asume turno nocturno.
 * @param {string|null} hInicio - Hora de inicio (formato HH:MM o HH:MM:SS)
 * @param {string|null} hFin - Hora de fin (formato HH:MM o HH:MM:SS)
 * @returns {number} Horas trabajadas redondeadas a 2 decimales
 */
function horasEntre(hInicio, hFin) {
  if (!hInicio || !hFin) return 0;
  const [hi, mi, si = 0] = hInicio.split(':').map(Number);
  const [hf, mf, sf = 0] = hFin.split(':').map(Number);
  let segundos = (hf * 3600 + mf * 60 + sf) - (hi * 3600 + mi * 60 + si);
  if (segundos < 0) segundos += 24 * 3600;
  return Math.round((segundos / 3600) * 100) / 100;
}

/* Definición del componente funcional ReporteHoras */
function ReporteHoras() {

  /* ---------- ESTADOS DEL COMPONENTE ---------- */

  /* Nombre del administrador logueado.
     Se inicializa de forma perezosa desde localStorage para no depender de un
     setState dentro del useEffect (evita lint set-state-in-effect) */
  const [adminName] = useState(() => {
    const nombreSesion = localStorage.getItem('kimuka_sesion_activa');
    return nombreSesion ? nombreSesion.toUpperCase() : 'ADMINISTRADOR';
  });

  /* Lista de todas las jornadas laborales del sistema */
  const [jornadas, setJornadas] = useState([]);

  /* Filtro de empleado seleccionado ('' = todos) */
  const [filtroEmpleado, setFiltroEmpleado] = useState('');

  /* Filtro de mes seleccionado ('' = todos los meses) */
  const [filtroMes, setFiltroMes] = useState('');

  /* Filtro de año seleccionado ('' = todos los años) */
  const [filtroAnio, setFiltroAnio] = useState('');

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
      /* Pide al backend el Excel del reporte filtrado por empleado/mes/año */
      const { blob, nombreArchivo } = await api.reportes.exportarHoras({
        empleado: filtroEmpleado,
        mes: filtroMes,
        anio: filtroAnio,
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

  /* useEffect con dependencias vacías: lista todas las jornadas
     laborales al montar el componente. */
  useEffect(() => {

    /* Petición GET para listar todas las jornadas laborales */
    api.jornadas.listar().then((r) => setJornadas(r.data || [])).catch(() => {});
  }, []);

  /* ---------- DATOS DERIVADOS ---------- */

  /* Lista de empleados únicos obtenida a partir de las jornadas,
     usada para poblar el filtro de empleados. */
  const empleados = [];
  const empleadosVistos = new Set();
  jornadas.forEach((j) => {
    if (!empleadosVistos.has(j.idUsuario_Empleado)) {
      empleadosVistos.add(j.idUsuario_Empleado);
      empleados.push({ id: j.idUsuario_Empleado, nombre: j.nombreEmpleado });
    }
  });

  /* Años disponibles para el filtro, obtenidos de las fechas de las jornadas */
  const aniosDisponibles = [];
  const aniosVistos = new Set();
  jornadas.forEach((j) => {
    const anio = (j.fecha || '').substring(0, 4);
    if (anio && !aniosVistos.has(anio)) {
      aniosVistos.add(anio);
      aniosDisponibles.push(anio);
    }
  });
  aniosDisponibles.sort((a, b) => b - a);

  /* Jornadas enriquecidas: se añade horas trabajadas, año y mes a cada registro */
  const jornadasEnriquecidas = jornadas.map((j) => ({
    ...j,
    horas: horasEntre(j.hInicio, j.hFin),
    anio: (j.fecha || '').substring(0, 4),
    mes: (j.fecha || '').substring(5, 7)
  }));

  /* Aplicar los filtros seleccionados (empleado, mes y año) a las jornadas */
  const filtradas = jornadasEnriquecidas.filter((j) =>
    (!filtroEmpleado || j.idUsuario_Empleado === filtroEmpleado) &&
    (!filtroMes || j.mes === filtroMes) &&
    (!filtroAnio || j.anio === filtroAnio)
  );

  /* Variable auxiliar: objeto del empleado seleccionado en el filtro */
  const empleadoSeleccionado = empleados.find((e) => e.id === filtroEmpleado) || null;

  /* ---------- AGREGACIÓN PARA EL GRÁFICO ---------- */

  /* Si hay un empleado seleccionado, el gráfico muestra las horas por mes;
     de lo contrario, muestra el total de horas por empleado. */
  const chartData = empleadoSeleccionado
    ? (() => {
        /* Agrupar las horas trabajadas por mes dentro de las jornadas filtradas */
        const porMes = {};
        filtradas.forEach((j) => {
          const nombre = MESES.find((m) => m.value === j.mes)?.name || j.mes;
          porMes[nombre] = (porMes[nombre] || 0) + j.horas;
        });
        return {
          labels: Object.keys(porMes),
          datasets: [{
            label: `Horas de ${empleadoSeleccionado.nombre}`,
            data: Object.values(porMes),
            backgroundColor: '#f39c12',
            borderColor: '#e67e22',
            borderWidth: 1,
            borderRadius: 5
          }]
        };
      })()
    : (() => {
        /* Agrupar las horas trabajadas por empleado dentro de las jornadas filtradas */
        const porEmpleado = {};
        filtradas.forEach((j) => {
          porEmpleado[j.nombreEmpleado] = (porEmpleado[j.nombreEmpleado] || 0) + j.horas;
        });
        return {
          labels: Object.keys(porEmpleado),
          datasets: [{
            label: 'Horas Trabajadas',
            data: Object.values(porEmpleado),
            backgroundColor: '#f39c12',
            borderColor: '#e67e22',
            borderWidth: 1,
            borderRadius: 5
          }]
        };
      })();

  /* Opciones de configuración del gráfico de barras */
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#ffffff' } },
      title: {
        display: true,
        text: empleadoSeleccionado ? 'Horas por Mes' : 'Horas por Empleado',
        color: '#ffffff',
        font: { size: 16 }
      }
    },
    scales: {
      x: { ticks: { color: '#aaaaaa' }, grid: { color: '#2d2d2d' } },
      y: { ticks: { color: '#aaaaaa' }, grid: { color: '#2d2d2d' }, beginAtZero: true }
    }
  };

  /* ---------- ESTADÍSTICAS RESUMEN ---------- */

  /* Total de jornadas dentro del filtro aplicado */
  const totalJornadas = filtradas.length;

  /* Suma total de horas trabajadas dentro del filtro aplicado */
  const totalHoras = filtradas.reduce((sum, j) => sum + j.horas, 0);

  /* Promedio de horas por jornada (evita división entre cero) */
  const promedioHoras = totalJornadas > 0 ? totalHoras / totalJornadas : 0;

  /* Cantidad de jornadas que aún están en curso (sin hora de fin) */
  const jornadasEnCurso = filtradas.filter((j) => !j.hFin).length;

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
              <h1>Reporte de Horas Trabajadas</h1>
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
          <h2 className="font-size-xl">Reporte de Horas Trabajadas</h2>
          <p className="text-secondary">Jornadas laborales y horas trabajadas por los empleados del sistema Kimuka.</p>
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
                <h4>Total Horas</h4>
                <p>{totalHoras.toFixed(2)} hrs</p>
              </div>
            </div>
            <div className="stats-cell-right">
              <div className="highlight-info">
                <h4>Total Jornadas</h4>
                <p>{totalJornadas}</p>
              </div>
              <div className="margin-t-15 text-secondary font-size-sm">
                <p>Promedio por jornada: {promedioHoras.toFixed(2)} hrs</p>
                <p>Jornadas en curso: {jornadasEnCurso}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección del gráfico de barras */}
        <section className="panel-gestion">
          <div style={{ height: '350px' }}>
            {filtradas.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <p className="text-secondary text-center">No hay datos para mostrar.</p>
            )}
          </div>
        </section>

        {/* Sección de tabla detallada de jornadas */}
        <section className="panel-gestion">
          <h3 className="margin-b-20">Detalle de Jornadas</h3>
          <div className="table-container">
            <table className="kimukaPedidos-table">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Fecha</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Horas</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-secondary">No hay jornadas registradas.</td></tr>
                ) : (
                  filtradas.map((j) => (
                    <tr key={j.idJornada}>
                      <td>{j.nombreEmpleado}</td>
                      <td>{j.fecha}</td>
                      <td>{j.hInicio ? j.hInicio.substring(0, 5) : '---'}</td>
                      <td>{j.hFin ? j.hFin.substring(0, 5) : '---'}</td>
                      <td>{j.horas > 0 ? `${j.horas.toFixed(2)} hrs` : '---'}</td>
                      <td>
                        <span className={`status ${j.hFin ? 'status-success' : 'status-pending'}`}>
                          {j.hFin ? 'Completada' : 'En curso'}
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

/* Exportación del componente como exportación por defecto */
export default ReporteHoras;
