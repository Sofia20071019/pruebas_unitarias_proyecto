// ============================================================================
// ARCHIVO: App.jsx (Componente raíz de la aplicación)
// PROPOSITO: Componente principal que configura el enrutamiento de toda la
//            aplicación React. Define todas las rutas disponibles, las protege
//            con autenticación/autorización, y renderiza los componentes
//            globales (Header, Nav, Footer) que aparecen en todas las páginas.
//            También implementa la lógica de protección de rutas con el
//            componente RutaProtegida que verifica sesión y rol del usuario.
// ============================================================================

// Importa componentes del enrutador de React Router v7:
//   - BrowserRouter: envuelve la app para usar el historial del navegador (HTML5 History API)
//   - Routes: contenedor de todas las definiciones de rutas (similar a un switch)
//   - Route: define una ruta individual mapeando URL → componente
//   - Navigate: componente de redirección programática
//   - useLocation: hook para obtener la ubicación/URL actual
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// Importa useEffect para ejecutar efectos secundarios (listeners de eventos del navegador)
import { useEffect } from 'react';

// Importa los componentes de layout que aparecen en todas las páginas
import Header from './components/Header';   // Encabezado de la aplicación
import Nav from './components/Nav';         // Barra de navegación
import Footer from './components/Footer';   // Pie de página

// ============================================================================
// IMPORTACIÓN DE TODAS LAS PÁGINAS (componentes de ruta)
// ============================================================================

// Página de inicio / landing page (público)
import VistaInicio from './pages/index';
// Registro de personal nuevo (solo administradores)
import RegistroDePersonal from './pages/RegistroDePersonal';
// Página de inicio de sesión (público)
import InicioDeSesion from './pages/InicioDeSesion';
// Página de recuperación de contraseña (público)
import RecuperarContrasena from './pages/RecuperarContrasena';
// Gestión de pedidos/órdenes de producción (solo administradores)
import GestionDePedidos from './pages/GestionDePedidos';
// Inventario de materia prima (solo administradores)
import MateriaPrima from './pages/MateriaPrima';
// Registro de horas trabajadas - entrada de jornada (empleados)
import RegistroDeHoras from './pages/RegistroDeHoras';
// Reporte de pedidos realizados (solo administradores)
import ReporteDePedidos from './pages/ReporteDePedidos';
// Página de confirmación de cierre de sesión del administrador
import CierreDeSesionAdministrador from './pages/cierreDeSesionAdministrador';
// Página de cierre de sesión del empleado (incluye cierre de jornada)
import CierreDeSesionEmpleado from './pages/cierreDeSesionEmpleado';
// Edición de datos de un empleado específico (solo administradores)
import Editarempleados from './pages/Editarempleados';
// Aprobación de pagos a empleados (solo administradores)
import Aprobarpago from './pages/Aprobarpago';
// Dashboard principal del administrador (panel de control)
import Dashboardadmin from './pages/Dashboardadmin';
// Gestión y listado de empleados (solo administradores)
import GestionEmpleados from './pages/GestionEmpleados';
// Panel de reportes y estadísticas (hub de reportes, solo administradores)
import PanelReportes from './pages/Panelreportes';
// Reporte de materias primas (inventario, solo administradores)
import ReporteMateriasPrimas from './pages/ReporteMateriasPrimas';
// Reporte de horas trabajadas (solo administradores)
import ReporteHoras from './pages/ReporteHoras';
// Reporte de trabajos más realizados (solo administradores)
import ReporteTrabajos from './pages/ReporteTrabajos';
// Reporte de producción (solo administradores)
import ReporteProduccion from './pages/ReporteProduccion';
// Dashboard del empleado (panel personal del trabajador)
import DashboardEmpleado from './pages/DashboardEmpleado';
// Inventario de materia prima visto por el empleado (solo lectura)
import InventarioEmpleado from './pages/InventarioEmpleado';
// Historial de horas trabajadas del empleado (solo empleados)
import MisHoras from './pages/MisHoras';
// Panel de administración de horas de todos los empleados (solo administradores)
import AdminHoras from './pages/AdminHoras';
// Panel de administración de pagos (solo administradores)
import AdminPagos from './pages/AdminPagos';
// Asignación de insumos a empleados por parte del administrador
import AdminAsignarInsumos from './pages/AdminAsignarInsumos';
// Vista de tareas asignadas al empleado (solo empleados)
import EmpleadoTareas from './pages/EmpleadoTareas';
// Gestión de tareas para empleados por parte del administrador
import AdminTareasEmpleados from './pages/AdminTareasEmpleados';
// Catálogo y gestión de moldes (Administradores y Empleados)
import MoldesPage from './pages/MoldesPage';


