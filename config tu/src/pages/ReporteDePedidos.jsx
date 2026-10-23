/* ============================================================
   ARCHIVO: ReporteDePedidos.jsx
   PROPOSITO: Componente de página que genera reportes visuales
              de pedidos y consumo de insumos de la empresa Kimuka.
              Muestra una gráfica de barras mensual que representa
              las métricas de consumo filtrables por año, mes e
              insumo específico. Utiliza la librería Chart.js para
              la renderización de gráficas y se conecta con la API
              para obtener la lista de insumos disponibles.
   ============================================================ */

// Importación de hooks de estado y efecto
import { useState, useEffect } from 'react';
// Importación de Link para navegación entre rutas
import { Link } from 'react-router-dom';
// Importación del componente Bar de react-chartjs-2 para gráficas de barras
import { Bar } from 'react-chartjs-2';
// Importación de módulos necesarios de Chart.js para configurar la gráfica
import {
  Chart as ChartJS,        // Componente principal de Chart.js
  CategoryScale,           // Escala categórica para el eje X
  LinearScale,             // Escala lineal para el eje Y
  BarElement,              // Elemento visual de las barras
  Title,                   // Plugin para el título de la gráfica
  Tooltip,                 // Plugin para tooltips al pasar el mouse
  Legend                    // Plugin para la leyenda de la gráfica
} from 'chart.js';
// Importación del módulo de API para peticiones HTTP al backend
import { api } from '../api';

// Registro de componentes de Chart.js para habilitar su uso en las gráficas
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* ============================================================
   Componente principal: ReporteDePedidos
   Renderiza la página completa de reportes con filtros,
   gráfica de barras y panel de información del administrador.
   ============================================================ */
