/**
 * ======================================================================
 * ARCHIVO: ReporteMateriasPrimas.jsx
 * PROPOSITO: Componente de página que muestra el reporte de materias
 *            primas (inventario) del sistema Kimuka. Presenta un gráfico
 *            de barras con el stock de materiales, estadísticas resumidas
 *            (total de materiales, stock total, materiales sin stock),
 *            un filtro por categoría y una tabla detallada del inventario
 *            con el estado de cada material. Utiliza Chart.js.
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

/* Importación de componentes y escalas de Chart.js necesarios
   para configurar el gráfico de barras */
import {
  Chart as ChartJS,       /* Instancia principal de Chart.js */
  CategoryScale,           /* Escala categórica para el eje X */
  LinearScale,             /* Escala lineal para el eje Y */
  BarElement,              /* Elemento visual de las barras */
  Title,                   /* Componente para el título del gráfico */
  Tooltip,                 /* Componente para tooltips al pasar el mouse */
  Legend                    /* Componente para la leyenda del gráfico */
} from 'chart.js';

/* Registro de los componentes de Chart.js para que estén disponibles
   al renderizar los gráficos */
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* Definición del componente funcional ReporteMateriasPrimas */
function ReporteMateriasPrimas() {

    /* ---------- ESTADOS DEL COMPONENTE ---------- */

    /* Nombre del administrador logueado, se obtiene del localStorage.
       Se inicializa de forma perezosa desde localStorage para no depender de
       un setState dentro del useEffect (evita lint set-state-in-effect) */
    const [adminName] = useState(() => {
        const nombreSesion = localStorage.getItem('kimuka_sesion_activa');
        return nombreSesion ? nombreSesion.toUpperCase() : 'ADMINISTRADOR';
    });

    /* Lista de todos los insumos/materiales del inventario */
    const [insumos, setInsumos] = useState([]);

    /* Filtro de categoría seleccionado, 'todos' muestra todo por defecto */
    const [filtroCategoria, setFiltroCategoria] = useState('todos');

    /* Lista de categorías disponibles para el filtro */
    const [categorias, setCategorias] = useState([]);

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
            /* Pide al backend el Excel del reporte filtrado por categoría */
            const { blob, nombreArchivo } = await api.reportes.exportarMateriasPrimas({
                categoria: filtroCategoria,
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

    /* useEffect con dependencias vacías: se ejecuta una sola vez al montar.
       Carga los insumos y las categorías. */
    useEffect(() => {
        /* Petición GET para listar todos los insumos del inventario */
        api.insumos.listar().then((r) => setInsumos(r.data || [])).catch(() => {});

        /* Petición GET para listar todas las categorías de materiales */
        api.categorias.listar().then((r) => setCategorias(r.data || [])).catch(() => {});
    }, []); /* Array vacío: solo se ejecuta al montar */

    /* ---------- DATOS DERIVADOS Y CONFIGURACIÓN DEL GRÁFICO ---------- */

    /* Filtrar insumos según la categoría seleccionada.
       Si el filtro es 'todos', muestra todos los insumos;
       de lo contrario, filtra por ID de categoría. */
    const filtrados = filtroCategoria === 'todos'
        ? insumos
        : insumos.filter((i) => i.idCategoria === filtroCategoria);

    /* Configuración de datos para el gráfico de barras.
       Cada barra representa un insumo con su stock disponible. */
    const chartData = {
        /* Etiquetas del eje X: nombres de los insumos filtrados */
        labels: filtrados.map((i) => i.nombreInsumo),
        /* Datasets: conjunto de datos para el gráfico */
        datasets: [{
            label: 'Stock Disponible',               /* Nombre de la serie en la leyenda */
            data: filtrados.map((i) => i.cantidad),   /* Valores del eje Y: cantidades */
            backgroundColor: '#2ecc71',                /* Color de relleno de las barras (verde) */
            borderColor: '#27ae60',                    /* Color del borde de las barras */
            borderWidth: 1,                            /* Ancho del borde */
            borderRadius: 5                            /* Radio de esquinas redondeadas */
        }]
    };

    /* Opciones de configuración del gráfico de barras */
    const chartOptions = {
        responsive: true,              /* Se adapta al contenedor */
        maintainAspectRatio: false,    /* No mantiene relación de aspecto fija */
        plugins: {
            /* Configuración de la leyenda */
            legend: { labels: { color: '#ffffff' } },
            /* Configuración del título del gráfico */
            title: { display: true, text: 'Inventario de Materiales', color: '#ffffff', font: { size: 16 } }
        },
        scales: {
            /* Configuración del eje X (categorías/insumos) */
            x: { ticks: { color: '#aaaaaa' }, grid: { color: '#2d2d2d' } },
            /* Configuración del eje Y (cantidades), comenzando en cero */
            y: { ticks: { color: '#aaaaaa' }, grid: { color: '#2d2d2d' }, beginAtZero: true }
        }
    };

    /* ---------- ESTADÍSTICAS RESUMEN ---------- */

    /* Total de materiales/insumos en el inventario */
    const totalItems = insumos.length;

    /* Suma total del stock de todos los insumos (acumulando cantidades) */
    const totalStock = insumos.reduce((sum, i) => sum + (i.cantidad || 0), 0);

    /* Cantidad de materiales que tienen stock en cero o sin cantidad */
    const sinStock = insumos.filter((i) => !i.cantidad || i.cantidad === 0).length;

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
                {/* Contenedor flexible del encabezado */}
                <div className="header-container">
                    {/* Celda izquierda con logo y título */}
                    <div className="logo-principal-cell">
                        {/* Wrapper del logo y título */}
                        <div className="logo-principal">
                            {/* Círculo contenedor de la imagen del logo */}
                            <div className="logo-circle">
                                {/* Imagen del logo de Kimuka */}
                                <img src="../img/logo kimuka.png" alt="Logo Kimuka" />
                            </div>
                            {/* Título de la página */}
                            <h1>Reporte de Materias Primas</h1>
                        </div>
                    </div>
                    {/* Celda derecha con el nombre del administrador */}
                    <div className="header-actions-cell">
                        {/* Botón que muestra el nombre del admin logueado */}
                        <button className="btn-login">{adminName}</button>
                    </div>
                </div>
            </header>

            {/* Contenido principal de la página */}
            <main className="content-wrapper">

                {/* Sección de título descriptivo del módulo */}
                <div className="text-center margin-b-40">
                    {/* Título del módulo */}
                    <h2 className="font-size-xl">Reporte de Materias Primas</h2>
                    {/* Subtítulo descriptivo */}
                    <p className="text-secondary">Inventario general de materiales del sistema Kimuka.</p>
                </div>

                {/* Sección de estadísticas resumen */}
                <section className="panel-gestion">
                    {/* Contenedor de estadísticas en dos columnas */}
                    <div className="stats-container">
                        {/* Columna izquierda: total de materiales */}
                        <div className="stats-cell-left">
                            {/* Tarjeta de estadística: Total Materiales */}
                            <div className="highlight-info">
                                {/* Etiqueta de la estadística */}
                                <h4>Total Materiales</h4>
                                {/* Valor: cantidad total de materiales */}
                                <p>{totalItems}</p>
                            </div>
                        </div>
                        {/* Columna derecha: stock total y materiales sin stock */}
                        <div className="stats-cell-right">
                            {/* Tarjeta de estadística: Stock Total */}
                            <div className="highlight-info">
                                {/* Etiqueta de la estadística */}
                                <h4>Stock Total</h4>
                                {/* Valor: suma total de stock con 2 decimales */}
                                <p>{totalStock.toFixed(2)}</p>
                            </div>
                            {/* Información adicional: materiales sin stock */}
                            <div className="margin-t-15 text-secondary font-size-sm">
                                <p>Materiales sin stock: {sinStock}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección del gráfico de barras con filtro de categoría */}
                <section className="panel-gestion">
                    {/* Fila de filtros */}
                    <div className="filters-grid margin-b-20">
                        {/* Celda del filtro de categoría */}
                        <div className="filter-cell">
                            {/* Etiqueta del filtro */}
                            <label>Filtrar por Categoría</label>
                            {/* Dropdown de categorías para filtrar el gráfico */}
                            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                                {/* Opción para mostrar todas las categorías */}
                                <option value="todos">Todas las categorías</option>
                                {/* Mapear cada categoría como opción del filtro */}
                                {categorias.map((c) => (
                                    <option key={c.idCategoria} value={c.idCategoria}>{c.nombreCategoria}</option>
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
                    {/* Contenedor del gráfico con altura fija de 350px */}
                    <div style={{ height: '350px' }}>
                        {/* Mostrar el gráfico si hay datos filtrados, o mensaje de vacío */}
                        {filtrados.length > 0 ? (
                            <Bar data={chartData} options={chartOptions} />
                        ) : (
                            <p className="text-secondary text-center">No hay datos para mostrar.</p>
                        )}
                    </div>
                </section>

                {/* Sección de tabla detallada del inventario */}
                <section className="panel-gestion">
                    {/* Título de la tabla */}
                    <h3 className="margin-b-20">Detalle del Inventario</h3>
                    {/* Contenedor de la tabla con scroll horizontal */}
                    <div className="table-container">
                        {/* Tabla de inventario con estilos de Kimuka */}
                        <table className="kimukaPedidos-table">
                            {/* Encabezado de la tabla */}
                            <thead>
                                <tr>
                                    {/* Columna: nombre del material */}
                                    <th>Material</th>
                                    {/* Columna: categoría del material */}
                                    <th>Categoría</th>
                                    {/* Columna: unidad de medida */}
                                    <th>Unidad</th>
                                    {/* Columna: cantidad en stock */}
                                    <th>Stock</th>
                                    {/* Columna: estado de disponibilidad */}
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            {/* Cuerpo de la tabla */}
                            <tbody>
                                {/* Mostrar mensaje si no hay insumos registrados */}
                                {insumos.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center text-secondary">Sin materiales registrados.</td></tr>
                                ) : (
                                    /* Mapear cada insumo como una fila de la tabla */
                                    insumos.map((i) => (
                                        <tr key={i.idInsumo}>
                                            {/* Nombre del insumo/material */}
                                            <td>{i.nombreInsumo}</td>
                                            {/* Nombre de la categoría */}
                                            <td>{i.nombreCategoria}</td>
                                            {/* Unidad de medida */}
                                            <td>{i.nombreUnidad}</td>
                                            {/* Cantidad disponible en stock */}
                                            <td>{i.cantidad}</td>
                                            {/* Estado de disponibilidad con badge dinámico:
                                               verde (status-success) si tiene stock,
                                               rojo (status-fail) si no tiene stock */}
                                            <td>
                                                <span className={`status ${i.cantidad > 0 ? 'status-success' : 'status-fail'}`}>
                                                    {/* Texto del estado */}
                                                    {i.cantidad > 0 ? 'Disponible' : 'Sin stock'}
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
export default ReporteMateriasPrimas;