// ============================================================================
// COMPONENTE: RutaProtegida
// ============================================================================
// Componente de orden superior (HOC) que envuelve cualquier componente hijo
// y verifica que el usuario tenga una sesión activa y el rol adecuado antes
// de permitir el acceso. Si la verificación falla, redirige a /login.
//
// PROTECCIÓN CONTRA BOTÓN ATRÁS DEL NAVEGADOR:
// Implementa un listener del evento 'popstate' que se dispara cuando el
// usuario navega con las flechas del navegador. Si detecta que no hay sesión
// activa, ejecuta window.location.replace('/login') que es un redirect
// a nivel de navegador que reemplaza la entrada en el historial, impidiendo
// que el usuario vuelva atrás a una página protegida.
//
// Props:
//   - children: el componente hijo que se renderizará si la verificación es exitosa
//   - rolRequerido: (opcional) string con el ID del rol requerido (ej: 'ROL-001')
//                   Si no se especifica, cualquier usuario autenticado puede acceder
// ============================================================================
const RutaProtegida = ({ children, rolRequerido }) => {
  // Obtiene la ubicación actual del navegador para re-ejecutar el efecto
  // cada vez que la ruta cambia
  const location = useLocation();

  // ---------------------------------------------------------------------------
  // Efecto secundario: Listener de eventos del navegador
  // ---------------------------------------------------------------------------
  // Se ejecuta cada vez que location.pathname o rolRequerido cambian.
  // Su propósito es detectar navegación retrocedida (flecha atrás) y
  // verificar que la sesión siga siendo válida.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Función interna que verifica si hay una sesión activa
    const verificarSesion = () => {
      // Verifica si existe algún indicador de sesión en localStorage
      const sesionActiva = localStorage.getItem('kimuka_sesion_activa') || localStorage.getItem('usuarioLogueado');
      // Si no hay sesión, redirige al login usando reemplazo de historial del navegador
      // window.location.replace() es más agresivo que <Navigate> porque opera
      // a nivel del navegador, no solo de React Router
      if (!sesionActiva) {
        window.location.replace('/login');
        return;
      }

      // Si se requiere un rol específico, verifica que el usuario lo tenga
      if (rolRequerido) {
        let usuario;
        try {
          // Intenta parsear el objeto usuario guardado en localStorage
          usuario = JSON.parse(localStorage.getItem('usuarioLogueado'));
        } catch {
          // Si el JSON está corrupto, redirige al login
          window.location.replace('/login');
          return;
        }
        // Verifica que el usuario tenga el rol requerido para acceder a esta ruta
        if (!usuario || usuario.idRol !== rolRequerido) {
          window.location.replace('/login');
          return;
        }
      }
    };

    // Handler para el evento popstate (disparado por flechas del navegador)
    // Cuando el usuario presiona "atrás", este handler intercepta y verifica
    // que la sesión siga activa antes de permitir la navegación
    const handlePopState = () => {
      verificarSesion();
    };

    // Registra el listener de eventos en la ventana del navegador
    window.addEventListener('popstate', handlePopState);

    // Ejecuta la verificación inmediatamente al montar o cambiar de ruta
    verificarSesion();

    // Función de limpieza: elimina el listener cuando el componente se desmonta
    // o cuando cambian las dependencias del efecto, previniendo memory leaks
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [rolRequerido, location.pathname]); // Dependencias: se re-ejecuta al cambiar de ruta o rol

  // ---------------------------------------------------------------------------
  // Renderizado condicional (síncrono, durante el render):
  // Esta verificación se ejecuta en cada render del componente como primera
  // línea de defensa. El useEffect + popstate es una segunda línea de defensa
  // para navegación retrocedida.
  // ---------------------------------------------------------------------------

  // Verifica si hay sesión activa al momento del render
  const sesionActiva = localStorage.getItem('kimuka_sesion_activa') || localStorage.getItem('usuarioLogueado');
  // Si no hay sesión, redirige a /login usando React Router (reemplaza la ruta actual)
  if (!sesionActiva) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico, verifica que el usuario lo tenga
  if (rolRequerido) {
    let usuario;
    try {
      usuario = JSON.parse(localStorage.getItem('usuarioLogueado'));
    } catch {
      // JSON corrupto → redirigir al login
      return <Navigate to="/login" replace />;
    }
    // Si el usuario no existe o no tiene el rol requerido → redirigir al login
    if (!usuario || usuario.idRol !== rolRequerido) {
      return <Navigate to="/login" replace />;
    }
  }

  // Si todas las verificaciones pasan, renderiza el contenido protegido
  return children;
};


