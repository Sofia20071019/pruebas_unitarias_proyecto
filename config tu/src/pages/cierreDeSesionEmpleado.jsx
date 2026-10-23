/**
 * ======================================================================
 * ARCHIVO: cierreDeSesionEmpleado.jsx
 * PROPOSITO: Componente de página que permite al empleado cerrar su
 *            jornada de trabajo y cerrar sesión. Al montar, obtiene la
 *            fecha y hora actual, el nombre del empleado logueado, y
 *            busca la jornada activa del empleado en la API. Presenta
 *            un formulario con los campos de hora de fin y fecha, y al
 *            enviar, finaliza la jornada en la API (registrando la hora
 *            de salida), limpia los datos de sesión y redirige al login.
 * ======================================================================
 */

/* Importación de Link para navegación y useNavigate para redirección
   programática después del cierre de sesión */
import { Link, useNavigate } from 'react-router-dom';

/* Importación de hooks de React: useState para estado local,
   useEffect para efectos al montar */
import { useState, useEffect } from 'react';

/* Importación del módulo de API centralizado para llamadas HTTP al backend */
import { api } from '../api';

/* Definición del componente funcional CierreDeSesionEmpleado */
function CierreDeSesionEmpleado() {

    /* Hook useNavigate para redirigir al usuario después del cierre */
    const navigate = useNavigate();

    /* Nombre del empleado logueado, se obtiene del localStorage
       y se muestra en la interfaz.
       Se inicializa de forma perezosa desde localStorage para no depender
       de un setState dentro del useEffect (evita lint set-state-in-effect) */
    const [empleadoName] = useState(() => {
        /* Obtener el usuario logueado desde localStorage */
        const usuarioLogueado = localStorage.getItem('usuarioLogueado');
        /* Obtener el nombre de sesión activa como alternativa */
        const nombreSesion = localStorage.getItem('kimuka_sesion_activa');

        /* Si existe el usuario logueado y tiene nombre, usar ese nombre */
        if (usuarioLogueado) {
            try {
                const user = JSON.parse(usuarioLogueado);
                if (user.nombre) return user.nombre.toUpperCase();
            } catch {
                /* Si el JSON no es válido, usar la sesión activa */
            }
        }
        /* Si no hay usuario logueado pero sí sesión activa, usar ese nombre */
        return nombreSesion ? nombreSesion.toUpperCase() : 'EMPLEADO';
    });

    /* Hora de salida del empleado, se inicializa con la hora actual */
    const [horaSalida, setHoraSalida] = useState(() => {
        const hoy = new Date();
        const horas = String(hoy.getHours()).padStart(2, '0');
        const minutos = String(hoy.getMinutes()).padStart(2, '0');
        return `${horas}:${minutos}`;
    });

    /* Fecha de salida del empleado, se inicializa con la fecha actual */
    const [fechaSalida, setFechaSalida] = useState(() => {
        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        return `${año}-${mes}-${dia}`;
    });

    /* ID de la jornada activa del empleado, se busca automáticamente
       al montar el componente para poder finalizarla */
    const [idJornada, setIdJornada] = useState('');

    /* ---------- EFECTO AL MONTAR EL COMPONENTE ---------- */

    /* useEffect con dependencias vacías: se ejecuta una sola vez al montar.
       Busca la jornada activa del empleado en la API. */
    useEffect(() => {
        /* Buscar la jornada activa del empleado actual en la API.
           Una jornada activa es aquella que tiene hora de inicio pero
           aún no tiene hora de fin (hFin es null/undefined). */
        api.jornadas.listar()
            .then((res) => {
                /* Obtener nuevamente el usuario logueado dentro del .then
                   para tener el ID del usuario actual */
                const usuarioLogueado = localStorage.getItem('usuarioLogueado');
                if (!usuarioLogueado) return; /* Salir si no hay usuario */
                const user = JSON.parse(usuarioLogueado);

                /* Buscar la jornada activa: misma jornada del empleado y sin hora de fin */
                const jornadaActiva = (res.data || []).find(
                    (j) => j.idUsuario_Empleado === user.idUsuario && !j.hFin
                );
                /* Si se encontró una jornada activa, guardar su ID */
                if (jornadaActiva) setIdJornada(jornadaActiva.idJornada);
            })
            .catch(() => {}); /* Silenciar errores de la petición */
    }, []); /* Array vacío: solo se ejecuta al montar */

    /* ---------- FUNCIONES MANEJADORAS ---------- */

    /**
     * handleSubmit
     * Propósito: Maneja el envío del formulario de cierre de jornada.
     *            Si hay una jornada activa, la finaliza en la API enviando
     *            la hora de fin. Luego limpia todos los datos de sesión
     *            del localStorage y sessionStorage, y redirige al login.
     * @param {Event} e - Evento de envío del formulario
     */
    const handleSubmit = async (e) => {
        /* Prevenir que el formulario recargue la página */
        e.preventDefault();

        try {
            /* Si hay una jornada activa registrada, finalizarla en la API
               enviando la hora de salida como hFin */
            if (idJornada) {
                await api.jornadas.finalizar(idJornada, { hFin: horaSalida });
            }

            /* Mostrar alerta de éxito con el nombre del empleado */
            alert(`¡Jornada registrada con éxito para ${empleadoName}!`);

            /* Limpiar el localStorage: eliminar sesión activa */
            localStorage.removeItem('kimuka_sesion_activa');
            /* Limpiar el localStorage: eliminar datos del usuario logueado */
            localStorage.removeItem('usuarioLogueado');
            /* Limpiar el localStorage: eliminar token de autenticación */
            localStorage.removeItem('token');
            /* Limpiar todo el sessionStorage */
            sessionStorage.clear();

            /* Redirigir al login reemplazando la entrada en el historial
               para que no se pueda volver con el botón de retroceso */
            navigate('/login', { replace: true });
        } catch (error) {
            /* Mostrar alerta de error si falla la petición */
            alert(error.message || 'Error al registrar salida.');
        }
    };

    /* ---------- RENDERIZADO DEL COMPONENTE ---------- */

    return (
        /* Fragmento React para agrupar elementos sin div extra */
        <>

            {/* Barra de navegación superior */}
            <nav className="top-nav">
                {/* Enlace para volver al dashboard del empleado */}
                <Link to="/dashboard-empleado" className="no-text-decor">VOLVER</Link>
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
                                <img src="../img/logo kimuka.png" alt="Logo" />
                            </div>
                            {/* Título de la página: Cierre de Jornada */}
                            <h1>Kimuka - Cierre de Jornada</h1>
                        </div>
                    </div>
                    {/* Celda derecha con el nombre del empleado */}
                    <div className="header-actions-cell">
                        {/* Botón que muestra el nombre del empleado logueado */}
                        <button className="btn-login">{empleadoName}</button>
                    </div>
                </div>
            </header>

            {/* Contenido principal de la página */}
            <main className="content-wrapper">
                {/* Panel de registro de cierre de jornada */}
                <div className="panel-registro">

                    {/* Sección izquierda: imagen ilustrativa */}
                    <div className="image-section-cell">
                        {/* Contenedor de la imagen con estilo de retrato */}
                        <div className="portrait-wrapper">
                            {/* Imagen ilustrativa de horas de trabajo */}
                            <img src="../img/horasDeTrabajadores kk.png" alt="Salida" />
                        </div>
                    </div>

                    {/* Sección derecha: formulario de cierre de turno */}
                    <div className="form-section-cell">
                        {/* Título del formulario */}
                        <h2 className="user-name text-center margin-b-25 font-size-xl">Cierre de Turno</h2>
                        {/* Formulario de cierre de jornada */}
                        <form className="grid-form" onSubmit={handleSubmit}>

                            {/* Campo: hora de fin de jornada */}
                            <div className="input-group">
                                {/* Etiqueta del campo */}
                                <label>Hora de Fin</label>
                                {/* Input de tipo time para seleccionar la hora de salida,
                                    prellenada con la hora actual del sistema */}
                                <input type="time" value={horaSalida} onChange={(e) => setHoraSalida(e.target.value)} required />
                            </div>

                            {/* Campo: fecha de cierre de jornada */}
                            <div className="input-group">
                                {/* Etiqueta del campo */}
                                <label>Fecha</label>
                                {/* Input de tipo date para seleccionar la fecha de salida,
                                    prellenada con la fecha actual del sistema */}
                                <input type="date" value={fechaSalida} onChange={(e) => setFechaSalida(e.target.value)} required />
                            </div>

                            {/* Botón de envío: registrar salida y cerrar sesión,
                                estilo de alerta (rojo) para indicar acción destructiva */}
                            <button type="submit" className="btn-submit w-100 margin-t-15 btn-alert-color">
                                Registrar Salida y Salir
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </> /* Fin del fragmento */
    );
}

/* Exportación del componente como exportación por defecto */
export default CierreDeSesionEmpleado;
