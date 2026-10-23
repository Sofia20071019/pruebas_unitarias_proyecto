/* ============================================================
   ARCHIVO: GestionEmpleados.jsx
   PROPOSITO: Componente de página que permite administrar el
              personal/empleados de la empresa Kimuka. Muestra
              una tabla con todos los empleados registrados,
              ofrece funcionalidades de búsqueda por nombre,
              edición de empleados existentes y desactivación
              de empleados. Se conecta con la API backend para
              listar, editar y desactivar usuarios del sistema.
   ============================================================ */

// Importación de hooks de estado y efecto de React
import { useState, useEffect } from "react";
// Importación de Link para navegación entre rutas sin recarga de página
import { Link } from 'react-router-dom';
// Importación del módulo de API para realizar peticiones HTTP al backend
import { api } from '../api';

/* ============================================================
   Componente principal: GestionEmpleados
   Renderiza la página completa de gestión de empleados con
   buscador, tabla de resultados y acciones de editar/desactivar.
   ============================================================ */
function GestionEmpleados() {

  /* ----------------------------------------------------------
     ESTADOS (useState)
     ---------------------------------------------------------- */

  // Lista de todos los empleados obtenidos desde el backend
  const [empleados, setEmpleados] = useState([]);

  // Texto de búsqueda para filtrar empleados por nombre
  const [busqueda, setBusqueda] = useState("");

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

  /* ----------------------------------------------------------
     EFECTO SECUNDARIO (useEffect)
     Se ejecuta una sola vez al montar el componente.
     Carga la lista de empleados/usuarios desde la API.
     ---------------------------------------------------------- */
  useEffect(() => {
    // Realizar petición GET para obtener la lista de usuarios/empleados
    api.usuarios.listar()
      .then((res) => setEmpleados(res.data || [])) // Guardar la lista de empleados en el estado
      .catch((err) => console.error("Error cargando personal:", err)); // Log de errores en consola
  }, []); // Array vacío: se ejecuta solo al montar el componente

  /* ----------------------------------------------------------
     FUNCIÓN: desactivarEmpleado
     Propósito: Desactivar un empleado del sistema, cambiando
                su estado a INACTIVO sin eliminar sus registros
                históricos.
     Parámetros: id - ID del usuario/Empleado a desactivar
     Comportamiento: Muestra un cuadro de confirmación, si el
     usuario acepta, envía la petición de desactivación a la API,
     actualiza el estado local del empleado y muestra una alerta.
     ---------------------------------------------------------- */
  const desactivarEmpleado = async (id) => {
    // Mostrar cuadro de diálogo de confirmación al usuario
    if (window.confirm("¿Desea desactivar este empleado? Sus registros históricos se conservarán.")) {
      try {
        // Enviar petición PUT/PATCH para desactivar el usuario en el backend
        await api.usuarios.desactivar(id);
        // Actualizar el estado local: cambiar el estado del empleado a INACTIVO
        setEmpleados(empleados.map((emp) =>
          // Si el ID coincide, actualizar su estado; de lo contrario, mantenerlo igual
          emp.idUsuario === id ? { ...emp, idEstado: 'EST-002', estado: 'INACTIVO' } : emp
        ));
        // Mostrar confirmación de éxito
        alert("Empleado desactivado con éxito.");
      } catch {
        // Mostrar mensaje de error si la desactivación falla
        alert("No se pudo desactivar el empleado.");
      }
    }
  };

  /* ----------------------------------------------------------
     LÓGICA DE FILTRADO
     Filtra la lista de empleados según el texto de búsqueda,
     comparando contra el nombre y apellido de cada empleado.
     ---------------------------------------------------------- */
  const empleadosFiltrados = empleados.filter((emp) => {
    // Construir el nombre completo concatenando primer nombre y primer apellido
    const nombreCompleto = `${emp.pNombre || ''} ${emp.pApellido || ''}`.toLowerCase();
    // Verificar si el nombre completo contiene el texto de búsqueda
    return nombreCompleto.includes(busqueda.toLowerCase());
  });

  /* ----------------------------------------------------------
     RENDERIZADO (JSX)
     Estructura visual completa de la página de gestión de empleados
     ---------------------------------------------------------- */
  return (
    <div className="dark-theme">
      {/* Barra de navegación superior con enlace para volver al dashboard admin */}
      <nav className="top-nav">
        <Link to="/dashboardadmin" className="no-text-decor">VOLVER</Link>
      </nav>

      {/* Encabezado principal con logo, título y botones de acción */}
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
                <img src="../img/logo kimuka.png" alt="Logo Kimuka" />
              </div>
              {/* Título de la página de gestión de empleados */}
              <h1>Gestión De Empleado</h1>
            </div>
          </div>
          {/* Celda de acciones del encabezado */}
          <div className="header-actions-cell">
            {/* Botón que muestra el nombre del administrador logueado */}
            <button className="btn-login">{adminName}</button>
            {/* Botón con enlace para registrar un nuevo empleado */}
            <button className="btn-login">
              <Link to="/registro-personal" className="no-text-decor">Registrar Nuevo Empleado</Link>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal de la página */}
      <main className="content-wrapper">
        {/* Barra de herramientas con el buscador de personal */}
        <div className="toolbar margin-b-20">
          {/* Contenedor del campo de búsqueda con ancho máximo */}
          <div className="max-w-500">
            {/* Etiqueta del campo de búsqueda */}
            <label className="margin-b-10 text-center display-block">Buscador de Personal</label>
            {/* Campo de texto para buscar empleados por nombre */}
            <input
              type="text"
              placeholder="Buscar por nombre..." // Texto placeholder guía al usuario
              value={busqueda} // Valor sincronizado con el estado busqueda
              onChange={(e) => setBusqueda(e.target.value)} // Actualizar estado al escribir
            />
          </div>
        </div>

        {/* Panel de la tabla de empleados */}
        <div className="table-container panel-gestion">
          {/* Tabla de empleados con estilos personalizados */}
          <table className="kimukaPedidos-table">
            {/* Encabezado de la tabla con los nombres de las columnas */}
            <thead>
              <tr>
                {/* Columna: ID del usuario */}
                <th>ID</th>
                {/* Columna: Nombre completo del empleado */}
                <th>Nombre Completo</th>
                {/* Columna: Correo electrónico */}
                <th>Correo</th>
                {/* Columna: Rol asignado */}
                <th>Rol</th>
                {/* Columna: Estado actual (activo/inactivo) */}
                <th>Estado</th>
                {/* Columna: Acciones disponibles (editar/desactivar) */}
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            {/* Cuerpo de la tabla con las filas de datos */}
            <tbody>
              {/* Mostrar mensaje si no hay empleados que coincidan con la búsqueda */}
              {empleadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No hay registros disponibles.</td>
                </tr>
              ) : (
                empleadosFiltrados.map((emp) => (
                  <tr key={emp.idUsuario}>
                    {/* Celda: ID del usuario */}
                    <td>{emp.idUsuario}</td>
                    {/* Celda: Nombre completo (primer nombre + primer apellido) */}
                    <td>{emp.pNombre} {emp.pApellido}</td>
                    {/* Celda: Correo electrónico del empleado */}
                    <td>{emp.correo}</td>
                    {/* Celda: Badge del rol con clase CSS según el tipo de rol */}
                    <td>
                      <span className={`status ${emp.idRol === 'ROL-001' ? 'status-success' : 'status-pending'}`}>
                        {/* Mostrar el nombre del rol o su nombre alternativo */}
                        {emp.rol || emp.nombreRol}
                      </span>
                    </td>
                    {/* Celda: Badge del estado con clase CSS según activo/inactivo */}
                    <td>
                      <span className={`status ${emp.idEstado === 'EST-001' ? 'status-success' : 'status-fail'}`}>
                        {/* Mostrar el estado del empleado */}
                        {emp.estado || emp.nombreEstado}
                      </span>
                    </td>
                    {/* Celda: Acciones alineadas a la derecha */}
                    <td className="text-right">
                      {/* Contenedor de botones de acción */}
                      <div className="flex-row-gap-10">
                        {/* Botón de editar: enlace a la página de edición con el ID del empleado */}
                        <button className="btn-action">
                          <Link to={`/editarempleados/${emp.idUsuario}`} className="no-text-decor">Editar</Link>
                        </button>
                        {/* Botón de desactivar: ejecuta la función de desactivación al hacer clic */}
                        <button
                          className="btn-action btn-alert-color" // Clase de color de alerta (rojo)
                          onClick={() => desactivarEmpleado(emp.idUsuario)} // Llamar función con el ID del empleado
                        >
                          Desactivar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

// Exportar el componente como exportación por defecto
export default GestionEmpleados;
