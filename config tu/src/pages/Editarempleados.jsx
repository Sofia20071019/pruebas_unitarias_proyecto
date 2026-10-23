/* ============================================================
   ARCHIVO: Editarempleados.jsx
   PROPOSITO: Componente de página que permite editar los datos
              de un empleado/usuario existente en el sistema
              Kimuka. Recibe el ID del empleado a través de la
              URL (parámetro de ruta), carga sus datos actuales
              desde el backend y muestra un formulario prellenado
              para modificar nombre, apellidos, correo, contraseña
              y estado. Tras guardar los cambios, redirige a la
              lista de empleados.
   ============================================================ */

// Importación de hooks de estado y efecto de React
import { useState, useEffect } from 'react';
// Importación de Link para navegación, useParams para obtener parámetros de URL
// y useNavigate para redirección programática
import { Link, useParams, useNavigate } from 'react-router-dom';
// Importación del módulo de API para realizar peticiones HTTP al backend
import { api } from '../api';

/* ============================================================
   Componente principal: Editarempleados
   Renderiza el formulario de edición de un empleado con sus
   datos actuales prellenados y una sección de vista previa.
   ============================================================ */
function Editarempleados() {

  /* ----------------------------------------------------------
     OBTENCIÓN DE PARÁMETROS DE RUTA
     useParams extrae el ID del empleado de la URL
     (ejemplo: /editarempleados/USR-001 → id = "USR-001")
     ---------------------------------------------------------- */
  const { id } = useParams();

  /* ----------------------------------------------------------
     HOOK DE NAVEGACIÓN
     useNavigate permite redirigir programáticamente a otra
     ruta después de guardar los cambios exitosamente.
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

  // Objeto que contiene todos los campos del formulario de edición
  const [formData, setFormData] = useState({
    pNombre: "",      // Primer nombre del empleado
    sNombre: "",      // Segundo nombre del empleado
    pApellido: "",    // Primer apellido del empleado
    sApellido: "",    // Segundo apellido del empleado
    correo: "",       // Correo electrónico del empleado
    password: "",     // Nueva contraseña (vacío para mantener la actual)
    idRol: "",        // ID del rol asignado al empleado
    idEstado: "EST-001" // ID del estado del empleado (por defecto: ACTIVO)
  });

  /* ----------------------------------------------------------
     EFECTO SECUNDARIO (useEffect)
     Se ejecuta al montar el componente y cada vez que cambia
     el parámetro 'id' de la URL.
     1. Carga los datos del empleado desde la API usando el ID
     2. Rellena el formulario con los datos obtenidos
     ---------------------------------------------------------- */
  useEffect(() => {
    // Si no hay ID en la URL, salir sin cargar datos
    if (!id) return;

    // Realizar petición GET para obtener los datos del empleado por su ID
    api.usuarios.obtener(id)
      .then((res) => {
        const u = res.data; // Extraer los datos del empleado de la respuesta
        // Rellenar el formulario con los datos obtenidos del empleado
        setFormData({
          pNombre: u.pNombre || "",      // Primer nombre (vacío si no existe)
          sNombre: u.sNombre || "",      // Segundo nombre (vacío si no existe)
          pApellido: u.pApellido || "",  // Primer apellido (vacío si no existe)
          sApellido: u.sApellido || "",  // Segundo apellido (vacío si no existe)
          correo: u.correo || "",        // Correo electrónico (vacío si no existe)
          password: "",                  // Contraseña siempre vacía por seguridad
          idRol: u.idRol || "",         // Rol del empleado
          idEstado: u.idEstado || "EST-001" // Estado (ACTIVO por defecto)
        });
      })
      .catch((err) => console.error("Error al traer el empleado:", err)); // Log de errores
  }, [id]); // Se re-ejecuta cuando cambia el ID de la URL

  /* ----------------------------------------------------------
     FUNCIÓN: handleChange
     Propósito: Actualizar dinámicamente los campos del formulario
                cuando el usuario escribe o selecciona un valor.
     Parámetros: e - evento del input/select
     Comportamiento: Usa el atributo 'name' del elemento para
     determinar qué campo del objeto formData actualizar.
     ---------------------------------------------------------- */
  const handleChange = (e) => {
    // Actualizar solo el campo cuyo name coincida con el del input modificado
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ----------------------------------------------------------
     FUNCIÓN: handleSubmit
     Propósito: Enviar los datos actualizados del empleado al
                backend y redirigir a la lista de empleados.
     Parámetros: e - evento del formulario (submit)
     Comportamiento: Previene la recarga de página, envía los
     datos del formulario a la API para actualizar el empleado,
     muestra una alerta de éxito y redirige a /empleados.
     ---------------------------------------------------------- */
  const handleSubmit = async (e) => {
    // Prevenir comportamiento por defecto del formulario
    e.preventDefault();
    try {
      // Enviar petición PUT para actualizar los datos del empleado
      await api.usuarios.actualizar(id, formData);
      // Mostrar confirmación de éxito al usuario
      alert("¡Cambios guardados exitosamente en Kimuka!");
      // Redirigir a la página de gestión de empleados
      navigate("/empleados");
    } catch {
      // Mostrar mensaje de error si la actualización falla
      alert("Hubo un problema al guardar los cambios.");
    }
  };

  /* ----------------------------------------------------------
     RENDERIZADO (JSX)
     Estructura visual completa de la página de edición de empleados
     ---------------------------------------------------------- */
  return (
    <div className="dark-theme">
      {/* Barra de navegación superior con enlace para volver a la lista de empleados */}
      <nav className="top-nav">
        <Link to="/empleados" className="no-text-decor">VOLVER</Link>
      </nav>

      {/* Encabezado principal con logo, título y nombre del admin */}
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
                <img src="../img/logo kimuka.png" alt="logo Kimuka" />
              </div>
              {/* Título de la página de edición de personal */}
              <h1>Editar Personal</h1>
            </div>
          </div>
          {/* Celda de acciones: nombre del administrador */}
          <div className="header-actions-cell">
            {/* Botón que muestra el nombre del administrador logueado */}
            <button className="btn-login">{adminName}</button>
          </div>
        </div>
      </header>

      {/* Contenido principal de la página */}
      <main className="content-wrapper">
        {/* Panel de registro/edición con diseño de dos columnas */}
        <div className="panel-registro">
          {/* Sección izquierda: formulario de edición */}
          <section className="form-section-cell">
            {/* Título del formulario */}
            <h2 className="form-title">Editar Perfil</h2>
            {/* Formulario de edición con grid layout */}
            <form className="grid-form" onSubmit={handleSubmit}>
              {/* Fila: Primer Nombre y Segundo Nombre */}
              <div className="input-row">
                {/* Campo de Primer Nombre */}
                <div className="input-cell">
                  <label>Primer Nombre</label>
                  <input type="text" name="pNombre" value={formData.pNombre} onChange={handleChange} required />
                </div>
                {/* Campo de Segundo Nombre (opcional) */}
                <div className="input-cell">
                  <label>Segundo Nombre</label>
                  <input type="text" name="sNombre" value={formData.sNombre} onChange={handleChange} />
                </div>
              </div>

              {/* Fila: Primer Apellido y Segundo Apellido */}
              <div className="input-row">
                {/* Campo de Primer Apellido */}
                <div className="input-cell">
                  <label>Primer Apellido</label>
                  <input type="text" name="pApellido" value={formData.pApellido} onChange={handleChange} required />
                </div>
                {/* Campo de Segundo Apellido (opcional) */}
                <div className="input-cell">
                  <label>Segundo Apellido</label>
                  <input type="text" name="sApellido" value={formData.sApellido} onChange={handleChange} />
                </div>
              </div>

              {/* Campo: Correo Electrónico */}
              <div className="input-group">
                <label>Correo Electrónico</label>
                <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />
              </div>

              {/* Campo: Nueva Contraseña (dejar vacío para mantener la actual) */}
              <div className="input-group">
                <label>Nueva Contraseña (dejar vacío para mantener)</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} />
              </div>

              {/* Campo: Estado del empleado (ACTIVO/INACTIVO) */}
              <div className="input-group">
                <label>Estado</label>
                {/* Selector de estado del empleado */}
                <select name="idEstado" value={formData.idEstado} onChange={handleChange}>
                  {/* Opción: ACTIVO */}
                  <option value="EST-001">ACTIVO</option>
                  {/* Opción: INACTIVO */}
                  <option value="EST-002">INACTIVO</option>
                </select>
              </div>

              {/* Botón para enviar el formulario y guardar los cambios */}
              <button type="submit" className="btn-submit">Guardar cambios</button>
            </form>
          </section>

          {/* Sección derecha: imagen de vista previa/avatar */}
          <section className="image-section-cell">
            {/* Título de la sección de imagen */}
            <h2 className="avatar-preview-text">Foto-Trabajador</h2>
            {/* Contenedor de la imagen de vista previa */}
            <div className="portrait-wrapper">
              {/* Imagen decorativa de vista previa del empleado */}
              <img src="../img/registroDePersonal kk .png" alt="Vista previa" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// Exportar el componente como exportación por defecto
export default Editarempleados;
