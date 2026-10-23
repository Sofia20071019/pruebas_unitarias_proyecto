/*
 * ARCHIVO: MisHoras.jsx
 * PROPOSITO: Página que permite al empleado visualizar su historial de jornadas laborales
 *            y el cálculo proyectado de su pago. Muestra un resumen con horas totales,
 *            tarifa por hora, total de jornadas completadas y el pago proyectado. Además
 *            despliega una tabla con el detalle de cada jornada incluyendo fecha, hora de
 *            entrada, hora de salida y duración calculada.
 */

/* Importación de hooks necesarios */
import { useState, useEffect } from 'react';
/* Link de react-router-dom para navegación interna sin recarga de página */
import { Link } from 'react-router-dom';
/* Cliente API centralizado para realizar peticiones al backend */
import { api } from '../api';

/**
 * Componente funcional MisHoras
 * Muestra las jornadas del empleado logueado y el cálculo de su pago proyectado.
 * Obtiene datos del localStorage para identificar al usuario y realiza dos
 * peticiones simultáneas al backend: una para las jornadas y otra para el cálculo.
 */
function MisHoras() {
  /* Estado que almacena la lista de jornadas laborales del empleado */
  const [jornadas, setJornadas] = useState([]);
  /* Estado que almacena el objeto con el cálculo de pago (horas totales, tarifa, pago total, etc.) */
  const [calculo, setCalculo] = useState(null);
  /* Estado que almacena el nombre del empleado para mostrarlo en el header.
     Se inicializa de forma perezosa desde localStorage para no depender de un
     setState dentro del useEffect (evita lint set-state-in-effect) */
  const [empleadoName] = useState(() => {
    const nombreSesion = localStorage.getItem('kimuka_sesion_activa');
    return nombreSesion ? nombreSesion.toUpperCase() : 'EMPLEADO';
  });
  /* Estado booleano que controla si los datos están siendo cargados.
     Se inicializa de forma perezosa: solo hay carga si existe un usuario
     logueado, evitando un setState síncrono dentro del useEffect
     (evita lint set-state-in-effect) */
  const [cargando, setCargando] = useState(() => !!localStorage.getItem('usuarioLogueado'));

  /**
   * Efecto que se ejecuta una sola vez al montar el componente.
   * Lee los datos del usuario desde localStorage, luego realiza dos
   * peticiones API en paralelo: las jornadas del empleado y el cálculo
   * de su pago proyectado.
   */
  useEffect(() => {
    /* Obtener los datos completos del usuario logueado desde localStorage */
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    /* Verificar que exista un usuario logueado antes de hacer las peticiones */
    if (usuarioLogueado) {
      /* Parsear el JSON del usuario para obtener su ID */
      const user = JSON.parse(usuarioLogueado);

      /* Ejecutar ambas peticiones API de forma simultánea para mejorar rendimiento */
      Promise.all([
        api.jornadas.porEmpleado(user.idUsuario),   /* Petición: obtener todas las jornadas del empleado */
        api.jornadas.calcularPago(user.idUsuario)    /* Petición: calcular el pago proyectado del empleado */
      ])
        .then(([resJornadas, resPago]) => {
          /* Guardar las jornadas obtenidas, usando un array vacío como fallback */
          setJornadas(resJornadas.data?.jornadas || []);
          /* Guardar el objeto de cálculo de pago */
          setCalculo(resPago.data);
        })
        .catch(() => {}) /* Silenciar errores de red (no mostrar nada al usuario) */
        .finally(() => setCargando(false)); /* Siempre ocultar el indicador de carga al finalizar */
    }
  }, []); /* Array de dependencias vacío: se ejecuta solo al montar el componente */

  /**
   * Función auxiliar para formatear una hora completa (HH:MM:SS) a solo HH:MM.
   * @param {string} hora - Cadena con la hora en formato completo
   * @returns {string} Hora formateada sin segundos, o '---' si no hay valor
   */
  const formatearHora = (hora) => {
    /* Si la hora es null, undefined o cadena vacía, retornar guiones */
    if (!hora) return '---';
    /* Extraer solo los primeros 5 caracteres (HH:MM) y retornar */
    return hora.substring(0, 5);
  };

  /**
   * Función auxiliar para calcular la duración entre dos horas dadas.
   * Maneja el caso donde la hora de fin es menor que la de inicio (cruza medianoche).
   * @param {string} hInicio - Hora de inicio en formato HH:MM
   * @param {string} hFin - Hora de fin en formato HH:MM
   * @returns {string} Duración formateada como 'Xh Ym', o '---' si faltan datos
   */
  const calcularDuracion = (hInicio, hFin) => {
    /* Si falta la hora de inicio o fin, retornar guiones */
    if (!hInicio || !hFin) return '---';

    /* Dividir la hora de inicio en horas y minutos, y convertir a números */
    const [h1, m1] = hInicio.split(':').map(Number);
    /* Dividir la hora de fin en horas y minutos, y convertir a números */
    const [h2, m2] = hFin.split(':').map(Number);

    /* Convertir la hora de inicio a total de minutos desde medianoche */
    let minutosInicio = h1 * 60 + m1;
    /* Convertir la hora de fin a total de minutos desde medianoche */
    let minutosFin = h2 * 60 + m2;

    /* Si la hora de fin es menor que la de inicio (cruza medianoche), sumar 24 horas en minutos */
    if (minutosFin < minutosInicio) minutosFin += 1440;

    /* Calcular la diferencia total en minutos */
    const diffMin = minutosFin - minutosInicio;

    /* Obtener las horas completas de la diferencia */
    const horas = Math.floor(diffMin / 60);
    /* Obtener los minutos restantes */
    const mins = diffMin % 60;

    /* Retornar la duración formateada como 'Xh Ym' */
    return `${horas}h ${mins}m`;
  };

  /* ========== RENDERIZADO DEL COMPONENTE ========== */
  return (
    /* Fragmento vacío para agrupar elementos sin agregar un nodo div extra */
    <>
      {/* Barra de navegación superior con enlace para volver al dashboard del empleado */}
      <nav className="top-nav">
        {/* Enlace de navegación que redirige al dashboard del empleado */}
        <Link to="/dashboard-empleado">VOLVER</Link>
      </nav>

      {/* Encabezado principal de la página con logo y nombre de usuario */}
      <header className="main-header">
        {/* Contenedor flex del header que distribuye logo y acciones */}
        <div className="header-container">
          {/* Celda izquierda con el logo principal de la empresa */}
          <div className="logo-principal-cell">
            {/* Contenedor del logo que agrupa imagen y título */}
            <div className="logo-principal">
              {/* Círculo que contiene la imagen del logo */}
              <div className="logo-circle">
                {/* Imagen del logo de Kimuka */}
                <img src="../img/logo kimuka.png" alt="Logo" />
              </div>
              {/* Título de la página: nombre de la empresa y sección actual */}
              <h1>Kimuka - Mis Horas</h1>
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
        {/* Sección de resumen de pago: solo se muestra si hay datos de cálculo disponibles */}
        {calculo && (
          <section className="panel-gestion">
            {/* Contenedor de estadísticas distribuido en dos columnas */}
            <div className="stats-container">
              {/* Columna izquierda: muestra las horas totales trabajadas */}
              <div className="stats-cell-left">
                {/* Bloque de información destacada */}
                <div className="highlight-info">
                  {/* Título de la estadística */}
                  <h4>Total Horas Trabajadas</h4>
                  {/* Valor de horas totales formateado con locale español */}
                  <p>{calculo.horasTotales} hrs</p>
                </div>
              </div>
              {/* Columna derecha: muestra el pago proyectado y detalles adicionales */}
              <div className="stats-cell-right">
                {/* Bloque de información destacada del pago */}
                <div className="highlight-info">
                  {/* Título de la estadística de pago */}
                  <h4>Pago Proyectado</h4>
                  {/* Valor del pago total formateado como moneda colombiana con separadores de miles */}
                  <p>$ {Number(calculo.pagoTotal).toLocaleString('es-CO')}</p>
                </div>
                {/* Contenedor con información secundaria: tarifa y total de jornadas */}
                <div className="margin-t-15 text-secondary font-size-sm">
                  {/* Muestra la tarifa por hora formateada como moneda colombiana */}
                  <p>Tarifa por hora: $ {Number(calculo.tarifaPorHora).toLocaleString('es-CO')}</p>
                  {/* Muestra la cantidad total de jornadas completadas */}
                  <p>Jornadas completadas: {calculo.totalJornadas}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Sección del historial de jornadas laborales */}
        <section className="panel-gestion">
          {/* Título de la sección de historial */}
          <h3 className="margin-b-20">Historial de Jornadas</h3>
          {/* Renderizado condicional según el estado de carga y datos */}
          {cargando ? (
            <p className="text-secondary">Cargando...</p>
          ) : jornadas.length === 0 ? (
            <p className="text-secondary text-center">No hay jornadas registradas.</p>
          ) : (
            <div className="table-container">
              {/* Tabla que muestra el historial de jornadas laborales */}
              <table className="kimukaPedidos-table">
                {/* Encabezado de la tabla con los nombres de las columnas */}
                <thead>
                  <tr>
                    {/* Columna: identificador de la jornada */}
                    <th>ID Jornada</th>
                    {/* Columna: fecha de la jornada */}
                    <th>Fecha</th>
                    {/* Columna: hora de entrada */}
                    <th>Entrada</th>
                    {/* Columna: hora de salida */}
                    <th>Salida</th>
                    {/* Columna: duración calculada */}
                    <th>Duración</th>
                  </tr>
                </thead>
                {/* Cuerpo de la tabla: se renderiza una fila por cada jornada */}
                <tbody>
                  {/* Iterar sobre el array de jornadas para crear las filas de la tabla */}
                  {jornadas.map((j) => (
                    <tr key={j.idJornada}>
                      {/* Celda: ID de la jornada */}
                      <td>{j.idJornada}</td>
                      {/* Celda: fecha de la jornada */}
                      <td>{j.fecha}</td>
                      {/* Celda: hora de entrada formateada (sin segundos) */}
                      <td>{formatearHora(j.hInicio)}</td>
                      {/* Celda: hora de salida formateada (sin segundos) */}
                      <td>{formatearHora(j.hFin)}</td>
                      {/* Celda: duración calculada entre hora de entrada y salida */}
                      <td>{calcularDuracion(j.hInicio, j.hFin)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

/* Exportar el componente MisHoras como exportación por defecto */
export default MisHoras;
