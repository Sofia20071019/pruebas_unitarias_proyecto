/**
 * ======================================================================
 * ARCHIVO: Aprobarpago.jsx
 * PROPOSITO: Componente de página que permite al administrador aprobar
 *            pagos a empleados. Presenta un formulario donde se ingresa
 *            el nombre del empleado, el monto, el método de pago y la
 *            jornada asociada. Al enviar, crea el registro de pago en la
 *            API y muestra un resumen financiero con el estado de la
 *            aprobación (Pendiente/Aprobado) y el responsable.
 * ======================================================================
 */

/* Importación de hooks de React: useState para manejar estado local,
   useEffect para ejecutar efectos al montar el componente */
import { useState, useEffect } from "react";

/* Importación de Link de react-router-dom para navegación entre rutas
   sin recargar la página completa */
import { Link } from 'react-router-dom';

/* Importación del módulo de API centralizado para llamadas HTTP al backend */
import { api } from '../api';

/* Definición del componente funcional Aprobarpago */
function Aprobarpago() {

    /* ---------- ESTADOS DEL COMPONENTE ---------- */

    /* Estado del formulario de aprobación de pago, contiene los campos:
       nombre, cedula, monto, idMetodo, concepto, estado y responsable.
       El responsable se inicializa de forma perezosa desde localStorage para
       no depender de un setState dentro del useEffect (evita lint set-state-in-effect) */
    const [pago, setPago] = useState(() => {
        /* Obtener el usuario logueado desde localStorage para usar su nombre
           como responsable del pago, o 'ADMIN' como respaldo */
        let responsable = "ADMIN";
        const usuarioLogueado = localStorage.getItem('usuarioLogueado');
        if (usuarioLogueado) {
            try {
                responsable = JSON.parse(usuarioLogueado).nombre?.toUpperCase() || "ADMIN";
            } catch {
                responsable = "ADMIN";
            }
        }
        return {
            nombre: "",
            cedula: "",
            monto: "",
            idMetodo: "",
            concepto: "",
            estado: "Pendiente",     /* Estado inicial: Pendiente hasta que se apruebe */
            responsable              /* Responsable obtenido del usuario logueado */
        };
    });

    /* Lista de métodos de pago disponibles cargados desde la API */
    const [metodosPago, setMetodosPago] = useState([]);

    /* Lista de jornadas disponibles cargadas desde la API */
    const [jornadas, setJornadas] = useState([]);

    /* ---------- EFECTO AL MONTAR EL COMPONENTE ---------- */

    /* useEffect con dependencias vacías: se ejecuta una sola vez al
       montar el componente para cargar datos iniciales */
    useEffect(() => {
        /* Petición GET para listar todos los métodos de pago disponibles */
        api.metodosPago.listar()
            .then((res) => setMetodosPago(res.data || []))
            .catch(() => {});

        /* Petición GET para listar todas las jornadas de trabajo */
        api.jornadas.listar()
            .then((res) => setJornadas(res.data || []))
            .catch(() => {});
    }, []); /* Array vacío: solo se ejecuta al montar */

    /* ---------- FUNCIONES MANEJADORAS ---------- */

    /**
     * handleChange
     * Propósito: Maneja los cambios en cualquier campo del formulario.
     *            Extrae el nombre y valor del campo modificado y actualiza
     *            el estado del pago de forma genérica.
     * @param {Event} e - Evento de cambio del input/select
     */
    const handleChange = (e) => {
        /* Extraer name y value del elemento que disparó el evento */
        const { name, value } = e.target;
        /* Actualizar solo el campo modificado usando la notación de corchetes */
        setPago({ ...pago, [name]: value });
    };

    /**
     * handleSubmit
     * Propósito: Maneja el envío del formulario de aprobación de pago.
     *            Obtiene el usuario logueado, envía los datos del pago
     *            a la API para registrarlo, cambia el estado a "Aprobado"
     *            y muestra una alerta con el resultado.
     * @param {Event} e - Evento de envío del formulario
     */
    const handleSubmit = async (e) => {
        /* Prevenir que el formulario recargue la página */
        e.preventDefault();

        try {
            /* Obtener el usuario logueado desde localStorage */
            const usuarioLogueado = localStorage.getItem('usuarioLogueado');
            const user = JSON.parse(usuarioLogueado);

            /* Enviar la solicitud de creación de pago a la API con:
               - ID de la jornada asociada
               - ID del administrador que aprueba el pago
               - Monto a pagar
               - Método de pago seleccionado
               - Fecha actual en formato ISO (solo YYYY-MM-DD) */
            await api.pagos.crear({
                idJornada: pago.idJornada,
                idUsuario_Admin: user.idUsuario,
                montoPagado: pago.monto,
                idMetodo: pago.idMetodo,
                fechaPago: new Date().toISOString().split('T')[0],
            });

            /* Cambiar el estado del pago a "Aprobado" tras el éxito */
            setPago({ ...pago, estado: "Aprobado" });

            /* Mostrar alerta de éxito con el monto formateado */
            alert(`Pago por valor de $${Number(pago.monto).toLocaleString()} aprobado correctamente.`);
        } catch (error) {
            /* Mostrar alerta de error si falla la petición */
            alert(error.message || "Error al procesar el pago.");
        }
    };

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
                                <img src="../img/logo kimuka.png" alt="logo Kimuka" />
                            </div>
                            {/* Título de la página: Aprobación de Pagos */}
                            <h1>Aprobación de Pagos</h1>
                        </div>
                    </div>
                    {/* Celda derecha con acción de registrar nuevo personal */}
                    <div className="header-actions-cell">
                        {/* Botón que enlaza al formulario de registro de personal */}
                        <button className="btn-login">
                            <Link to="/registro-personal" className="no-text-decor">Registrar Nuevo Personal</Link>
                        </button>
                    </div>
                </div>
            </header>

            {/* Contenido principal de la página */}
            <main className="content-wrapper">
                {/* Panel de registro con layout de dos columnas */}
                <div className="panel-registro">

                    {/* Sección izquierda: formulario de aprobación de pago */}
                    <section className="form-section-cell">
                        {/* Título del formulario */}
                        <h2 className="form-title">Aprobar Pago</h2>
                        {/* Formulario de aprobación con envío controlado */}
                        <form className="grid-form" onSubmit={handleSubmit}>

                            {/* Campo: nombre del empleado */}
                            <div className="input-group">
                                {/* Etiqueta del campo */}
                                <label>Nombre del Empleado</label>
                                {/* Input de texto para el nombre del empleado */}
                                <input type="text" name="nombre" value={pago.nombre} onChange={handleChange} required />
                            </div>

                            {/* Campo: monto a pagar */}
                            <div className="input-group">
                                {/* Etiqueta del campo */}
                                <label>Monto a Pagar</label>
                                {/* Input numérico para el monto del pago */}
                                <input type="number" name="monto" value={pago.monto} onChange={handleChange} required />
                            </div>

                            {/* Campo: método de pago */}
                            <div className="input-group">
                                {/* Etiqueta del campo */}
                                <label>Método de Pago</label>
                                {/* Dropdown de métodos de pago cargados desde la API */}
                                <select name="idMetodo" value={pago.idMetodo} onChange={handleChange} required>
                                    {/* Opción placeholder */}
                                    <option value="">Seleccione</option>
                                    {/* Mapear cada método de pago como opción */}
                                    {metodosPago.map((m) => (
                                        <option key={m.idMetodo} value={m.idMetodo}>{m.nombreMetodo}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Campo: jornada asociada al pago */}
                            <div className="input-group">
                                {/* Etiqueta del campo */}
                                <label>Jornada Asociada</label>
                                {/* Dropdown de jornadas disponibles */}
                                <select name="idJornada" value={pago.idJornada} onChange={handleChange} required>
                                    {/* Opción placeholder */}
                                    <option value="">Seleccione una jornada</option>
                                    {/* Mapear cada jornada como opción */}
                                    {jornadas.map((j) => (
                                        <option key={j.idJornada} value={j.idJornada}>
                                            {/* Mostrar ID y fecha de la jornada */}
                                            {j.idJornada} - {j.fecha}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Botón de confirmación de aprobación, ancho completo */}
                            <button type="submit" className="btn-submit w-100">Confirmar Aprobación</button>
                        </form>
                    </section>

                    {/* Sección derecha: resumen financiero */}
                    <section className="image-section-cell">
                        {/* Título del resumen */}
                        <h2 className="avatar-preview-text">Resumen Financiero</h2>
                        {/* Contenedor de información destacada */}
                        <div className="highlight-info">
                            {/* Subtítulo: Monto Total */}
                            <h4>Monto Total</h4>
                            {/* Mostrar el monto formateado, o "$ 0" si no hay monto */}
                            <p>{pago.monto ? `$ ${Number(pago.monto).toLocaleString()}` : "$ 0"}</p>
                            {/* Indicador del estado de la aprobación */}
                            <div className="margin-t-15">
                                {/* Badge de estado con clase CSS dinámica:
                                   'status-pending' si está pendiente,
                                   'status-success' si está aprobado */}
                                <span className={`status ${pago.estado === 'Pendiente' ? 'status-pending' : 'status-success'}`}>
                                    {/* Texto del estado actual */}
                                    {pago.estado}
                                </span>
                            </div>
                        </div>
                        {/* Información del responsable */}
                        <div className="margin-t-15 font-size-sm text-secondary text-center">
                            {/* Mostrar el nombre del administrador responsable */}
                            <p><strong>Responsable:</strong> {pago.responsable}</p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

/* Exportación del componente como exportación por defecto */
export default Aprobarpago;
