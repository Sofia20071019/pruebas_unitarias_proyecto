/* ============================================================
   ARCHIVO: RegistroDePersonal.jsx
   PROPOSITO: Componente de página que permite registrar nuevos
              empleados/usuarios en el sistema Kimuka. Muestra
              un formulario completo con campos de nombre,
              apellidos, correo electrónico, contraseña con
              confirmación y selección de rol. Incluye validación
              de coincidencia de contraseñas y filtrado de números
              en campos de nombre/apellido. Se conecta con la API
              para crear el usuario y obtener la lista de roles
              disponibles. Tras el registro exitoso, redirige a
              la página de gestión de empleados.
   ============================================================ */

// Importación de hooks de estado y efecto
import { useState, useEffect } from 'react';
// Importación de Link para navegación y useNavigate para redirección programática
import { Link, useNavigate } from 'react-router-dom';
// Importación del módulo de API para realizar peticiones HTTP al backend
import { api } from '../api';

/* ============================================================
   Componente principal: RegistroDePersonal
   Renderiza el formulario completo de registro de un nuevo
   empleado con validaciones y diseño de dos columnas.
   ============================================================ */
function RegistroDePersonal() {

  /* ----------------------------------------------------------
     HOOK DE NAVEGACIÓN
     useNavigate permite redirigir programáticamente a la
     página de gestión de empleados después del registro.
     ---------------------------------------------------------- */
  const navigate = useNavigate();

  /* ----------------------------------------------------------
     ESTADOS (useState)
     ---------------------------------------------------------- */

  // Nombre del administrador logueado, se muestra en el encabezado.
  // Se inicializa de forma perezosa desde localStorage para no depender de un
  // setState dentro del useEffect (evita lint set-state-in-effect)
  const [adminName] = useState(() => {
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    if (usuarioLogueado) {
      const user = JSON.parse(usuarioLogueado);
      return user.nombre ? user.nombre.toUpperCase() : 'ADMINISTRADOR';
    }
    return 'ADMINISTRADOR';
  });

  // Lista de roles disponibles obtenidos desde el backend
  const [roles, setRoles] = useState([]);

  // Campo: Primer nombre del nuevo empleado (obligatorio)
  const [pNombre, setPNombre] = useState('');

  // Campo: Segundo nombre del nuevo empleado (opcional)
  const [sNombre, setSNombre] = useState('');

  // Campo: Primer apellido del nuevo empleado (obligatorio)
  const [pApellido, setPApellido] = useState('');

  // Campo: Segundo apellido del nuevo empleado (opcional)
  const [sApellido, setSApellido] = useState('');

  // Campo: Correo electrónico del nuevo empleado (obligatorio)
  const [correo, setCorreo] = useState('');

  // Campo: Contraseña del nuevo empleado (obligatorio)
  const [password, setPassword] = useState('');

  // Campo: Confirmación de contraseña (debe coincidir con password)
  const [confirmarPassword, setConfirmarPassword] = useState('');

  // Campo: ID del rol seleccionado para el nuevo empleado
  const [idRol, setIdRol] = useState('');

  /* ----------------------------------------------------------
     EFECTO SECUNDARIO (useEffect)
     Se ejecuta una sola vez al montar el componente.
     Carga la lista de roles disponibles desde la API
     ---------------------------------------------------------- */
  useEffect(() => {
    // Realizar petición GET para obtener la lista de roles del sistema
    api.roles.listar()
      .then((res) => setRoles(res.data || [])) // Guardar los roles en el estado
      .catch(() => {}); // Silenciar errores de red o backend
  }, []); // Array vacío: se ejecuta solo al montar el componente

  /* ----------------------------------------------------------
     FUNCIÓN: handleSubmit
     Propósito: Validar y enviar los datos del nuevo empleado
                al backend para crearlo en el sistema.
     Parámetros: e - evento del formulario (submit)
     Comportamiento: Previene la recarga de página, valida que
     las contraseñas coincidan, envía los datos a la API para
     crear el usuario, muestra alertas de éxito/error y redirige
     a la gestión de empleados en caso de éxito.
     ---------------------------------------------------------- */
  const handleSubmit = async (e) => {
    // Prevenir comportamiento por defecto del formulario (recarga de página)
    e.preventDefault();

    // Validar que las contraseñas coincidan antes de enviar
    if (password !== confirmarPassword) {
      alert('Error: Las contraseñas no coinciden.'); // Alerta de error
      return; // Detener la ejecución si no coinciden
    }

    try {
      // Enviar petición POST para crear el nuevo usuario en el backend
      await api.usuarios.crear({
        pNombre: pNombre.trim(),             // Primer nombre sin espacios extra
        sNombre: sNombre.trim() || null,     // Segundo nombre (null si está vacío)
        pApellido: pApellido.trim(),         // Primer apellido sin espacios extra
        sApellido: sApellido.trim() || null, // Segundo apellido (null si está vacío)
        correo: correo.toLowerCase().trim(), // Correo en minúsculas sin espacios extra
        password: password.trim(),           // Contraseña sin espacios extra
        idRol,                              // ID del rol seleccionado
      });

      // Mostrar confirmación de éxito al usuario
      alert('¡Usuario registrado con éxito en Kimuka!');
      // Redirigir a la página de gestión de empleados (replace: reemplaza el historial)
      navigate('/empleados', { replace: true });
    } catch (error) {
      // Mostrar mensaje de error si el registro falla
      alert(error.message || 'Error al registrar el usuario.');
    }
  };

  /* ----------------------------------------------------------
     RENDERIZADO (JSX)
     Estructura visual completa de la página de registro de personal
     ---------------------------------------------------------- */
  return (
    <>
      {/* Barra de navegación superior con enlace para volver a la gestión de empleados */}
      <nav className="top-nav">
        <Link to="/empleados">VOLVER</Link>
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
              {/* Título de la página de registro de personal */}
              <h1>Kimuka - Personal</h1>
            </div>
          </div>
          {/* Celda de acciones: nombre del admin y botón de cerrar sesión */}
          <div className="header-actions-cell">
            {/* Botón que muestra el nombre del administrador logueado */}
            <button className="btn-login">{adminName}</button>
            {/* Botón con enlace para cerrar la sesión */}
            <button className="btn-login">
              <Link to="/cierre-admin">Cerrar Sesión</Link>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal de la página */}
      <main className="content-wrapper">
        {/* Panel de registro con diseño de dos columnas */}
        <div className="panel-registro">
          {/* Sección izquierda: formulario de registro */}
          <div className="form-section-cell">
            {/* Título del formulario */}
            <h2 className="form-title">Registrar Nuevo Empleado</h2>

            {/* Formulario de registro con grid layout */}
            <form className="grid-form" onSubmit={handleSubmit}>
              {/* Fila: Primer Nombre y Segundo Nombre */}
              <div className="input-row">
                {/* Campo de Primer Nombre (obligatorio, sin números) */}
                <div className="input-cell">
                  <label>Primer Nombre</label>
                  {/* Input que filtra números con expresión regular en el onChange */}
                  <input type="text" placeholder="Laura" value={pNombre} onChange={(e) => setPNombre(e.target.value.replace(/[0-9]/g, ''))} required />
                </div>
                {/* Campo de Segundo Nombre (opcional, sin números) */}
                <div className="input-cell">
                  <label>Segundo Nombre</label>
                  <input type="text" placeholder="Jimena" value={sNombre} onChange={(e) => setSNombre(e.target.value.replace(/[0-9]/g, ''))} />
                </div>
              </div>

              {/* Fila: Primer Apellido y Segundo Apellido */}
              <div className="input-row">
                {/* Campo de Primer Apellido (obligatorio, sin números) */}
                <div className="input-cell">
                  <label>Primer Apellido</label>
                  <input type="text" placeholder="Valderrama" value={pApellido} onChange={(e) => setPApellido(e.target.value.replace(/[0-9]/g, ''))} required />
                </div>
                {/* Campo de Segundo Apellido (opcional, sin números) */}
                <div className="input-cell">
                  <label>Segundo Apellido</label>
                  <input type="text" placeholder="Vaquero" value={sApellido} onChange={(e) => setSApellido(e.target.value.replace(/[0-9]/g, ''))} />
                </div>
              </div>

              {/* Fila: Correo Electrónico y Rol/Perfil */}
              <div className="input-row">
                {/* Campo de Correo Electrónico (obligatorio) */}
                <div className="input-cell">
                  <label>Correo Electrónico</label>
                  <input type="email" placeholder="ejemplo@gmail.com" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
                </div>
                {/* Campo de selección de Rol (obligatorio, opciones desde la API) */}
                <div className="input-cell">
                  <label>Rol / Perfil</label>
                  {/* Selector de roles cargados desde el backend */}
                  <select value={idRol} onChange={(e) => setIdRol(e.target.value)} required>
                    {/* Opción predeterminada placeholder */}
                    <option value="">-- Seleccionar --</option>
                    {/* Renderizar cada rol como opción del selector */}
                    {roles.map((r) => (
                      <option key={r.idRol} value={r.idRol}>{r.nombreRol}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fila: Contraseña y Confirmación de Contraseña */}
              <div className="input-row">
                {/* Campo de Contraseña (obligatorio) */}
                <div className="input-cell">
                  <label>Contraseña</label>
                  <input type="password" placeholder="Identificación" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {/* Campo de Confirmación de Contraseña (obligatorio) */}
                <div className="input-cell">
                  <label>Confirmar Contraseña</label>
                  <input type="password" placeholder="Repita la identificación" value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} required />
                </div>
              </div>

              {/* Botón para enviar el formulario y registrar el usuario */}
              <button type="submit" className="btn-submit margin-t-15">Registrar Usuario</button>
            </form>
          </div>

          {/* Sección derecha: imagen de vista previa/avatar */}
          <div className="image-section-cell">
            {/* Título de la sección de imagen */}
            <h3 className="avatar-preview-text">Foto-Trabajador</h3>
            {/* Contenedor de la imagen de vista previa */}
            <div className="portrait-wrapper">
              {/* Imagen decorativa de vista previa del empleado */}
              <img src="../img/registroDePersonal kk .png" alt="Avatar Empleado" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// Exportar el componente como exportación por defecto
export default RegistroDePersonal;
