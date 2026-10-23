/**
 * ======================================================================
 * ARCHIVO: cierreDeSesionAdministrador.jsx
 * PROPOSITO: Componente de página que muestra una confirmación de cierre
 *            de sesión para el administrador. Presenta un mensaje de
 *            confirmación con el nombre del administrador, informa que
 *            se guardarán los cambios pendientes en el servidor, y ofrece
 *            dos opciones: permanecer en la sesión o confirmar la salida.
 *            Al confirmar la salida, limpia todos los datos de sesión del
 *            localStorage y sessionStorage, y redirige al login.
 * ======================================================================
 */

/* Importación de Link para navegación y useNavigate para redirección
   programática después del cierre de sesión */
import { Link, useNavigate } from 'react-router-dom';

/* Importación de hooks de React: useState para estado local */
import { useState } from 'react';

/* Definición del componente funcional CierreDeSesionAdministrador */
function CierreDeSesionAdministrador() {

    /* Hook useNavigate para redirigir al usuario después del cierre de sesión */
    const navigate = useNavigate();

    /* Nombre del administrador logueado, se obtiene del localStorage
       y se muestra en el mensaje de confirmación.
       Se inicializa de forma perezosa desde localStorage para no depender
       de un setState dentro del useEffect (evita lint set-state-in-effect) */
    const [adminName] = useState(() => {
        /* Obtener el objeto de usuario logueado desde localStorage */
        const usuarioLogueado = localStorage.getItem('usuarioLogueado');
        /* Obtener el nombre de sesión activa como alternativa */
        const nombreSesion = localStorage.getItem('kimuka_sesion_activa');

        /* Si existe el usuario logueado, usar su nombre */
        if (usuarioLogueado) {
            /* Parsear el objeto de usuario desde JSON */
            const user = JSON.parse(usuarioLogueado);
            /* Si el usuario tiene nombre, mostrarlo en mayúsculas */
            if (user.nombre) return user.nombre.toUpperCase();
        }
        /* Si no hay usuario logueado pero hay sesión activa, usar ese nombre */
        return nombreSesion ? nombreSesion.toUpperCase() : 'ADMINISTRADOR';
    });

    /* ---------- FUNCIONES MANEJADORAS ---------- */

    /**
     * handleCierreSesion
     * Propósito: Ejecuta el cierre de sesión del administrador.
     *            Elimina todas las claves de sesión del localStorage
     *            (kimuka_sesion_activa, usuarioLogueado, token) y
     *            limpia el sessionStorage. Luego redirige al login
     *            usando navigate con replace para evitar navegación
     *            hacia atrás.
     */
    const handleCierreSesion = () => {
        /* Eliminar la clave de sesión activa del localStorage */
        localStorage.removeItem('kimuka_sesion_activa');
        /* Eliminar los datos del usuario logueado del localStorage */
        localStorage.removeItem('usuarioLogueado');
        /* Eliminar el token de autenticación del localStorage */
        localStorage.removeItem('token');
        /* Limpiar todo el almacenamiento de sesión */
        sessionStorage.clear();
        /* Redirigir al login reemplazando la entrada en el historial
           para que no se pueda volver con el botón de retroceso */
        navigate('/login', { replace: true });
    };

    /* ---------- RENDERIZADO DEL COMPONENTE ---------- */

    return (
        /* Fragmento React (<>...</>) para agrupar elementos sin div extra */
        <>

            {/* Barra de navegación superior */}
            <nav className="top-nav">
                {/* Enlace para cancelar el cierre y volver al dashboard */}
                <Link to="/dashboardadmin" className="no-text-decor">CANCELAR ACCIÓN</Link>
            </nav>

            {/* Contenido principal centrado */}
            <main className="content-wrapper flex-center">
                {/* Panel de confirmación con ancho máximo de 550px */}
                <div className="panel-registro max-w-550 text-center display-block">
                    {/* Título de confirmación con el nombre del admin */}
                    <h2 className="form-title margin-b-15">¿Cerrar Sesión de {adminName}?</h2>
                    {/* Mensaje informativo sobre el cierre de sesión */}
                    <p className="text-muted margin-b-35">
                        Se guardarán todos los cambios pendientes en el servidor del inventario textil y las bitácoras operativas.
                    </p>

                    {/* Contenedor de botones de acción centrados */}
                    {/* Clases CSS para layout flex con gap y centrado */}
                    <div className="flex-row-gap-10 container-actions-center">
                        {/* Botón "Permanecer": mantiene la sesión activa */}
                        <button className="btn-login" id="btn-permanecer">
                            {/* Enlace que redirige al dashboard del admin */}
                            <Link to="/dashboardadmin" className="no-text-decor">Permanecer</Link>
                        </button>
                        {/* Botón "Confirmar Salida": ejecuta el cierre de sesión */}
                        <button
                            className="btn-submit btn-alert-color"
                            id="btn-confirmar-salida"
                            /* Al hacer clic, ejecuta la función de cierre de sesión */
                            onClick={handleCierreSesion}
                        >
                            {/* Texto del botón */}
                            Confirmar Salida
                        </button>
                    </div>
                </div>
            </main>
        </> /* Fin del fragmento */
    );
}

/* Exportación del componente como exportación por defecto */
export default CierreDeSesionAdministrador;
