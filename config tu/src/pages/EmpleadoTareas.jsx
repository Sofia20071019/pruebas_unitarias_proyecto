/*
 * ARCHIVO: EmpleadoTareas.jsx
 * PROPOSITO: Página que permite al empleado visualizar sus materiales/insumos asignados
 *            y gestionar el estado de cada tarea asignada. El empleado puede iniciar una
 *            tarea (cambiar de Pendiente a En Proceso) o marcarla como completada. La tabla
 *            muestra el ID, material, cantidad, fecha de asignación, estado y una columna
 *            de acciones con botones contextuales según el estado actual de cada tarea.
 */

/* Importación de hooks de estado y efecto de React */
import { useState, useEffect } from 'react';
/* Link de react-router-dom para navegación interna sin recarga de página */
import { Link } from 'react-router-dom';
/* Cliente API centralizado para realizar peticiones al backend */
import { api } from '../api';

/**
 * Componente funcional EmpleadoTareas
 * Muestra las asignaciones de materiales del empleado logueado y permite
 * cambiar el estado de cada asignación (Pendiente -> En Proceso -> Completada).
 * Carga las asignaciones del usuario actual al montar el componente.
 */
function EmpleadoTareas() {
  /* Estado que almacena la lista de asignaciones de materiales del empleado */
  const [asignaciones, setAsignaciones] = useState([]);
  /* Estado que almacena el nombre del empleado para mostrarlo en el header.
     Se inicializa de forma perezosa desde localStorage para no depender de un
     setState dentro del useEffect (evita lint set-state-in-effect) */
  const [empleadoName] = useState(() => {
    const nombreSesion = localStorage.getItem('kimuka_sesion_activa');
    return nombreSesion ? nombreSesion.toUpperCase() : 'EMPLEADO';
  });

  /**
   * Efecto que se ejecuta una sola vez al montar el componente.
   * Lee los datos del usuario desde localStorage,
   * luego realiza una petición API para obtener las asignaciones del empleado.
   */
  useEffect(() => {
    /* Obtener los datos completos del usuario logueado desde localStorage */
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    /* Verificar que exista un usuario logueado antes de hacer la petición */
    if (usuarioLogueado) {
      /* Parsear el JSON del usuario para obtener su ID */
      const user = JSON.parse(usuarioLogueado);

      /* Petición API: obtener todas las asignaciones de materiales del empleado */
      api.asignaciones.porEmpleado(user.idUsuario)
        .then((r) => setAsignaciones(r.data || [])) /* Guardar las asignaciones, fallback a array vacío */
        .catch(() => {}); /* Silenciar errores de red */
    }
  }, []); /* Array de dependencias vacío: se ejecuta solo al montar el componente */

  /**
   * Función asíncrona que cambia el estado de una asignación específica.
   * Realiza la petición API para actualizar el estado y luego actualiza
   * el estado local para reflejar el cambio inmediatamente en la UI.
   * @param {number} id - ID de la asignación a modificar
   * @param {string} estado - Nuevo estado a asignar (En Proceso o Completada)
   */
  const cambiarEstado = async (id, estado) => {
    try {
      /* Petición API para cambiar el estado de la asignación en el servidor */
      await api.asignaciones.cambiarEstado(id, { estado });

      /* Actualizar el estado local: reemplazar la asignación modificada con su nuevo estado */
      setAsignaciones(asignaciones.map((a) =>
        /* Si el ID coincide con el modificado, crear un nuevo objeto con el estado actualizado */
        a.idAsignacion === id ? { ...a, estado } : a
      ));
    } catch (err) {
      /* En caso de error, mostrar alerta con el mensaje del servidor o uno genérico */
      alert(err.message || 'Error al actualizar.');
    }
  };

  /* ========== RENDERIZADO DEL COMPONENTE ========== */
  return (
    /* Fragmento vacío para agrupar elementos sin nodo div extra */
    <>
      {/* Barra de navegación superior con enlace para volver al dashboard del empleado */}
      <nav className="top-nav">
        {/* Enlace que redirige al dashboard del empleado */}
        <Link to="/dashboard-empleado">VOLVER</Link>
      </nav>

      {/* Encabezado principal de la página con logo y nombre del empleado */}
      <header className="main-header">
        {/* Contenedor flex del header que distribuye logo y acciones */}
        <div className="header-container">
          {/* Celda izquierda con el logo principal */}
          <div className="logo-principal-cell">
            {/* Contenedor del logo que agrupa imagen y título */}
            <div className="logo-principal">
              {/* Círculo decorativo con la imagen del logo */}
              <div className="logo-circle">
                {/* Imagen del logo de Kimuka */}
                <img src="../img/logo kimuka.png" alt="Logo" />
              </div>
              {/* Título de la página indicando la sección de materiales asignados */}
              <h1>Mis Materiales Asignados</h1>
            </div>
          </div>
          {/* Celda derecha con el botón que muestra el nombre del empleado */}
          <div className="header-actions-cell">
            {/* Botón que muestra el nombre del empleado logueado */}
            <button className="btn-login">{empleadoName}</button>
          </div>
        </div>
      </header>

      {/* Contenido principal de la página */}
      <main className="content-wrapper">
        {/* Sección que contiene la tabla de asignaciones de materiales */}
        <section className="panel-gestion">
          {/* Contenedor de la tabla con scroll horizontal si es necesario */}
          <div className="table-container">
            {/* Tabla que muestra los materiales asignados al empleado */}
            <table className="kimukaPedidos-table">
              {/* Encabezado de la tabla con los nombres de las columnas */}
              <thead>
                <tr>
                  {/* Columna: identificador de la asignación */}
                  <th>ID</th>
                  {/* Columna: nombre del material/insumo asignado */}
                  <th>Material</th>
                  {/* Columna: cantidad del material asignado */}
                  <th>Cantidad</th>
                  {/* Columna: fecha en que se realizó la asignación */}
                  <th>Fecha Asignación</th>
                  {/* Columna: estado actual de la asignación */}
                  <th>Estado</th>
                  {/* Columna: acciones disponibles según el estado de la asignación */}
                  <th>Acción</th>
                </tr>
              </thead>
              {/* Cuerpo de la tabla con las filas de asignaciones */}
              <tbody>
                {/* Renderizado condicional: si no hay asignaciones, mostrar mensaje */}
                {asignaciones.length === 0 ? (
                  /* Fila vacía con mensaje indicando que no hay materiales asignados */
                  <tr><td colSpan="6" className="text-center text-secondary">No tienes materiales asignados.</td></tr>
                ) : (
                  /* Iterar sobre el array de asignaciones para crear las filas de la tabla */
                  asignaciones.map((a) => (
                    /* Fila de la tabla con clave única basada en el ID de la asignación */
                    <tr key={a.idAsignacion}>
                      {/* Celda: ID de la asignación */}
                      <td>{a.idAsignacion}</td>
                      {/* Celda: nombre del material o insumo asignado */}
                      <td>{a.nombreInsumo}</td>
                      {/* Celda: cantidad asignada del material */}
                      <td>{a.cantidad}</td>
                      {/* Celda: fecha de la asignación */}
                      <td>{a.fechaAsignacion}</td>
                      {/* Celda: estado de la asignación con clase CSS dinámica según su estado */}
                      <td>
                        {/* Span con clase de estilo condicional:
                            - Completada → status-success (verde)
                            - En Proceso → status-pending (amarillo/naranja)
                            - Pendiente → status-pending (amarillo/naranja) */}
                        <span className={`status ${a.estado === 'Completada' ? 'status-success' : a.estado === 'En Proceso' ? 'status-pending' : 'status-pending'}`}>{a.estado}</span>
                      </td>
                      {/* Celda de acciones: botones según el estado actual de la asignación */}
                      <td>
                        {/* Si el estado es Pendiente, mostrar botón para iniciar la tarea */}
                        {a.estado === 'Pendiente' && (
                          /* Botón que cambia el estado de Pendiente a En Proceso al hacer clic */
                          <button className="btn-login" onClick={() => cambiarEstado(a.idAsignacion, 'En Proceso')}>Iniciar</button>
                        )}
                        {/* Si el estado es En Proceso, mostrar botón para marcar como completada */}
                        {a.estado === 'En Proceso' && (
                          /* Botón que cambia el estado de En Proceso a Completada al hacer clic */
                          <button className="btn-submit" onClick={() => cambiarEstado(a.idAsignacion, 'Completada')}>Completar</button>
                        )}
                        {/* Si el estado es Completada, mostrar texto indicando que la tarea finalizó */}
                        {a.estado === 'Completada' && (
                          /* Texto informativo indicando que la tarea ya fue completada */
                          <span className="text-muted font-size-sm">Finalizado</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

/* Exportar el componente EmpleadoTareas como exportación por defecto */
export default EmpleadoTareas;
