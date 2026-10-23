/**
 * ======================================================================
 * ARCHIVO: AdminPagos.jsx
 * PROPOSITO: Componente de página que permite al administrador gestionar
 *            los pagos a empleados. Incluye un formulario para registrar
 *            nuevos pagos (seleccionando empleado, jornada, monto y método
 *            de pago), un panel de cálculo de horas y pago estimado, y un
 *            historial de pagos realizados. Se comunica con la API para
 *            obtener empleados, métodos de pago, jornadas y registrar pagos.
 * ======================================================================
 */

/* Importación de hooks de React: useState para manejar estado local,
   useEffect para ejecutar efectos secundarios al montar el componente */
import { useState, useEffect } from "react";

/* Importación de Link de react-router-dom para crear enlaces de navegación
   entre rutas de la aplicación sin recargar la página */
import { Link } from 'react-router-dom';

/* Importación del módulo de API que centraliza todas las llamadas HTTP
   al backend (empleados, métodos de pago, jornadas, pagos) */
import { api } from '../api';

/* Definición del componente funcional AdminPagos */
function AdminPagos() {

    /* ---------- ESTADOS DEL COMPONENTE ---------- */

    /* Lista de empleados disponibles, se carga desde la API al montar */
    const [empleados, setEmpleados] = useState([]);

    /* Lista de métodos de pago (ej: efectivo, transferencia, etc.) */
    const [metodosPago, setMetodosPago] = useState([]);

    /* Lista de todas las jornadas registradas en el sistema */
    const [jornadas, setJornadas] = useState([]);

    /* ID del empleado seleccionado en el dropdown, usado para filtrar
       jornadas disponibles y calcular el pago */
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');

    /* Objeto con el resultado del cálculo de pago (horas totales y
       monto estimado) para el empleado seleccionado */
    const [calculo, setCalculo] = useState(null);

    /* Nombre del administrador logueado, se obtiene del localStorage
       y se muestra en el encabezado. Se inicializa de forma perezosa
       para no depender de un setState dentro del useEffect
       (evita lint set-state-in-effect) */
    const [adminName] = useState(() => {
        const nombreSesion = localStorage.getItem('kimuka_sesion_activa');
        return nombreSesion ? nombreSesion.toUpperCase() : 'ADMINISTRADOR';
    });

    /* Estado del formulario de registro de pago, contiene los campos:
       idJornada, idMetodo y monto */
    const [pagoForm, setPagoForm] = useState({
        idJornada: "",
        idMetodo: "",
        monto: "",
    });

    /* Historial de pagos ya registrados, se carga y actualiza después
       de cada nuevo pago */
    const [historialPagos, setHistorialPagos] = useState([]);

    /* Mensaje de feedback al usuario (éxito o error) */
    const [mensaje, setMensaje] = useState('');

    /* ---------- EFECTO AL MONTAR EL COMPONENTE ---------- */

    /* useEffect con dependencias vacías: se ejecuta una sola vez al
       montar el componente. Carga el nombre de sesión del admin,
       la lista de empleados, métodos de pago, jornadas y pagos. */
    useEffect(() => {
        /* Petición GET para listar todos los empleados registrados */
        api.empleados.listar()
            .then((res) => setEmpleados(res.data || []))
            .catch(() => {});

        /* Petición GET para listar todos los métodos de pago disponibles */
        api.metodosPago.listar()
            .then((res) => setMetodosPago(res.data || []))
            .catch(() => {});

        /* Petición GET para listar todas las jornadas de trabajo */
        api.jornadas.listar()
            .then((res) => setJornadas(res.data || []))
            .catch(() => {});

        /* Petición GET para listar el historial de pagos realizados */
        api.pagos.listar()
            .then((res) => setHistorialPagos(res.data || []))
            .catch(() => {});
    }, []); /* Array vacío: solo se ejecuta al montar */

    /* ---------- FUNCIONES MANEJADORAS ---------- */

    /**
     * handleSeleccionarEmpleado
     * Propósito: Maneja el cambio de selección en el dropdown de empleados.
     *            Actualiza el empleado seleccionado, resetea el formulario
     *            de pago y solicita el cálculo de pago al backend.
     * @param {Event} e - Evento de cambio del select
     */
    const handleSeleccionarEmpleado = (e) => {
        /* Extraer el ID del empleado seleccionado */
        const id = e.target.value;
        /* Actualizar el estado con el ID seleccionado */
        setEmpleadoSeleccionado(id);
        /* Resetear el formulario de pago cuando cambia el empleado */
        setPagoForm({ idJornada: "", idMetodo: "", monto: "" });

        /* Si se seleccionó un empleado, llamar a la API para calcular
           su pago basado en las horas trabajadas */
        if (id) {
            api.jornadas.calcularPago(id)
                .then((res) => setCalculo(res.data))
                .catch(() => setCalculo(null));
        } else {
            /* Si no hay empleado seleccionado, limpiar el cálculo */
            setCalculo(null);
        }
    };

    /* Filtrar las jornadas disponibles para el empleado seleccionado.
       Solo se muestran jornadas que tengan hora de fin (completadas)
       y que pertenezcan al empleado seleccionado. */
    const jornadasDisponibles = empleadoSeleccionado
        ? jornadas.filter((j) => j.idUsuario_Empleado === empleadoSeleccionado && j.hFin)
        : [];

    /**
     * handleSubmit
     * Propósito: Maneja el envío del formulario de registro de pago.
     *            Obtiene el usuario logueado del localStorage, envía los
     *            datos del pago a la API, muestra mensaje de éxito o error,
     *            actualiza el historial y resetea el formulario.
     * @param {Event} e - Evento de envío del formulario
     */
    const handleSubmit = async (e) => {
        /* Prevenir que el formulario recargue la página */
        e.preventDefault();
        /* Limpiar mensajes previos */
        setMensaje('');

        try {
            /* Obtener el usuario logueado desde localStorage */
            const usuarioLogueado = localStorage.getItem('usuarioLogueado');
            const user = JSON.parse(usuarioLogueado);

            /* Enviar la solicitud de creación de pago a la API con:
               - ID de la jornada a pagar
               - ID del administrador que registra el pago
               - Monto a pagar
               - Método de pago seleccionado
               - Fecha actual en formato ISO (solo la parte de fecha) */
            await api.pagos.crear({
                idJornada: pagoForm.idJornada,
                idUsuario_Admin: user.idUsuario,
                montoPagado: pagoForm.monto,
                idMetodo: pagoForm.idMetodo,
                fechaPago: new Date().toISOString().split('T')[0],
            });

            /* Mostrar mensaje de éxito formateando el monto con locale */
            setMensaje(`Pago por $${Number(pagoForm.monto).toLocaleString()} registrado correctamente.`);

            /* Actualizar el historial de pagos después del nuevo registro */
            api.pagos.listar()
                .then((res) => setHistorialPagos(res.data || []))
                .catch(() => {});

            /* Resetear el formulario de pago a sus valores iniciales */
            setPagoForm({ idJornada: "", idMetodo: "", monto: "" });
        } catch (error) {
            /* Mostrar mensaje de error si falla la petición */
            setMensaje(error.message || "Error al procesar el pago.");
        }
    };

    /* ---------- RENDERIZADO DEL COMPONENTE ---------- */

    return (
        /* Contenedor principal con tema oscuro */
        <div className="dark-theme">

            {/* Barra de navegación superior con enlace de retorno al dashboard */}
            <nav className="top-nav">
                {/* Enlace para volver al panel de administración */}
                <Link to="/dashboardadmin" className="no-text-decor">VOLVER</Link>
            </nav>

            {/* Encabezado principal de la página */}
            <header className="main-header">
                {/* Contenedor flexible del encabezado */}
                <div className="header-container">
                    {/* Celda izquierda con el logo y título */}
                    <div className="logo-principal-cell">
                        {/* Wrapper del logo y título */}
                        <div className="logo-principal">
                            {/* Círculo contenedor de la imagen del logo */}
                            <div className="logo-circle">
                                {/* Imagen del logo de Kimuka */}
                                <img src="../img/logo kimuka.png" alt="logo Kimuka" />
                            </div>
                            {/* Título principal de la página */}
                            <h1>Gestión de Pagos</h1>
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

                {/* Mostrar mensaje de feedback si existe */}
                {mensaje && (
                    /* Contenedor del mensaje con estilo condicional:
                       verde para éxito, rojo para error */
                    <div style={{ background: '#1a1a1a', border: '1px solid #2d2d2d', padding: '15px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center', color: mensaje.includes('Error') ? '#e74c3c' : '#2ecc71' }}>
                        {/* Texto del mensaje */}
                        {mensaje}
                    </div>
                )}

                {/* Panel principal de registro de pagos */}
                <div className="panel-registro">

                    {/* Sección izquierda: formulario de registro de pago */}
                    <section className="form-section-cell">
                        {/* Título del formulario */}
                        <h2 className="form-title">Registrar Pago</h2>
                        {/* Formulario de registro de pago */}
                        <form className="grid-form" onSubmit={handleSubmit}>

                            {/* Campo de selección de empleado */}
                            <div className="input-group">
                                {/* Etiqueta del campo */}
                                <label>Empleado</label>
                                {/* Dropdown de empleados con opción por defecto */}
                                <select value={empleadoSeleccionado} onChange={handleSeleccionarEmpleado} required>
                                    {/* Opción placeholder */}
                                    <option value="">Seleccione un empleado</option>
                                    {/* Mapear cada empleado como una opción del dropdown */}
                                    {empleados.map((emp) => (
                                        <option key={emp.idUsuario} value={emp.idUsuario}>{emp.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Panel de información de cálculo de pago */}
                            {calculo && (
                                /* Contenedor con fondo oscuro que muestra horas y pago estimado */
                                <div className="input-group" style={{ background: '#1f1f1f', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                                    {/* Mostrar total de horas trabajadas */}
                                    <p className="text-secondary font-size-sm">Horas totales: <strong className="text-primary">{calculo.horasTotales} hrs</strong></p>
                                    {/* Mostrar el monto estimado del pago formateado con locale colombiano */}
                                    <p className="text-secondary font-size-sm">Pago estimado: <strong className="text-primary">$ {Number(calculo.pagoTotal).toLocaleString('es-CO')}</strong></p>
                                </div>
                            )}

                            {/* Campo de selección de jornada a pagar */}
                            <div className="input-group">
                                {/* Etiqueta del campo */}
                                <label>Jornada a Pagar</label>
                                {/* Dropdown de jornadas disponibles para el empleado seleccionado */}
                                <select name="idJornada" value={pagoForm.idJornada} onChange={(e) => setPagoForm({ ...pagoForm, idJornada: e.target.value })} required>
                                    {/* Opción placeholder */}
                                    <option value="">Seleccione una jornada</option>
                                    {/* Mapear las jornadas disponibles filtradas */}
                                    {jornadasDisponibles.map((j) => (
                                        /* Cada opción muestra ID, fecha y rango de horas */
                                        <option key={j.idJornada} value={j.idJornada}>
                                            {j.idJornada} - {j.fecha} ({j.hInicio?.substring(0, 5)} - {j.hFin?.substring(0, 5)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Campo de monto a pagar */}
                            <div className="input-group">
                                {/* Etiqueta del campo */}
                                <label>Monto a Pagar</label>
                                {/* Input numérico para ingresar el monto del pago */}
                                <input type="number" name="monto" value={pagoForm.monto} onChange={(e) => setPagoForm({ ...pagoForm, monto: e.target.value })} placeholder="0" required />
                            </div>

                            {/* Campo de selección de método de pago */}
                            <div className="input-group">
                                {/* Etiqueta del campo */}
                                <label>Método de Pago</label>
                                {/* Dropdown de métodos de pago disponibles */}
                                <select name="idMetodo" value={pagoForm.idMetodo} onChange={(e) => setPagoForm({ ...pagoForm, idMetodo: e.target.value })} required>
                                    {/* Opción placeholder */}
                                    <option value="">Seleccione</option>
                                    {/* Mapear cada método de pago como opción */}
                                    {metodosPago.map((m) => (
                                        <option key={m.idMetodo} value={m.idMetodo}>{m.nombreMetodo}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Botón de envío del formulario, ancho completo */}
                            <button type="submit" className="btn-submit w-100">Registrar Pago</button>
                        </form>
                    </section>

                    {/* Sección derecha: historial de pagos */}
                    <section className="image-section-cell">
                        {/* Título del historial */}
                        <h2 className="avatar-preview-text">Historial de Pagos</h2>
                        {/* Contenedor scrollable con altura máxima de 400px */}
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {/* Mostrar mensaje si no hay pagos registrados */}
                            {historialPagos.length === 0 ? (
                                <p className="text-secondary text-center">No hay pagos registrados.</p>
                            ) : (
                                /* Mapear cada pago del historial como una tarjeta */
                                historialPagos.map((p) => (
                                    /* Tarjeta individual de cada pago con fondo oscuro */
                                    <div key={p.idPago} style={{ background: '#1f1f1f', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
                                        {/* ID del pago */}
                                        <p className="font-size-sm text-secondary">{p.idPago}</p>
                                        {/* Monto pagado formateado con locale colombiano, color verde */}
                                        <p className="font-size-lg" style={{ color: '#2ecc71' }}>$ {Number(p.montoPagado).toLocaleString('es-CO')}</p>
                                        {/* Método de pago y fecha */}
                                        <p className="font-size-sm text-muted">{p.nombreMetodo} | {p.fechaPago}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

/* Exportación del componente como exportación por defecto */
export default AdminPagos;