function ReporteDePedidos() {

  /* ----------------------------------------------------------
     ESTADOS (useState)
     ---------------------------------------------------------- */

  // Nombre del administrador logueado, usado en el encabezado.
  // Se inicializa de forma perezosa desde localStorage para no depender de un
  // setState dentro del useEffect (evita lint set-state-in-effect)
  const [adminName] = useState(() => {
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    if (usuarioLogueado) {
      const user = JSON.parse(usuarioLogueado);
      if (user.nombre) return user.nombre.toUpperCase();
    }
    const nombreSesion = localStorage.getItem('kimuka_sesion_activa');
    return nombreSesion ? nombreSesion.toUpperCase() : 'ADMINISTRADOR';
  });

  // Lista de insumos obtenidos desde el backend para el selector de insumos
  const [insumos, setInsumos] = useState([]);

  // Filtro de mes seleccionado por el usuario (vacío = todos los meses)
  const [filtroMes, setFiltroMes] = useState('');

  // Filtro de año seleccionado por el usuario (por defecto el año actual)
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString());

  // Filtro de insumo específico seleccionado por el usuario
  const [filtroInsumo, setFiltroInsumo] = useState('');

  // Datos que alimentan la gráfica de barras
  // Contiene labels (meses) y datasets (valores de consumo)
  const [datosGrafica, setDatosGrafica] = useState({
    // Nombres de los 12 meses del año como etiquetas del eje X
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    datasets: [
      {
        label: 'Consumo de Insumos', // Etiqueta de la leyenda
        // Valores iniciales en cero para cada mes
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#f39c12', // Color de relleno de las barras (amarillo/naranja)
      }
    ]
  });

  /* ----------------------------------------------------------
     GENERACIÓN DE AÑOS DISPONIBLES
     Crea un array con los años desde 2024 hasta el año actual
     para populate el selector de años.
     ---------------------------------------------------------- */
  const aniosDisponibles = [];    // Array que contendrá los años disponibles
  const anioActual = new Date().getFullYear(); // Obtener el año actual
  // Bucle desde 2024 hasta el año actual (inclusive)
  for (let a = 2024; a <= anioActual; a++) {
    aniosDisponibles.push(a.toString()); // Agregar cada año como string
  }

  /* ----------------------------------------------------------
     DEFINICIÓN DE MESES
     Array de objetos con el valor numérico (01-12) y el
     nombre de cada mes, usado para los selectores de filtro.
     ---------------------------------------------------------- */
  const meses = [
    { value: '01', name: 'Enero' },       // Enero
    { value: '02', name: 'Febrero' },     // Febrero
    { value: '03', name: 'Marzo' },       // Marzo
    { value: '04', name: 'Abril' },       // Abril
    { value: '05', name: 'Mayo' },        // Mayo
    { value: '06', name: 'Junio' },       // Junio
    { value: '07', name: 'Julio' },       // Julio
    { value: '08', name: 'Agosto' },      // Agosto
    { value: '09', name: 'Septiembre' },  // Septiembre
    { value: '10', name: 'Octubre' },     // Octubre
    { value: '11', name: 'Noviembre' },   // Noviembre
    { value: '12', name: 'Diciembre' }    // Diciembre
  ];

  /* ----------------------------------------------------------
     EFECTO SECUNDARIO (useEffect)
     Se ejecuta una sola vez al montar el componente.
     Carga la lista de insumos desde la API.
     ---------------------------------------------------------- */
  useEffect(() => {
    // Realizar petición GET para obtener la lista de insumos disponibles
    api.insumos.listar()
      .then((res) => setInsumos(res.data || [])) // Guardar insumos en el estado
      .catch(() => {}); // Silenciar errores de red o backend
  }, []); // Array vacío: se ejecuta solo al montar el componente

  /* ----------------------------------------------------------
     FUNCIÓN: handleFiltrarReporte
     Propósito: Generar datos aleatorios de consumo para la
                gráfica según los filtros seleccionados (año, mes).
     Parámetros: e - evento del formulario (submit)
     Comportamiento: Genera 12 valores aleatorios de consumo,
     aplica el filtro de mes si está seleccionado (pone en cero
     los meses no seleccionados) y actualiza los datos de la
     gráfica con los nuevos valores.
     ---------------------------------------------------------- */
  const handleFiltrarReporte = (e) => {
    // Prevenir la recarga de página del formulario
    e.preventDefault();
    // Generar array de 12 valores aleatorios entre 50 y 549 para simular consumo
    const valoresAleatoriosConsumo = Array.from({ length: 12 }, () => Math.floor(Math.random() * 500) + 50);

    // Si se seleccionó un mes específico, filtrar para solo mostrar ese mes
    if (filtroMes) {
      // Convertir el mes seleccionado a índice (0-11)
      const mesIndex = parseInt(filtroMes) - 1;
      // Poner en cero todos los meses que no coincidan con el seleccionado
      meses.forEach((_, idx) => {
        if (idx !== mesIndex) valoresAleatoriosConsumo[idx] = 0;
      });
    }

    // Actualizar el estado de la gráfica con los nuevos datos generados
    setDatosGrafica({
      // Mantener los labels de los 12 meses
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: [
        {
          label: `Métricas - Año ${filtroAnio}`, // Etiqueta dinámica con el año seleccionado
          data: valoresAleatoriosConsumo,         // Datos de consumo generados
          backgroundColor: '#f39c12',            // Color de relleno de las barras
          borderColor: '#e67e22',                // Color del borde de las barras
          borderWidth: 1,                        // Ancho del borde de las barras
        }
      ]
    });
  };

  /* ----------------------------------------------------------
     RENDERIZADO (JSX)
     Estructura visual completa de la página de reportes
     ---------------------------------------------------------- */
  return (
    <div className="dark-theme">
      {/* Barra de navegación superior con enlace para volver al menú admin */}
      <nav className="top-nav">
        <Link to="/dashboardadmin" className="no-text-decor">VOLVER MENÚ</Link>
      </nav>

      {/* Encabezado principal con logo, título y botones de sesión */}
      <header className="main-header">
        {/* Contenedor flex del encabezado */}
        <div className="header-container">
          {/* Celda del logo principal */}
          <div className="logo-principal-cell">
            {/* Contenedor del logo y título */}
            <div className="logo-principal">
              {/* Círculo contenedor de la imagen del logo */}
              <div className="logo-circle">
                {/* Imagen del logo de Kimuka */}
                <img src="../img/logo kimuka.png" alt="Logo" />
              </div>
              {/* Título de la página de reportes */}
              <h1>Kimuka - Reporte De Pedidos</h1>
            </div>
          </div>
          {/* Celda de acciones: nombre del admin y botón de cerrar sesión */}
          <div className="header-actions-cell">
            {/* Botón que muestra el nombre del administrador logueado */}
            <button className="btn-login">{adminName}</button>
            {/* Botón con enlace para cerrar la sesión del administrador */}
            <button className="btn-login">
              <Link to="/cierre-admin" className="no-text-decor">Cerrar Sesión</Link>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal de la página */}
      <main className="content-wrapper">
        {/* Imagen decorativa del panel de reportes */}
        <div className="img-principal">
          <img src="../img/panelDeReportes kk    .png" alt="Análisis Operativo" />
        </div>

        {/* Barra de herramientas con título de la sección */}
        <div className="toolbar">
          <h2 className="table-title">Reporte de pedidos / Materiales</h2>
        </div>

        {/* Panel de filtros del reporte con formulario de selección */}
        <div className="panel-gestion margin-b-20 panel-filtro-padding">
          {/* Formulario de filtros: año, mes e insumo */}
          <form className="grid-form form-reporte-grid" onSubmit={handleFiltrarReporte}>
            {/* Selector de año */}
            <div className="input-cell">
              {/* Etiqueta del selector de año */}
              <label>Seleccionar Año</label>
              {/* Selector de opciones para elegir el año del reporte */}
              <select value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)}>
                {/* Renderizar cada año disponible como opción */}
                {aniosDisponibles.map(anio => (
                  <option key={anio} value={anio}>{anio}</option>
                ))}
              </select>
            </div>
            {/* Selector de mes */}
            <div className="input-cell">
              {/* Etiqueta del selector de mes */}
              <label>Seleccionar Mes</label>
              {/* Selector de opciones para elegir el mes del reporte */}
              <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
                {/* Opción por defecto: todos los meses */}
                <option value="">-- Todos --</option>
                {/* Renderizar cada mes como opción del selector */}
                {meses.map(m => (
                  <option key={m.value} value={m.value}>{m.name}</option>
                ))}
              </select>
            </div>
            {/* Selector de insumo específico */}
            <div className="input-cell">
              {/* Etiqueta del selector de insumo */}
              <label>Insumo</label>
              {/* Selector de opciones para elegir un insumo específico */}
              <select value={filtroInsumo} onChange={(e) => setFiltroInsumo(e.target.value)}>
                {/* Opción por defecto: todos los insumos */}
                <option value="">-- Todos --</option>
                {/* Renderizar cada insumo como opción del selector */}
                {insumos.map(ins => (
                  <option key={ins.idInsumo} value={ins.idInsumo}>{ins.nombreInsumo}</option>
                ))}
              </select>
            </div>
            {/* Botón para generar la gráfica con los filtros seleccionados */}
            <button type="submit" className="btn-submit btn-reporte-submit">Generar Gráfica</button>
          </form>
        </div>

        {/* Panel de la gráfica de reporte */}
        <div className="panel-gestion contenedor-grafica-reporte">
          {/* Título de la gráfica */}
          <h3 className="table-title text-center margin-b-20 titulo-color-alerta">Métricas de Consolidado</h3>
          {/* Contenedor del canvas de Chart.js */}
          <div className="wrapper-canvas-chart">
            {/* Componente de gráfica de barras con configuración personalizada */}
            <Bar
              data={datosGrafica} // Datos de la gráfica (labels y datasets)
              options={{
                responsive: true,           // La gráfica se adapta al contenedor
                maintainAspectRatio: false, // No mantener proporción fija ( permite altura libre)
                plugins: {
                  legend: {
                    labels: { color: '#ffffff' } // Color blanco para las etiquetas de la leyenda
                  }
                },
                scales: {
                  x: {
                    grid: { color: '#333333' },   // Color de la cuadrícula del eje X
                    ticks: { color: '#ffffff' }    // Color blanco de las etiquetas del eje X
                  },
                  y: {
                    grid: { color: '#333333' },   // Color de la cuadrícula del eje Y
                    ticks: { color: '#ffffff' }    // Color blanco de las etiquetas del eje Y
                  }
                }
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// Exportar el componente como exportación por defecto
export default ReporteDePedidos;
