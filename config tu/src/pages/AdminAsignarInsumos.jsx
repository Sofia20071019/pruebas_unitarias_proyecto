/* ==========================================================================
   ARCHIVO: AdminAsignarInsumos.jsx
   PROPÓSITO: Página de administración para asignar insumos (materiales) a
              empleados. Incluye un formulario de asignación, un panel de
              stock actual y un historial de todas las asignaciones realizadas.
   ========================================================================== */

// Importa los hooks useState (estado local) y useEffect (efectos secundarios)
import { useState, useEffect } from 'react';
// Importa Link para navegación entre rutas sin recargar la página
import { Link } from 'react-router-dom';
// Importa el módulo api que contiene los métodos para llamar al backend
import { api } from '../api';

// Define el componente funcional AdminAsignarInsumos
function AdminAsignarInsumos() {
  // Estado: lista de empleados registrados en el sistema
  const [empleados, setEmpleados] = useState([]);
  // Estado: lista de insumos disponibles en el inventario
  const [insumos, setInsumos] = useState([]);
  // Estado: historial de asignaciones realizadas
  const [asignaciones, setAsignaciones] = useState([]);
  // Estado: nombre del administrador obtenido de la sesión activa
  // Se inicializa de forma perezosa desde localStorage para no depender
  // de un setState dentro del useEffect (evita lint set-state-in-effect)
  const [adminName] = useState(() => {
    const nombreSesion = localStorage.getItem('kimuka_sesion_activa');
    return nombreSesion ? nombreSesion.toUpperCase() : 'ADMINISTRADOR';
  });
  // Estado: datos del formulario de asignación (empleado, insumo, cantidad)
  const [form, setForm] = useState({ idUsuario_Empleado: '', idInsumo: '', cantidad: '' });
  // Estado: mensaje informativo de éxito o error tras una asignación
  const [mensaje, setMensaje] = useState('');

  // useEffect que se ejecuta al montar el componente para cargar datos iniciales
  useEffect(() => {
    // Carga la lista de empleados desde el backend
    api.empleados.listar().then((r) => setEmpleados(r.data || [])).catch(() => {});
    // Carga la lista de insumos desde el backend
    api.insumos.listar().then((r) => setInsumos(r.data || [])).catch(() => {});
    // Carga el historial de asignaciones desde el backend
    api.asignaciones.listar().then((r) => setAsignaciones(r.data || [])).catch(() => {});
  }, []); // Dependencia vacía: solo se ejecuta una vez al montar

  // Busca el objeto del insumo actualmente seleccionado en el formulario
  // Se usa para mostrar el stock disponible de ese insumo específico
  const insumoSeleccionado = insumos.find((i) => i.idInsumo === form.idInsumo);

  /*
   * Función: handleSubmit
   * Propósito: Maneja el envío del formulario para crear una nueva asignación
   *            de insumo a un empleado. Valida, envía al backend y actualiza
   *            las listas de insumos y asignaciones.
   * Parámetros:
   *   e - Evento del formulario (se previene el comportamiento por defecto)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Limpia mensajes anteriores
    setMensaje('');
    try {
      // Llama al endpoint para crear la asignación con los datos del formulario
      await api.asignaciones.crear(form);
      // Muestra mensaje de éxito con la cantidad asignada
      setMensaje(`Asignación registrada: ${form.cantidad} unidades.`);
      // Resetea el formulario a sus valores iniciales
      setForm({ idUsuario_Empleado: '', idInsumo: '', cantidad: '' });
      // Recarga la lista de insumos para reflejar el stock actualizado
      api.insumos.listar().then((r) => setInsumos(r.data || [])).catch(() => {});
      // Recarga el historial de asignaciones para mostrar la nueva
      api.asignaciones.listar().then((r) => setAsignaciones(r.data || [])).catch(() => {});
    } catch (err) {
      // Muestra el mensaje de error si la asignación falla
      setMensaje(err.message || 'Error al asignar.');
    }
  };

  // Renderiza el JSX del componente
  return (
    <>
      { /* Barra de navegación superior con enlace al dashboard del administrador */}
      <nav className="top-nav">
        <Link to="/dashboardadmin">VOLVER</Link>
      </nav>
      { /* Encabezado principal con logo, título y nombre del administrador */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo-principal-cell">
            <div className="logo-principal">
              <div className="logo-circle"><img src="../img/logo kimuka.png" alt="Logo" /></div>
              <h1>Asignar Insumos</h1>
            </div>
          </div>
          <div className="header-actions-cell">
            { /* Botón que muestra el nombre del administrador (solo visual) */}
            <button className="btn-login">{adminName}</button>
          </div>
        </div>
      </header>

      { /* Contenedor principal del contenido */}
      <main className="content-wrapper">
        { /* Renderiza condicionalmente el mensaje de éxito o error */}
        {mensaje && (
          <div style={{ background: '#1a1a1a', border: '1px solid #2d2d2d', padding: '15px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center', color: mensaje.includes('Error') || mensaje.includes('insuficiente') ? '#e74c3c' : '#2ecc71' }}>
            {mensaje}
          </div>
        )}

        { /* Panel dividido en dos secciones: formulario y stock actual */}
        <div className="panel-registro">
          { /* Sección del formulario de asignación */}
          <section className="form-section-cell">
            <h2 className="form-title">Asignar Material a Empleado</h2>
            { /* Formulario que al enviarse llama a handleSubmit */}
            <form className="grid-form" onSubmit={handleSubmit}>
              { /* Selector de empleado */}
              <div className="input-group">
                <label>Empleado</label>
                <select value={form.idUsuario_Empleado} onChange={(e) => setForm({ ...form, idUsuario_Empleado: e.target.value })} required>
                  <option value="">Seleccione</option>
                  { /* Itera sobre los empleados para las opciones del select */}
                  {empleados.map((emp) => (
                    <option key={emp.idUsuario} value={emp.idUsuario}>{emp.nombre}</option>
                  ))}
                </select>
              </div>
              { /* Selector de insumo (muestra nombre y stock disponible) */}
              <div className="input-group">
                <label>Insumo</label>
                <select value={form.idInsumo} onChange={(e) => setForm({ ...form, idInsumo: e.target.value })} required>
                  <option value="">Seleccione</option>
                  { /* Itera sobre los insumos mostrando nombre, stock y unidad */}
                  {insumos.map((i) => (
                    <option key={i.idInsumo} value={i.idInsumo}>
                      {i.nombreInsumo} (Stock: {i.cantidad} {i.nombreUnidad})
                    </option>
                  ))}
                </select>
              </div>
              { /* Si hay un insumo seleccionado, muestra el campo de cantidad con el stock máximo */}
              {insumoSeleccionado && (
                <div className="input-group">
                  <label>Cantidad (Stock disponible: {insumoSeleccionado.cantidad} {insumoSeleccionado.nombreUnidad})</label>
                  <input type="number" step="0.01" min="0" max={insumoSeleccionado.cantidad} value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: e.target.value })} placeholder="0" required />
                </div>
              )}
              { /* Botón de envío del formulario */}
              <button type="submit" className="btn-submit w-100">Asignar Material</button>
            </form>
          </section>
          { /* Sección que muestra un resumen del stock actual de insumos */}
          <section className="image-section-cell">
            <h2 className="avatar-preview-text">Stock Actual</h2>
            { /* Si no hay insumos, muestra mensaje indicativo */}
            {insumos.length === 0 ? (
              <p className="text-secondary text-center">Sin insumos registrados.</p>
            ) : (
              // Muestra hasta 6 insumos en tarjetas de resumen
              insumos.slice(0, 6).map((i) => (
                <div key={i.idInsumo} style={{ background: '#1f1f1f', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                  <p className="font-size-sm text-secondary">{i.nombreInsumo}</p>
                  { /* Muestra la cantidad con clase de color según si es mayor a cero */}
                  <p className={i.cantidad > 0 ? 'status-success' : 'status-fail'} style={{ padding: '2px 8px', borderRadius: '8px', display: 'inline-block' }}>
                    {i.cantidad} {i.nombreUnidad}
                  </p>
                </div>
              ))
            )}
          </section>
        </div>

        { /* Sección del historial de asignaciones en tabla */}
        <section className="panel-gestion margin-t-20">
          <h3 className="margin-b-20">Historial de Asignaciones</h3>
          <div className="table-container">
            <table className="kimukaPedidos-table">
              { /* Cabecera de la tabla con las columnas */}
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Empleado</th>
                  <th>Insumo</th>
                  <th>Cantidad</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                { /* Si no hay asignaciones, muestra fila de tabla vacía */}
                {asignaciones.length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-secondary">Sin asignaciones.</td></tr>
                ) : (
                  // Itera sobre las asignaciones para generar las filas de la tabla
                  asignaciones.map((a) => (
                    <tr key={a.idAsignacion}>
                      <td>{a.idAsignacion}</td>
                      <td>{a.nombreEmpleado}</td>
                      <td>{a.nombreInsumo}</td>
                      <td>{a.cantidad}</td>
                      <td>{a.fechaAsignacion}</td>
                      { /* Muestra el estado con clase de estilo según el valor (Completada, En Proceso, etc.) */}
                      <td><span className={`status ${a.estado === 'Completada' ? 'status-success' : a.estado === 'En Proceso' ? 'status-pending' : 'status-pending'}`}>{a.estado}</span></td>
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

// Exporta el componente para ser usado en el enrutador
export default AdminAsignarInsumos;
