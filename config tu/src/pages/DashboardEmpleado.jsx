// ============================================================================
// ARCHIVO: DashboardEmpleado.jsx (Dashboard del empleado)
// PROPOSITO: Panel de control principal del usuario empleado (ROL-002).
//            Muestra un grid de tarjetas con acceso rápido a los módulos
//            disponibles para empleados:
//              - Inventario de materiales (solo lectura)
//              - Mis horas trabajadas (historial personal)
//              - Mis materiales (tareas/insumos asignados)
//            También muestra el nombre del empleado logueado y un botón
//            para cerrar sesión (que incluye cierre de jornada laboral).
// ============================================================================

// Importa Link de React Router para crear enlaces SPA entre módulos
import { Link } from 'react-router-dom';
// Importa useState para el estado local
import { useState } from 'react';

// Función componente que renderiza el dashboard del empleado
function DashboardEmpleado() {
    // Estado local para almacenar y mostrar el nombre del empleado logueado
    // Se inicializa de forma perezosa desde localStorage para no depender de un
    // setState dentro del useEffect (evita lint set-state-in-effect)
    const [empleadoName] = useState(() => {
        const nombreSesion = localStorage.getItem('kimuka_sesion_activa');
        return nombreSesion ? nombreSesion.toUpperCase() : 'EMPLEADO';
    });

    return (
        <div className="dark-theme">

            {/* Barra de navegación superior con enlace de "INICIO" */}
            <nav className="top-nav">
                {/* Enlace que permanece en el dashboard del empleado al hacer clic */}
                <Link to="/dashboard-empleado" className="no-text-decor">INICIO</Link>
            </nav>

            {/* Encabezado con logo, nombre de usuario y botón de cerrar sesión */}
            <header className="main-header">
                <div className="header-container">
                    {/* Sección izquierda: logo y nombre de la empresa */}
                    <div className="logo-principal-cell">
                        <div className="logo-principal">
                            {/* Logo circular con imagen */}
                            <div className="logo-circle">
                                <img src="../img/logo kimuka.png" alt="Logo Kimuka" />
                            </div>
                            {/* Nombre de la marca */}
                            <h1>Kimuka</h1>
                        </div>
                    </div>
                    {/* Sección derecha: nombre del empleado y botón de cerrar sesión */}
                    <div className="header-actions-cell">
                        <div className="flex-row-gap-10">
                            {/* Botón que muestra el nombre del empleado actual */}
                            <button className="btn-login">{empleadoName}</button>
                            {/* Botón de enlace que redirige a la página de cierre de sesión */}
                            {/* Esta página también incluye el formulario de cierre de jornada */}
                            <button className="btn-login">
                                <Link to="/cierre-empleado">Cerrar Sesión</Link>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Contenido principal del dashboard */}
            <main className="content-wrapper">

                {/* Imagen de portada/banner del dashboard */}
                <div className="img-principal">
                    <img src="../img/portada kk .jpg" alt="Dashboard Hero" />
                </div>

                {/* Título y subtítulo del dashboard */}
                <div className="text-center margin-b-40">
                    <h1 className="font-size-xl">Panel de Empleado</h1>
                    <h2 className="text-secondary">Titan Sports</h2>
                </div>

                {/* Título de la sección de módulos */}
                <h2 className="table-title margin-b-25">Módulos disponibles</h2>

                {/* Grid de tarjetas con los módulos disponibles para empleados */}
                <div className="card-grid">

                    {/* Tarjeta 1: Inventario de materiales - vista de lectura del stock */}
                    <div className="panel-gestion module-card">
                        <div className="img-principal">
                            <img src="../img/inventarioDeMaterial kk .png" alt="Inventario" />
                        </div>
                        <h2 className="margin-t-15">
                            {/* Enlace al módulo de inventario del empleado (ruta /inventario-empleado) */}
                            <Link to="/inventario-empleado" className="no-text-decor display-block">
                                Inventario de Materiales
                            </Link>
                        </h2>
                    </div>

                    {/* Tarjeta 2: Mis horas trabajadas - historial de jornadas laborales */}
                    <div className="panel-gestion module-card">
                        <div className="img-principal">
                            <img src="../img/horasDeTrabajadores kk.png" alt="Mis Horas" />
                        </div>
                        <h2 className="margin-t-15">
                            {/* Enlace al módulo de historial de horas del empleado (ruta /mis-horas) */}
                            <Link to="/mis-horas" className="no-text-decor display-block">
                                Mis Horas Trabajadas
                            </Link>
                        </h2>
                    </div>

                    {/* Tarjeta 3: Mis materiales - tareas e insumos asignados al empleado */}
                    <div className="panel-gestion module-card">
                        <div className="img-principal">
                            <img src="../img/registroDePersonal kk .png" alt="Tareas" />
                        </div>
                        <h2 className="margin-t-15">
                            {/* Enlace al módulo de tareas/asignaciones del empleado (ruta /mis-tareas) */}
                            <Link to="/mis-tareas" className="no-text-decor display-block">
                                Mis Materiales
                            </Link>
                        </h2>
                    </div>

                </div>
            </main>
        </div>
    );
}

// Exporta el componente como exportación por defecto para ser usado en App.jsx
export default DashboardEmpleado;
