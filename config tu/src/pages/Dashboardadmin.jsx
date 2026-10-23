// ============================================================================
// ARCHIVO: Dashboardadmin.jsx (Dashboard del administrador)
// PROPOSITO: Panel de control principal del usuario administrador (ROL-001).
//            Muestra un grid de tarjetas con acceso rápido a todos los módulos
//            de administración disponibles:
//              - Gestión de empleados
//              - Inventario de materias primas
//              - Panel de reportes
//              - Horas de empleados
//              - Gestión de pagos
//              - Asignación de materiales
//              - Tareas de empleados
//            También muestra el nombre del administrador logueado y un botón
//            para cerrar sesión.
// ============================================================================

// Importa Link de React Router para crear enlaces SPA entre módulos
import { Link } from 'react-router-dom';
// Importa useState para el estado local
import { useState } from 'react';

// Función componente que renderiza el dashboard del administrador
function Dashboardadmin() {
    // Estado local para almacenar y mostrar el nombre del administrador logueado
    // Se inicializa de forma perezosa desde localStorage para no depender de un
    // setState dentro del useEffect (evita lint set-state-in-effect)
    const [adminName] = useState(() => {
        const nombreSesion = localStorage.getItem('kimuka_sesion_activa');
        return nombreSesion ? nombreSesion.toUpperCase() : 'ADMINISTRADOR';
    });

    return (
        <div className="dark-theme">

            {/* Barra de navegación superior con enlace de "INICIO" */}
            <nav className="top-nav">
                {/* Enlace que permanece en el dashboard del admin al hacer clic */}
                <Link to="/dashboardadmin" className="no-text-decor">INICIO</Link>
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
                    {/* Sección derecha: nombre del admin y botón de cerrar sesión */}
                    <div className="header-actions-cell">
                        <div className="flex-row-gap-10">
                            {/* Botón que muestra el nombre del administrador actual */}
                            <button className="btn-login">{adminName}</button>
                            {/* Botón de enlace que redirige a la página de cierre de sesión */}
                            <button className="btn-login">
                                <Link to="/cierre-admin">Cerrar Sesión</Link>
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
                    <h1 className="font-size-xl">Sistema de Gestión Interna</h1>
                    <h2 className="text-secondary">Titan Sports</h2>
                </div>

                {/* Título de la sección de módulos */}
                <h2 className="table-title margin-b-25">Módulos del sistema</h2>

                {/* Grid de tarjetas con los módulos de administración */}
                <div className="card-grid">

                    {/* Tarjeta 1: Gestión de empleados - permite listar, editar y administrar personal */}
                    <div className="panel-gestion module-card">
                        <div className="img-principal">
                            <img src="../img/horasDeEmpleado kk .png" alt="Gestión" />
                        </div>
                        <h2 className="margin-t-15">
                            {/* Enlace al módulo de gestión de empleados (ruta /empleados) */}
                            <Link to="/empleados" className="no-text-decor display-block">
                                Gestión de empleados
                            </Link>
                        </h2>
                    </div>
                    
                    {/* Tarjeta 2: Inventario de materias primas - gestiona stock de insumos textiles */}
                    <div className="panel-gestion module-card">
                        <div className="img-principal">
                            <img src="../img/inventarioDeMaterial kk .png" alt="Inventario" />
                        </div>
                        <h2 className="margin-t-15">
                            {/* Enlace al módulo de materia prima (ruta /materia-prima) */}
                            <Link to="/materia-prima" className="no-text-decor display-block">
                                Inventario De Materias Primas
                            </Link>
                        </h2>
                    </div>

                    {/* Tarjeta 3: Panel de reportes - estadísticas y métricas del negocio */}
                    <div className="panel-gestion module-card">
                        <div className="img-principal">
                            <img src="../img/panelAdministracion kk .png" alt="Reportes" />
                        </div>
                        <h2 className="margin-t-15">
                            {/* Enlace al hub de reportes del sistema (ruta /reportes) */}
                            <Link to="/reportes" className="no-text-decor display-block">
                                Panel De Reportes
                            </Link>
                        </h2>
                    </div>

                    {/* Tarjeta 4: Horas de empleados - visualiza y administra horas trabajadas */}
                    <div className="panel-gestion module-card">
                        <div className="img-principal">
                            <img src="../img/horasDeTrabajadores kk.png" alt="Horas" />
                        </div>
                        <h2 className="margin-t-15">
                            {/* Enlace al módulo de administración de horas (ruta /admin-horas) */}
                            <Link to="/admin-horas" className="no-text-decor display-block">
                                Horas de Empleados
                            </Link>
                        </h2>
                    </div>

                    {/* Tarjeta 5: Gestión de pagos - administra pagos a empleados */}
                    <div className="panel-gestion module-card">
                        <div className="img-principal">
                            <img src="../img/registroDePersonal kk .png" alt="Pagos" />
                        </div>
                        <h2 className="margin-t-15">
                            {/* Enlace al módulo de pagos (ruta /admin-pagos) */}
                            <Link to="/admin-pagos" className="no-text-decor display-block">
                                Gestión de Pagos
                            </Link>
                        </h2>
                    </div>

                    {/* Tarjeta 6: Asignar materiales - asigna insumos a empleados */}
                    <div className="panel-gestion module-card">
                        <div className="img-principal">
                            <img src="../img/inventarioDeMaterial kk .png" alt="Asignar" />
                        </div>
                        <h2 className="margin-t-15">
                            {/* Enlace al módulo de asignación de insumos (ruta /admin-asignar-insumos) */}
                            <Link to="/admin-asignar-insumos" className="no-text-decor display-block">
                                Asignar Materiales
                            </Link>
                        </h2>
                    </div>

                    {/* Tarjeta 7: Tareas de empleados - asigna y gestiona tareas de producción */}
                    <div className="panel-gestion module-card">
                        <div className="img-principal">
                            <img src="../img/horasDeEmpleado kk .png" alt="Tareas" />
                        </div>
                        <h2 className="margin-t-15">
                            {/* Enlace al módulo de tareas de empleados (ruta /admin-tareas-empleados) */}
                            <Link to="/admin-tareas-empleados" className="no-text-decor display-block">
                                Tareas de Empleados
                            </Link>
                        </h2>
                    </div>
                    {/* Tarjeta 8: Catálogo de Moldes - Gestión de patrones y tallas */}
                    <div className="panel-gestion module-card">
                        <div className="img-principal">
                            {/* Puedes usar una imagen existente de tu carpeta img o una alegórica */}
                            <img src="../img/panelAdministracion kk .png" alt="Moldes" />
                        </div>
                        <h2 className="margin-t-15">
                            {/* Enlace al módulo de moldes (ruta /moldes) */}
                            <Link to="/moldes" className="no-text-decor display-block">
                                Catálogo de Moldes
                            </Link>
                        </h2>
                    </div>

                </div>
            </main>
        </div>
    );
}

// Exporta el componente como exportación por defecto para ser usado en App.jsx
export default Dashboardadmin;
