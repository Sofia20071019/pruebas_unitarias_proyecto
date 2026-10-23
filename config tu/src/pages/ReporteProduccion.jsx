/**
 * ======================================================================
 * ARCHIVO: ReporteProduccion.jsx
 * PROPOSITO: Componente de página que genera el reporte de producción
 *            del sistema Kimuka. Muestra las unidades fabricadas por
 *            producto, las órdenes de producción por mes y su estado.
 *            Permite filtrar las órdenes por cliente, mes, año y estado,
 *            y presenta gráficos de barras, estadísticas resumidas y una
 *            tabla detallada de las órdenes de producción.
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
 * Función auxiliar: nombreEstado
 * Traduce el código de estado de producción a un texto legible.
 * @param {string} estado - Código de estado ('✔', '..' o '✖')
 * @returns {string} Texto legible del estado de producción
 */
function nombreEstado(estado) {
  if (estado === '✔') return 'Entregado';
  if (estado === '✖') return 'Cancelado';
  return 'En Proceso';
}

/* Definición del componente funcional ReporteProduccion */
function ReporteProduccion() {

  /* ---------- ESTADOS DEL COMPONENTE ---------- */

  /* Nombre del administrador logueado.
     Se inicializa de forma perezosa desde localStorage para no depender de un
     setState dentro del useEffect (evita lint set-state-in-effect) */
  const [adminName] = useState(() => {
    const nombreSesion = localStorage.getItem('kimuka_sesion_activa');
    return nombreSesion ? nombreSesion.toUpperCase() : 'ADMINISTRADOR';
  });

  /* Lista de todas las órdenes de producción */
  const [ordenes, setOrdenes] = useState([]);

  /* Filtro de cliente seleccionado ('' = todos) */
  const [filtroCliente, setFiltroCliente] = useState('');

  /* Filtro de mes seleccionado ('' = todos los meses) */
  const [filtroMes, setFiltroMes] = useState('');

  /* Filtro de año seleccionado ('' = todos los años) */
  const [filtroAnio, setFiltroAnio] = useState('');

  /* Filtro de estado de producción ('' = todos los estados) */
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
      /* Pide al backend el Excel del reporte filtrado por cliente/mes/año/estado */
      const { blob, nombreArchivo } = await api.reportes.exportarProduccion({
        cliente: filtroCliente,
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

  /* useEffect con dependencias vacías: lista todas las órdenes de
     producción al montar el componente. */
  useEffect(() => {

    /* Petición GET para listar todas las órdenes de producción */
    api.ordenes.listar().then((r) => setOrdenes(r.data || [])).catch(() => {});
  }, []);

  /* ---------- DATOS DERIVADOS ---------- */

  /* Lista de clientes únicos obtenida a partir de las órdenes */
  const clientes = [];
  const clientesVistos = new Set();
  ordenes.forEach((o) => {
    if (o.nombreCliente && !clientesVistos.has(o.nombreCliente)) {
      clientesVistos.add(o.nombreCliente);
      clientes.push(o.nombreCliente);
    }
  });

  /* Años disponibles para el filtro, obtenidos de las fechas de pedido */
  const aniosDisponibles = [];
  const aniosVistos = new Set();
  ordenes.forEach((o) => {
    const anio = (o.fechaPedido || '').substring(0, 4);
    if (anio && !aniosVistos.has(anio)) {
      aniosVistos.add(anio);
      aniosDisponibles.push(anio);
    }
  });
  aniosDisponibles.sort((x, y) => y - x);

  /* Estados disponibles para el filtro: los tres estados del sistema */
  const estadosDisponibles = ['✔', '..', '✖'];

  /* Función auxiliar que calcula las unidades totales de una orden
     sumando la cantidad de cada producto incluido en sus detalles. */
  const unidadesDeOrden = (o) =>
    (o.detalles || []).reduce((sum, d) => sum + (Number(d.cantidadTotal) || 0), 0);

  /* Aplicar los filtros seleccionados (cliente, mes, año y estado) */
  const filtradas = ordenes.filter((o) =>
    (!filtroCliente || o.nombreCliente === filtroCliente) &&
    (!filtroMes || (o.fechaPedido || '').substring(5, 7) === filtroMes) &&
    (!filtroAnio || (o.fechaPedido || '').substring(0, 4) === filtroAnio) &&
    (!filtroEstado || o.estadoProd === filtroEstado)
  );

  /* ---------- AGREGACIÓN: UNIDADES POR PRODUCTO ---------- */

  /* Acumular las unidades fabricadas de cada producto a partir
     de los detalles de todas las órdenes filtradas. */
  const productosMap = {};
  filtradas.forEach((o) => {
    (o.detalles || []).forEach((d) => {
      if (!productosMap[d.nombreProducto]) {
        productosMap[d.nombreProducto] = { nombre: d.nombreProducto, unidades: 0, ordenes: 0 };
      }
      productosMap[d.nombreProducto].unidades += Number(d.cantidadTotal) || 0;
      productosMap[d.nombreProducto].ordenes += 1;
    });
  });

  /* Ranking de productos ordenado de mayor a menor unidades fabricadas */
  const productosRanking = Object.values(productosMap).sort((a, b) => b.unidades - a.unidades);

  /* Datos para el gráfico: los 8 productos con más unidades fabricadas */
  const topProductos = productosRanking.slice(0, 8);
  const chartProductos = {
    labels: topProductos.map((p) => p.nombre),
    datasets: [{
      label: 'Unidades Fabricadas',
      data: topProductos.map((p) => p.unidades),
      backgroundColor: '#f39c12',
      borderColor: '#e67e22',
      borderWidth: 1,
      borderRadius: 5
    }]
  };

  /* Opciones del gráfico de productos */
  const optionsProductos = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#ffffff' } },
      title: { display: true, text: 'Unidades Fabricadas por Producto', color: '#ffffff', font: { size: 16 } }
    },
    scales: {
      x: { ticks: { color: '#aaaaaa' }, grid: { color: '#2d2d2d' } },
      y: { ticks: { color: '#aaaaaa' }, grid: { color: '#2d2d2d' }, beginAtZero: true }
    }
  };

  /* ---------- AGREGACIÓN: ÓRDENES POR MES ---------- */

  /* Contar las órdenes filtradas agrupadas por mes. */
  const porMes = {};
  filtradas.forEach((o) => {
    const mes = (o.fechaPedido || '').substring(5, 7);
    const nombre = MESES.find((m) => m.value === mes)?.name || mes;
    porMes[nombre] = (porMes[nombre] || 0) + 1;
  });

  /* Datos para el gráfico de órdenes por mes */
  const chartMensual = {
    labels: Object.keys(porMes),
    datasets: [{
      label: 'N° de Órdenes',
      data: Object.values(porMes),
      backgroundColor: '#2ecc71',
      borderColor: '#27ae60',
      borderWidth: 1,
      borderRadius: 5
    }]
  };

  /* Opciones del gráfico mensual */
  const optionsMensual = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#ffffff' } },
      title: { display: true, text: 'Órdenes de Producción por Mes', color: '#ffffff', font: { size: 16 } }
    },
    scales: {
      x: { ticks: { color: '#aaaaaa' }, grid: { color: '#2d2d2d' } },
      y: { ticks: { color: '#aaaaaa' }, grid: { color: '#2d2d2d' }, beginAtZero: true }
    }
  };

  /* ---------- ESTADÍSTICAS RESUMEN ---------- */

  /* Total de órdenes dentro del filtro aplicado */
  const totalOrdenes = filtradas.length;

  /* Total de unidades fabricadas dentro del filtro aplicado */
  const totalUnidades = filtradas.reduce((sum, o) => sum + unidadesDeOrden(o), 0);

  /* Cantidad de clientes distintos dentro del filtro aplicado */
  const totalClientes = new Set(filtradas.map((o) => o.nombreCliente).filter(Boolean)).size;

  /* Cantidad de órdenes entregadas */
  const entregadas = filtradas.filter((o) => o.estadoProd === '✔').length;

  /* Cantidad de órdenes en proceso */
  const enProceso = filtradas.filter((o) => o.estadoProd === '..').length;

  /* Cantidad de órdenes canceladas */
  const canceladas = filtradas.filter((o) => o.estadoProd === '✖').length;

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
              <h1>Reporte de Producción</h1>
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
          <h2 className="font-size-xl">Reporte de Producción</h2>
          <p className="text-secondary">Órdenes de producción y unidades fabricadas del sistema Kimuka.</p>
        </div>

        {/* Sección de filtros del reporte */}
        <section className="panel-gestion">
          <div className="filters-grid">
            {/* Filtro por cliente */}
            <div className="filter-cell">
              <label>Cliente</label>
              <select value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)}>
                <option value="">Todos los clientes</option>
                {clientes.map((c) => (
                  <option key={c} value={c}>{c}</option>
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
                {estadosDisponibles.map((e) => (
                  <option key={e} value={e}>{nombreEstado(e)}</option>
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
                <h4>Total Unidades</h4>
                <p>{totalUnidades}</p>
              </div>
            </div>
            <div className="stats-cell-right">
              <div className="highlight-info">
                <h4>Total Órdenes</h4>
                <p>{totalOrdenes}</p>
              </div>
              <div className="margin-t-15 text-secondary font-size-sm">
                <p>Entregadas: {entregadas} · En proceso: {enProceso} · Canceladas: {canceladas}</p>
                <p>Clientes: {totalClientes}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección del gráfico de unidades por producto */}
        <section className="panel-gestion">
          <div style={{ height: '350px' }}>
            {topProductos.length > 0 ? (
              <Bar data={chartProductos} options={optionsProductos} />
            ) : (
              <p className="text-secondary text-center">No hay datos para mostrar.</p>
            )}
          </div>
        </section>

        {/* Sección del gráfico de órdenes por mes */}
        <section className="panel-gestion">
          <div style={{ height: '350px' }}>
            {Object.keys(porMes).length > 0 ? (
              <Bar data={chartMensual} options={optionsMensual} />
            ) : (
              <p className="text-secondary text-center">No hay datos para mostrar.</p>
            )}
          </div>
        </section>

        {/* Sección de tabla detallada de órdenes de producción */}
        <section className="panel-gestion">
          <h3 className="margin-b-20">Detalle de Órdenes de Producción</h3>
          <div className="table-container">
            <table className="kimukaPedidos-table">
              <thead>
                <tr>
                  <th>ID Orden</th>
                  <th>Cliente</th>
                  <th>Fecha Pedido</th>
                  <th>Estado</th>
                  <th>Productos</th>
                  <th>Unidades</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-secondary">No hay órdenes registradas.</td></tr>
                ) : (
                  filtradas.map((o) => (
                    <tr key={o.idOrden}>
                      <td>{o.idOrden}</td>
                      <td>{o.nombreCliente || '---'}</td>
                      <td>{o.fechaPedido || '---'}</td>
                      <td>
                        <span className={`status ${
                          o.estadoProd === '✔' ? 'status-success'
                          : o.estadoProd === '✖' ? 'status-fail'
                          : 'status-pending'
                        }`}>
                          {nombreEstado(o.estadoProd)}
                        </span>
                      </td>
                      <td>{(o.detalles || []).length}</td>
                      <td>{unidadesDeOrden(o)}</td>
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
export default ReporteProduccion;