// ============================================================================
// COMPONENTE: App (Raíz de la aplicación)
// ============================================================================
// Componente principal que configura toda la estructura de rutas de la app.
// Utiliza BrowserRouter para habilitar la navegación SPA (Single Page Application).
// Renderiza componentes globales (Header, Nav, Footer) que persisten en todas las rutas.
// ============================================================================
function App() {
  return (
    <BrowserRouter>
      {/* Header: barra superior de navegación visible en todas las páginas */}
      <Header />
      {/* Nav: menú de navegación principal visible en todas las páginas */}
      <Nav />

      {/* Contenedor de todas las definiciones de rutas de la aplicación */}
      <Routes>
        {/* ================================================================= */}
        {/* RUTAS PÚBLICAS (no requieren autenticación) */}
        {/* ================================================================= */}

        {/* Ruta raíz: página de inicio / landing page */}
        <Route path="/" element={<VistaInicio />} />

        {/* Página de inicio de sesión: formulario de email y contraseña */}
        <Route path="/login" element={<InicioDeSesion />} />

        {/* Página de recuperación de contraseña: formulario para solicitar restablecimiento */}
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />

        {/* ================================================================= */}
        {/* RUTAS PROTEGIDAS - ADMINISTRADOR (ROL-001) */}
        {/* ================================================================= */}

        {/* Registro de nuevo personal: formulario para crear empleados */}
        <Route path="/registro-personal" element={<RutaProtegida rolRequerido="ROL-001"><RegistroDePersonal /></RutaProtegida>} />

        {/* Gestión de materia prima: inventario de insumos textiles (telas, hilos, etc.) */}
        <Route path="/materia-prima" element={<RutaProtegida rolRequerido="ROL-001"><MateriaPrima /></RutaProtegida>} />

        {/* Gestión de pedidos: creación y administración de órdenes de producción */}
        <Route path="/gestion-pedidos" element={<RutaProtegida rolRequerido="ROL-001"><GestionDePedidos /></RutaProtegida>} />

        {/* Reporte de pedidos: vista detallada de pedidos con filtros y estados */}
        <Route path="/reporte-pedidos" element={<RutaProtegida rolRequerido="ROL-001"><ReporteDePedidos /></RutaProtegida>} />

        {/* Registro de horas: entrada de jornada laboral (accesible por cualquier usuario logueado) */}
        <Route path="/registro-horas" element={<RutaProtegida><RegistroDeHoras /></RutaProtegida>} />

        {/* Dashboard del administrador: panel de control con accesos rápidos a todas las funciones */}
        <Route path='/dashboardadmin' element={<RutaProtegida rolRequerido="ROL-001"><Dashboardadmin /></RutaProtegida>} />

        {/* Gestión de empleados: listado, búsqueda y administración de todo el personal */}
        <Route path='/empleados' element={<RutaProtegida rolRequerido="ROL-001"><GestionEmpleados /></RutaProtegida>} />

        {/* Panel de reportes: hub con acceso a todos los reportes del negocio */}
        <Route path='/reportes' element={<RutaProtegida rolRequerido="ROL-001"><PanelReportes /></RutaProtegida>} />

        {/* Reporte de materias primas: inventario y stock de materiales */}
        <Route path='/reporte-materias-primas' element={<RutaProtegida rolRequerido="ROL-001"><ReporteMateriasPrimas /></RutaProtegida>} />

        {/* Reporte de horas trabajadas: jornadas y horas por empleado */}
        <Route path='/reporte-horas' element={<RutaProtegida rolRequerido="ROL-001"><ReporteHoras /></RutaProtegida>} />

        {/* Reporte de trabajos más realizados: materiales y empleados más activos */}
        <Route path='/reporte-trabajos' element={<RutaProtegida rolRequerido="ROL-001"><ReporteTrabajos /></RutaProtegida>} />

        {/* Reporte de producción: órdenes y unidades fabricadas */}
        <Route path='/reporte-produccion' element={<RutaProtegida rolRequerido="ROL-001"><ReporteProduccion /></RutaProtegida>} />

        {/* Edición de empleado: formulario para modificar datos de un empleado específico */}
        {/* :id es un parámetro dinámico que captura el ID del empleado a editar */}
        <Route path='/editarempleados/:id' element={<RutaProtegida rolRequerido="ROL-001"><Editarempleados /></RutaProtegida>} />

        {/* Aprobación de pagos: revisar y aprobar/rechazar pagos pendientes a empleados */}
        <Route path='/aprobarpago' element={<RutaProtegida rolRequerido="ROL-001"><Aprobarpago /></RutaProtegida>} />

        {/* Administración de horas: ver y gestionar las horas trabajadas de todos los empleados */}
        <Route path='/admin-horas' element={<RutaProtegida rolRequerido="ROL-001"><AdminHoras /></RutaProtegida>} />

        {/* Administración de pagos: listar y gestionar todos los pagos realizados */}
        <Route path='/admin-pagos' element={<RutaProtegida rolRequerido="ROL-001"><AdminPagos /></RutaProtegida>} />

        {/* Asignación de insumos: asignar materia prima a empleados para producción */}
        <Route path='/admin-asignar-insumos' element={<RutaProtegida rolRequerido="ROL-001"><AdminAsignarInsumos /></RutaProtegida>} />

        {/* Administración de tareas: asignar y gestionar tareas de producción para empleados */}
        <Route path='/admin-tareas-empleados' element={<RutaProtegida rolRequerido="ROL-001"><AdminTareasEmpleados /></RutaProtegida>} />

        {/* ================================================================= */}
        {/* RUTAS PROTEGIDAS - EMPLEADO (ROL-002) */}
        {/* ================================================================= */}

        {/* Dashboard del empleado: panel personal con accesos a sus funciones */}
        <Route path='/dashboard-empleado' element={<RutaProtegida rolRequerido="ROL-002"><DashboardEmpleado /></RutaProtegida>} />

        {/* Inventario del empleado: vista de lectura del inventario de materia prima */}
        <Route path='/inventario-empleado' element={<RutaProtegida rolRequerido="ROL-002"><InventarioEmpleado /></RutaProtegida>} />

        {/* Mis horas: historial personal de horas trabajadas del empleado */}
        <Route path='/mis-horas' element={<RutaProtegida rolRequerido="ROL-002"><MisHoras /></RutaProtegida>} />

        {/* Mis tareas: lista de tareas asignadas al empleado actual */}
        <Route path='/mis-tareas' element={<RutaProtegida rolRequerido="ROL-002"><EmpleadoTareas /></RutaProtegida>} />

        {/* Rutas duplicadas (probablemente sobrantes del desarrollo) */}
        <Route path='/inventario-empleado' element={<RutaProtegida rolRequerido="ROL-002"><InventarioEmpleado /></RutaProtegida>} />
        <Route path='/mis-horas' element={<RutaProtegida rolRequerido="ROL-002"><MisHoras /></RutaProtegida>} />

        {/* ================================================================= */}
        {/* RUTAS DE CIERRE DE SESIÓN (protegidas por rol) */}
        {/* ================================================================= */}

        {/* Confirmación de cierre de sesión del administrador */}
        <Route path="/cierre-admin" element={<RutaProtegida rolRequerido="ROL-001"><CierreDeSesionAdministrador /></RutaProtegida>} />

        {/* Cierre de sesión del empleado (incluye formulario de cierre de jornada) */}
        <Route path="/cierre-empleado" element={<RutaProtegida rolRequerido="ROL-002"><CierreDeSesionEmpleado /></RutaProtegida>} />

        {/* ================================================================= */}
        {/* RUTA CATCH-ALL: PÁGINA 404 */}
        {/* ================================================================= */}
        {/* Cualquier URL que no coincida con las rutas anteriores muestra esta página */}
        {/* El asterisco (*) es un comodín que captura cualquier ruta no definida */}
        <Route path="*" element={
          <main className="content-wrapper text-center">
            <h2>404 - Página no encontrada</h2>
            <p className="text-secondary">La ruta solicitada no existe.</p>
            <a href="/" className="btn-login">Volver al inicio</a>
          </main>
        } />

        {/* ================================================================= */}
        {/* MÓDULO DE MOLDES (Acceso para usuarios autenticados) */}
        {/* ================================================================= */}
        <Route 
          path="/moldes" 
          element={
            <RutaProtegida>
              <MoldesPage />
            </RutaProtegida>
          } 
        />
      </Routes>

      {/* Footer: pie de página visible en todas las páginas */}
      <Footer />
    </BrowserRouter>
  );
}

// Exporta el componente App como componente principal (default export)
// para que main.jsx pueda importarlo y renderizarlo
export default App;
