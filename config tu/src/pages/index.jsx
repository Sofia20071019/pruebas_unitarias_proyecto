// ============================================================================
// ARCHIVO: index.jsx (Página de inicio / Landing Page)
// PROPOSITO: Página principal pública de la aplicación que se muestra al
//            acceder a la raíz del sitio (/). Sirve como portal de entrada
//            que presenta los módulos principales del sistema ERP:
//            - Suministros (inventario de materia prima)
//            - Gestión de Pedidos (órdenes de producción)
//            - Control de Operarios (gestión de personal)
//            - Analítica (reportes y estadísticas)
//            Cada módulo tiene un enlace que redirige al login para acceder.
// ============================================================================

// Importa Link de React Router para crear enlaces de navegación SPA
// (sin recarga de página) entre las diferentes rutas de la aplicación
import { Link } from 'react-router-dom'; 

// Función componente que renderiza la página de inicio completa
function Inicio() {
  return (
    // Fragmento vacío (<>) para agrupar múltiples elementos sin nodos padre extra
    <>
      {/* Barra de navegación superior con el nombre del proyecto y año */}
      <nav className="top-nav">
        {/* Enlace a la raíz que muestra el nombre del proyecto */}
        <Link to="/">TITAN SPORTS 2026</Link>
      </nav>

      {/* Encabezado principal con logo y botón de acceso */}
      <header className="main-header">
        <div className="header-container">
          {/* Sección del logo: contiene el logo circular y el nombre */}
          <div className="logo-principal-cell">
            <div className="logo-principal">
              {/* Contenedor circular que enmarca la imagen del logo */}
              <div className="logo-circle">
                {/* Imagen del logo de Kimuka con texto alternativo para accesibilidad */}
                <img src="../img/logo kimuka.png" alt="Logo" />
              </div>
              {/* Título principal de la aplicación */}
              <h1>Kimuka ERP</h1>
            </div>
          </div>
          {/* Sección de acciones del header: botón de login */}
          <div className="header-actions-cell">
            {/* Botón de enlace que redirige a la página de inicio de sesión */}
            {/* La clase "btn-login" le da el estilo de botón personalizado */}
            <Link to="/login" className="btn-login">Ingresar</Link>
          </div>
        </div>
      </header>

      {/* Contenido principal de la página */}
      <main className="content-wrapper">
        {/* Título de la sección */}
        <h2 className="form-title text-center margin-b-10">Panel de Control General</h2>
        {/* Subtítulo descriptivo */}
        <p className="text-center color-secondary margin-b-40">Seleccione el módulo del sistema al que desea acceder</p>

        {/* Grid de tarjetas con los módulos principales del sistema */}
        <div className="card-grid">

          {/* Tarjeta: Módulo de Suministros */}
          <div className="panel-gestion module-card">
            <h3>Módulo de Suministros</h3>
            <p className="color-secondary font-size-sm margin-block-15">Administración de inventarios, telas y materias primas en stock.</p>
            {/* Enlace al login para acceder al módulo de inventario */}
            <Link to="/login" className="btn-login w-100">Abrir Inventario</Link>
          </div>

          {/* Tarjeta: Gestión de Pedidos */}
          <div className="panel-gestion module-card">
            <h3>Gestión de Pedidos</h3>
            <p className="color-secondary font-size-sm margin-block-15">Control de solicitudes de confección, clientes y estados de entrega.</p>
            {/* Enlace al login para acceder al módulo de pedidos */}
            <Link to="/login" className="btn-login w-100">Ver Pedidos</Link>
          </div>

          {/* Tarjeta: Control de Operarios */}
          <div className="panel-gestion module-card">
            <h3>Control de Operarios</h3>
            <p className="color-secondary font-size-sm margin-block-15">Gestión de talento humano, registros de ingresos y horas trabajadas.</p>
            {/* Enlace al login para acceder al módulo de personal */}
            <Link to="/login" className="btn-login w-100">Administrar Personal</Link>
          </div>

          {/* Tarjeta: Módulo de Analítica */}
          <div className="panel-gestion module-card">
            <h3>Módulo de Analítica</h3>
            <p className="color-secondary font-size-sm margin-block-15">Reportes de rendimiento, gráficos analíticos y balances mensuales.</p>
            {/* Enlace directo al registro de personal (acceso al dashboard) */}
            <Link to="/registro-personal" className="btn-login w-100">Ver Dashboard</Link>
          </div>

        </div>
      </main>
    </>
  );
}

// Exporta el componente como exportación por defecto
export default Inicio;
