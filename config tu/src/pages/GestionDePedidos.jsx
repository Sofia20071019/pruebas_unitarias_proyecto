/* ============================================================
   ARCHIVO: GestionDePedidos.jsx
   PROPOSITO: Componente de página que permite gestionar pedidos
              de la empresa Kimuka. Ofrece funcionalidades para
              listar, crear, buscar, filtrar y actualizar pedidos.
              Cada pedido contiene información del cliente, fecha
              y estado de producción (en proceso, entregado,
              cancelado). Se conecta con la API backend para
              persistir y consultar los datos en tiempo real.
   ============================================================ */

// Importación de hooks de estado y efecto
import { useState, useEffect } from 'react';
// Importación de Link para navegación entre rutas sin recarga de página
import { Link } from 'react-router-dom';
// Importación del módulo de API para realizar peticiones HTTP al backend
import { api } from '../api';

/* ============================================================
   Componente principal: GestionDePedidos
   Renderiza la página completa de gestión de pedidos con
   formulario, filtros y tabla de resultados.
   ============================================================ */
function GestionDePedidos() {

  /* ----------------------------------------------------------
     ESTADOS (useState)
     ---------------------------------------------------------- */

  // Controla la visibilidad del formulario de creación/edición de pedidos
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Almacena el ID del cliente seleccionado en el formulario nuevo
  const [idCliente, setIdCliente] = useState('');

  // Almacena la fecha del pedido introducida en el formulario
  const [fecha, setFecha] = useState('');

  // Almacena el estado de producción del pedido (.., ✔, ✖)
  const [estado, setEstado] = useState('..');

  // Bandera que indica si el formulario está en modo edición (true) o creación (false)
  const [esEdicion, setEsEdicion] = useState(false);

  // Almacena el ID de la orden que se está editando actualmente
  const [idEditando, setIdEditando] = useState('');

  // Texto de búsqueda para filtrar pedidos por ID de orden
  const [busqueda, setBusqueda] = useState('');

  // Filtro seleccionado para mostrar pedidos por estado (todos, entregado, proceso, cancelado)
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Lista completa de pedidos obtenida desde el backend
  const [listaPedidos, setListaPedidos] = useState([]);

  // Lista de clientes disponibles para asociar a un nuevo pedido
  const [clientes, setClientes] = useState([]);

  /* ----------------------------------------------------------
     EFECTO SECUNDARIO (useEffect)
     Se ejecuta una sola vez al montar el componente.
     Carga la lista de pedidos y clientes desde la API.
     ---------------------------------------------------------- */
  useEffect(() => {
    // Realizar petición GET para obtener todas las órdenes/pedidos
    api.ordenes.listar()
      .then((res) => setListaPedidos(res.data || [])) // Guardar la lista de pedidos en el estado
      .catch(() => {}); // Silenciar errores de red o backend

    // Realizar petición GET para obtener la lista de clientes registrados
    api.clientes.listar()
      .then((res) => setClientes(res.data || [])) // Guardar la lista de clientes en el estado
      .catch(() => {}); // Silenciar errores de red o backend
  }, []); // Array vacío: se ejecuta solo al montar el componente

  /* ----------------------------------------------------------
     FUNCIÓN: handleSubmit
     Propósito: Manejar el envío del formulario para crear
                un nuevo pedido o actualizar uno existente.
     Parámetros: e - evento del formulario (submit)
     Comportamiento: Previene la recarga de página, valida los
     datos, envía la petición correspondiente a la API, muestra
     una alerta de éxito/error y actualiza la lista de pedidos.
     ---------------------------------------------------------- */
  const handleSubmit = async (e) => {
    // Prevenir comportamiento por defecto del formulario (recarga de página)
    e.preventDefault();
    try {
      // Verificar si estamos en modo edición
      if (esEdicion) {
        // Enviar petición PUT para actualizar el estado del pedido existente
        await api.ordenes.actualizar(idEditando, { estadoProd: estado });
        // Mostrar confirmación de éxito al usuario
        alert('Pedido actualizado con éxito.');
      } else {
        // Modo creación: obtener el usuario logueado para asociarlo como administrador creador
        const usuarioLogueado = localStorage.getItem('usuarioLogueado');
        const user = JSON.parse(usuarioLogueado);
        // Enviar petición POST para crear un nuevo pedido con los datos del formulario
        await api.ordenes.crear({
          idCliente,                      // ID del cliente al que pertenece el pedido
          idUsuario_Admin: user.idUsuario, // ID del administrador que registra el pedido
          fechaPedido: fecha,             // Fecha del pedido
          estadoProd: estado,             // Estado inicial de producción
        });
        // Mostrar confirmación de éxito al usuario
        alert('Pedido registrado con éxito.');
      }
      // Limpiar el formulario después de una operación exitosa
      limpiarFormulario();
      // Recargar la lista de pedidos desde el backend para reflejar los cambios
      api.ordenes.listar().then((res) => setListaPedidos(res.data || [])).catch(() => {});
    } catch (error) {
      // Mostrar mensaje de error al usuario en caso de fallo
      alert(error.message || 'Error al procesar el pedido.');
    }
  };

  /* ----------------------------------------------------------
     FUNCIÓN: handleCargarEdicion
     Propósito: Cargar los datos de un pedido existente en el
                formulario para permitir su edición.
     Parámetros: pedido - objeto con los datos del pedido a editar
     Comportamiento: Rellena los campos del formulario con los
     valores del pedido y activa el modo edición.
     ---------------------------------------------------------- */
  const handleCargarEdicion = (pedido) => {
    // Establecer el cliente del pedido en el campo del formulario
    setIdCliente(pedido.idCliente);
    // Establecer la fecha del pedido (vacío si no existe)
    setFecha(pedido.fechaPedido || '');
    // Establecer el estado actual del pedido (predeterminado '..' si no existe)
    setEstado(pedido.estadoProd || '..');
    // Guardar el ID de la orden que se va a editar
    setIdEditando(pedido.idOrden);
    // Activar el modo edición para mostrar el título y botón correspondientes
    setEsEdicion(true);
    // Mostrar el formulario de edición
    setMostrarFormulario(true);
  };

  /* ----------------------------------------------------------
     FUNCIÓN: limpiarFormulario
     Propósito: Resetear todos los campos del formulario y
                ocultar el panel de creación/edición.
     Parámetros: Ninguno
     Comportamiento: Restaura todos los valores por defecto
     y oculta el formulario.
     ---------------------------------------------------------- */
  const limpiarFormulario = () => {
    // Limpiar el campo de cliente
    setIdCliente('');
    // Limpiar el campo de fecha
    setFecha('');
    // Restablecer el estado a "en proceso"
    setEstado('..');
    // Limpiar el ID de edición
    setIdEditando('');
    // Desactivar el modo edición
    setEsEdicion(false);
    // Ocultar el formulario
    setMostrarFormulario(false);
  };

  /* ----------------------------------------------------------
     LÓGICA DE FILTRADO
     Filtra la lista de pedidos según el texto de búsqueda
     y el filtro de estado seleccionado por el usuario.
     ---------------------------------------------------------- */
  const pedidosFiltrados = listaPedidos.filter((pedido) => {
    // Obtener el ID de la orden de forma segura (string vacío si no existe)
    const idSeguro = pedido.idOrden ? pedido.idOrden.toLowerCase() : '';
    // Verificar si el ID contiene el texto de búsqueda (ignorando mayúsculas/minúsculas)
    const coincideId = idSeguro.includes(busqueda.toLowerCase());
    // Variable que determina si el pedido coincide con el filtro de estado
    let coincideEstado = true;
    // Si el filtro es "entregado", verificar que el estado sea ✔
    if (filtroEstado === 'entregado') coincideEstado = pedido.estadoProd === '✔';
    // Si el filtro es "proceso", verificar que el estado sea ..
    if (filtroEstado === 'proceso') coincideEstado = pedido.estadoProd === '..';
    // Si el filtro es "cancelado", verificar que el estado sea ✖
    if (filtroEstado === 'cancelado') coincideEstado = pedido.estadoProd === '✖';
    // Retornar true solo si ambas condiciones se cumplen
    return coincideId && coincideEstado;
  });

  /* ----------------------------------------------------------
     RENDERIZADO (JSX)
     Estructura visual completa de la página de gestión de pedidos
     ---------------------------------------------------------- */
  return (
    <>
      {/* Barra de navegación superior con enlace para volver al inicio */}
      <nav className="top-nav">
        <Link to="/">VOLVER</Link>
      </nav>

      {/* Encabezado principal con logo, título y botón de acción */}
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
              {/* Título principal de la página */}
              <h1>Kimuka - Panel Operativo</h1>
            </div>
          </div>
          {/* Celda de acciones del encabezado */}
          <div className="header-actions-cell">
            {/* Botón que alterna la visibilidad del formulario o lo oculta */}
            <button className="btn-login" onClick={() => mostrarFormulario ? limpiarFormulario() : setMostrarFormulario(true)}>
              {/* Texto dinámico según el estado del formulario */}
              {mostrarFormulario ? "Ocultar Formulario" : "Nuevo Pedido"}
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal de la página */}
      <main className="content-wrapper">

        {/* Sección de filtros y búsqueda */}
        <section className="panel-gestion">
          {/* Grid de filtros de búsqueda */}
          <div className="filters-grid">
            {/* Celda del campo de búsqueda */}
            <div className="filter-cell">
              {/* Etiqueta del campo de búsqueda */}
              <label>Buscador Operativo</label>
              {/* Campo de texto para buscar por ID de orden, sincronizado con el estado busqueda */}
              <input type="text" placeholder="Buscar por ID de Orden..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
            {/* Celda del filtro por estado */}
            <div className="filter-cell">
              {/* Etiqueta del selector de estado */}
              <label>Estado de la Orden</label>
              {/* Selector de opciones para filtrar por estado de la orden */}
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                {/* Opción para mostrar todos los pedidos sin filtro */}
                <option value="todos">Todos los Estados</option>
                {/* Opción para mostrar solo pedidos entregados (✔) */}
                <option value="entregado">Entregados (✔)</option>
                {/* Opción para mostrar solo pedidos en proceso (..) */}
                <option value="proceso">En proceso (..)</option>
                {/* Opción para mostrar solo pedidos cancelados (✖) */}
                <option value="cancelado">Cancelado (✖)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Sección condicional del formulario: solo se muestra si mostrarFormulario es true */}
        {mostrarFormulario && (
          <section className="panel-gestion">
            {/* Título dinámico según el modo (edición o creación) */}
            <h3>{esEdicion ? `Actualizar Pedido: ${idEditando}` : "Nuevo Pedido"}</h3>
            {/* Formulario de creación/edición de pedidos */}
            <form className="grid-form margin-t-15" onSubmit={handleSubmit}>
              {/* Campo de selección de cliente: solo visible en modo creación */}
              {!esEdicion && (
                <div className="input-group">
                  {/* Etiqueta del selector de cliente */}
                  <label>Cliente</label>
                  {/* Selector de cliente con opciones cargadas desde la API */}
                  <select value={idCliente} onChange={(e) => setIdCliente(e.target.value)} required>
                    {/* Opción predeterminada placeholder */}
                    <option value="">Seleccione un cliente</option>
                    {/* Renderizar cada cliente como una opción del selector */}
                    {clientes.map((c) => (
                      <option key={c.idCliente} value={c.idCliente}>{c.nombreCliente}</option>
                    ))}
                  </select>
                </div>
              )}
              {/* Campo de fecha del pedido */}
              <div className="input-group">
                {/* Etiqueta del campo de fecha */}
                <label>Fecha</label>
                {/* Input de tipo date para seleccionar la fecha del pedido */}
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
              </div>
              {/* Campo de selección de estado de producción */}
              <div className="input-group">
                {/* Etiqueta del selector de estado */}
                <label>Estado</label>
                {/* Selector de opciones para el estado del pedido */}
                <select value={estado} onChange={(e) => setEstado(e.target.value)} required>
                  {/* Opción: En proceso */}
                  <option value="..">En proceso (..)</option>
                  {/* Opción: Entregado */}
                  <option value="✔">Entregado (✔)</option>
                  {/* Opción: Cancelado */}
                  <option value="✖">Cancelado (✖)</option>
                </select>
              </div>
              {/* Fila de botones de acción del formulario */}
              <div className="flex-row-gap-10 margin-t-15">
                {/* Botón para cancelar y cerrar el formulario */}
                <button type="button" className="btn-login" onClick={limpiarFormulario}>Cancelar</button>
                {/* Botón para enviar el formulario (crear o actualizar) */}
                <button type="submit" className="btn-submit">{esEdicion ? "Actualizar Pedido" : "Guardar Pedido"}</button>
              </div>
            </form>
          </section>
        )}

        {/* Sección de la tabla que muestra la lista de pedidos */}
        <section className="table-container">
          {/* Tabla de pedidos con estilos personalizados */}
          <table className="kimukaPedidos-table">
            {/* Encabezado de la tabla con los nombres de las columnas */}
            <thead>
              <tr>
                {/* Columna: ID de la orden */}
                <th>ID Orden</th>
                {/* Columna: Nombre del cliente */}
                <th>Cliente</th>
                {/* Columna: Fecha del pedido */}
                <th>Fecha</th>
                {/* Columna: Estado de producción */}
                <th>Estado</th>
                {/* Columna: Acciones disponibles */}
                <th>Acción</th>
              </tr>
            </thead>
            {/* Cuerpo de la tabla con las filas de datos */}
            <tbody>
              {/* Mostrar mensaje si no hay pedidos que coincidan con los filtros */}
              {pedidosFiltrados.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '15px' }}>No se encontraron pedidos.</td></tr>
              ) : (
                pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.idOrden}>
                    {/* Celda: ID de la orden con estilo en negrita */}
                    <td style={{ fontWeight: 'bold' }}>{pedido.idOrden}</td>
                    {/* Celda: Nombre del cliente (o 'N/A' si no existe) */}
                    <td>{pedido.nombreCliente || 'N/A'}</td>
                    {/* Celda: Fecha del pedido (o 'N/A' si no existe) */}
                    <td>{pedido.fechaPedido || 'N/A'}</td>
                    {/* Celda: Badge de estado con clase CSS dinámica según el estado */}
                    <td>
                      <span className={`status-badge state-${pedido.estadoProd === '✔' ? 'entregado' : pedido.estadoProd === '..' ? 'proceso' : 'cancelado'}`}>
                        {/* Texto descriptivo del estado */}
                        {pedido.estadoProd === '✔' ? 'Entregado (✔)' : pedido.estadoProd === '..' ? 'En proceso (..)' : 'Cancelado (✖)'}
                      </span>
                    </td>
                    {/* Celda: Botón para cargar el pedido en modo edición */}
                    <td>
                      <button type="button" className="btn-submit" style={{ padding: '5px 12px', fontSize: '14px', margin: '0' }}
                        onClick={() => handleCargarEdicion(pedido)}>
                        Actualizar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}

// Exportar el componente como exportación por defecto
export default GestionDePedidos;
