/**
 * ======================================================================
 * ARCHIVO: Panelreportes.jsx
 * PROPOSITO: Componente de página que actúa como HUB (centro de acceso)
 *            del módulo de estadísticas y reportes del sistema Kimuka.
 *            Presenta un grid de tarjetas que enlazan a cada uno de los
 *            reportes disponibles: Materias Primas, Horas Trabajadas,
 *            Trabajos Más Realizados y Producción.
 * ======================================================================
 */

/* Importación de Link de react-router-dom para navegación entre rutas */
import { Link } from 'react-router-dom';

/* Importación de hooks de React: useState para estado local */
import { useState } from 'react';

/* Definición del componente funcional PanelReportes */
function PanelReportes() {

    /* ---------- ESTADOS DEL COMPONENTE ---------- */

    /* Nombre del administrador logueado, se obtiene del localStorage.
       Se inicializa de forma perezosa desde localStorage para no depender
       de un setState dentro del useEffect (evita lint set-state-in-effect) */
    const [adminName] = useState(() => {
        const nombreSesion = localStorage.getItem('kimuka_sesion_activa');
        return nombreSesion ? nombreSesion.toUpperCase() : 'ADMINISTRADOR';
    });

    /* Definición de las tarjetas de acceso a cada reporte del sistema */
    const reportes = [
        {
            ruta: '/reporte-materias-primas',
            imagen: '../img/inventarioDeMaterial kk .png',
            alt: 'Materias Primas',
            titulo: 'Reporte de Materias Primas',
            descripcion: 'Inventario, stock disponible y estado de los materiales textiles.'
        },
        {
            ruta: '/reporte-horas',
            imagen: '../img/horasDeTrabajadores kk.png',
            alt: 'Horas Trabajadas',
            titulo: 'Reporte de Horas Trabajadas',
            descripcion: 'Jornadas laborales, horas trabajadas y detalle por empleado.'
        },
        {
            ruta: '/reporte-trabajos',
            imagen: '../img/horasDeEmpleado kk .png',
            alt: 'Trabajos Más Realizados',
            titulo: 'Trabajos Más Realizados',
            descripcion: 'Materiales más asignados y empleados más activos del sistema.'
        },
        {
            ruta: '/reporte-produccion',
            imagen: '../img/reporteDePedidos kk .png',
            alt: 'Producción',
            titulo: 'Reporte de Producción',
            descripcion: 'Órdenes de producción, unidades fabricadas por producto y por mes.'
        }
    ];

    /* ---------- RENDERIZADO DEL COMPONENTE ---------- */

    return (
        /* Contenedor principal con tema oscuro */
        <div className="dark-theme">

            {/* Barra de navegación superior */}
            <nav className="top-nav">
                {/* Enlace para volver al panel de administración */}
                <Link to="/dashboardadmin" className="no-text-decor">VOLVER</Link>
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
                            <h1>Panel de Reportes</h1>
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
                    <h2 className="font-size-xl">Módulo de Estadísticas y Reportes</h2>
                    {/* Subtítulo descriptivo */}
                    <p className="text-secondary">Seleccione el reporte que desea consultar en el sistema Kimuka.</p>
                </div>

                {/* Grid de tarjetas con acceso a cada reporte */}
                <div className="card-grid">
                    {/* Mapear cada reporte como una tarjeta de acceso */}
                    {reportes.map((r) => (
                        <div key={r.ruta} className="panel-gestion module-card">
                            {/* Imagen representativa del reporte */}
                            <div className="img-principal">
                                <img src={r.imagen} alt={r.alt} />
                            </div>
                            {/* Título con enlace al reporte */}
                            <h2 className="margin-t-15">
                                <Link to={r.ruta} className="no-text-decor display-block">
                                    {r.titulo}
                                </Link>
                            </h2>
                            {/* Descripción del reporte */}
                            <p className="text-secondary font-size-sm margin-t-10">{r.descripcion}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

/* Exportación del componente como exportación por defecto */
export default PanelReportes;
