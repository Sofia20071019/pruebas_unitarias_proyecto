// ============================================================================
// ARCHIVO: api.js (Cliente API principal)
// PROPOSITO: Módulo centralizado que gestiona todas las comunicaciones HTTP
//            entre el frontend React y el backend Flask (API REST).
//            Implementa autenticación JWT, manejo de errores y todas las
//            operaciones CRUD disponibles en la API.
// ============================================================================

// Obtiene la URL base de la API desde las variables de entorno de Vite (.env)
// Si no existe la variable VITE_API_URL, usa localhost:5000 como valor por defecto
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// ---------------------------------------------------------------------------
// Función auxiliar: getToken
// ---------------------------------------------------------------------------
// Extrae el token JWT del localStorage para incluirlo en las peticiones
// autenticadas. El token se almacena dentro del objeto JSON del usuario
// logueado bajo la clave 'usuarioLogueado'.
// Retorna: string con el token JWT, o null si no hay sesión activa o hay error
// ---------------------------------------------------------------------------
function getToken() {
  // Obtiene el string JSON del usuario guardado en localStorage
  const user = localStorage.getItem('usuarioLogueado');
  // Verifica que exista un usuario almacenado
  if (user) {
    try {
      // Parsea el JSON y extrae la propiedad 'token' que contiene el JWT
      return JSON.parse(user).token;
    } catch {
      // Si el JSON está corrupto o no se puede parsear, retorna null
      return null;
    }
  }
  // Si no hay usuario en localStorage, retorna null (no autenticado)
  return null;
}

// ---------------------------------------------------------------------------
// Función auxiliar: construirQuery
// ---------------------------------------------------------------------------
// Convierte un objeto de filtros en una query string para la URL.
// Omite los valores vacíos, nulos o 'todos' (sin filtro) para no enviarlos.
// Ejemplo: { mes: '03', anio: '2026' } → '?mes=03&anio=2026'
// ---------------------------------------------------------------------------
function construirQuery(params = {}) {
  const query = Object.entries(params)
    .filter(([, valor]) => valor !== '' && valor !== null && valor !== undefined && valor !== 'todos')
    .map(([clave, valor]) => `${encodeURIComponent(clave)}=${encodeURIComponent(valor)}`)
    .join('&');
  return query ? `?${query}` : '';
}

// ---------------------------------------------------------------------------
// Función auxiliar: descargarBlob
// ---------------------------------------------------------------------------
// Dispara la descarga en el navegador de un Blob recibido del backend.
// Crea un objeto URL temporal, simula un click en un enlace y lo libera.
// ---------------------------------------------------------------------------
export function descargarBlob(blob, nombreArchivo = 'reporte.xlsx') {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Función auxiliar: nombreArchivoDeRespuesta
// ---------------------------------------------------------------------------
// Extrae el nombre del archivo descargable del header Content-Disposition
// que envía el backend (ej: "attachment; filename=reporte.xlsx").
// ---------------------------------------------------------------------------
function nombreArchivoDeRespuesta(response, porDefecto = 'reporte.xlsx') {
  const header = response.headers.get('Content-Disposition') || '';
  const match = header.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }
  return porDefecto;
}

// ---------------------------------------------------------------------------
// Objeto api: Cliente API completo
// ---------------------------------------------------------------------------
// Exporta un objeto con todos los endpoints de la API organizados por dominio.
// Cada método interno usa request() que se encarga de inyectar automáticamente
// el token de autenticación JWT en el header Authorization de cada petición.
// ---------------------------------------------------------------------------
export const api = {

  // -----------------------------------------------------------------------
  // Método base: request
  // -----------------------------------------------------------------------
  // Función genérica que ejecuta cualquier petición HTTP contra la API.
  // Automáticamente:
  //   1. Obtiene el token JWT actual
  //   2. Configura los headers Content-Type y Authorization
  //   3. Ejecuta el fetch con los parámetros recibidos
  //   4. Parsea la respuesta JSON
  //   5. Lanza un error si la respuesta HTTP no es exitosa (status fuera de 200-299)
  //
  // Parámetros:
  //   - endpoint: string con la ruta relativa de la API (ej: '/api/usuarios')
  //   - options: objeto con opciones de fetch (method, body, headers extra, etc.)
  // Retorna: objeto con la respuesta JSON de la API
  // -----------------------------------------------------------------------
  async request(endpoint, options = {}) {
    // Obtiene el token JWT de la sesión activa
    const token = getToken();

    // Crea el objeto de headers con Content-Type JSON por defecto
    // y permite fusionar headers adicionales si se proporcionan en options
    const headers = { 'Content-Type': 'application/json', ...options.headers };

    // Si hay un token válido, agrega el header de autorización Bearer
    // Este header es requerido por todos los endpoints protegidos del backend
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Ejecuta la petición fetch contra la URL completa de la API
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,    // Headers con autenticación
      ...options, // Opciones adicionales (method, body, etc.) que pueden sobreescribir headers
    });

    // Convierte la respuesta a formato JSON
    const data = await response.json();

    // Si la respuesta HTTP indica error (4xx, 5xx), lanza una excepción
    // El mensaje de error viene del backend en data.message, o se usa el código HTTP
    if (!response.ok) throw new Error(data.message || `Error ${response.status}`);

    // Retorna los datos exitosos de la respuesta
    return data;
  },

  // -----------------------------------------------------------------------
  // Método base: descargar
  // -----------------------------------------------------------------------
  // Ejecuta una petición HTTP autenticada que espera un archivo binario
  // (por ejemplo un .xlsx generado por el backend) en lugar de JSON.
  // Verifica el estado HTTP, extrae el nombre del archivo del header
  // Content-Disposition y retorna { blob, nombreArchivo } para que la página
  // dispare la descarga. Si la respuesta es un error JSON, lanza su mensaje.
  // -----------------------------------------------------------------------
  async descargar(endpoint, options = {}) {
    // Obtiene el token JWT de la sesión activa
    const token = getToken();

    // Headers con la autenticación Bearer (sin Content-Type JSON,
    // la respuesta esperada es un archivo binario)
    const headers = { ...options.headers };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Ejecuta la petición fetch contra la URL completa de la API
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    // Si la respuesta HTTP indica error (4xx, 5xx), intenta leer el mensaje
    // del backend en formato JSON o usa el código de estado como fallback
    if (!response.ok) {
      let mensaje = `Error ${response.status}`;
      try {
        const err = await response.json();
        if (err.message) mensaje = err.message;
      } catch {
        // La respuesta no era JSON (ej: archivo no generado)
      }
      throw new Error(mensaje);
    }

    // Convierte la respuesta a Blob y obtiene el nombre del archivo
    const blob = await response.blob();
    const nombreArchivo = nombreArchivoDeRespuesta(response);
    return { blob, nombreArchivo };
  },

  // =====================================================================
  // DOMINIO: AUTENTICACIÓN (auth)
  // =====================================================================
  auth: {
    // Endpoint de inicio de sesión: envía correo y contraseña al backend,
    // que retorna un JWT y los datos del usuario si las credenciales son válidas
    login: (correo, password) =>
      api.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo, password }),
      }),

    // Endpoint de recuperación de contraseña: envía el correo electrónico
    // para que el backend procese el restablecimiento (probablemente envía un email)
    recuperarContrasena: (correo) =>
      api.request('/api/auth/recuperar-contrasena', {
        method: 'POST',
        body: JSON.stringify({ correo }),
      }),

    // Endpoint de verificación de token: valida si el JWT actual sigue vigente
    // y es auténtico. Útil para verificar la sesión periódicamente
    verificarToken: () =>
      api.request('/api/auth/verificar-token'),
  },

  // =====================================================================
  // DOMINIO: USUARIOS (CRUD completo)
  // =====================================================================
  usuarios: {
    // Lista todos los usuarios registrados en el sistema
    listar: () => api.request('/api/usuarios'),

    // Obtiene un usuario específico por su ID
    obtener: (id) => api.request(`/api/usuarios/${id}`),

    // Crea un nuevo usuario con los datos proporcionados en el body
    crear: (data) =>
      api.request('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // Actualiza los datos de un usuario existente identificado por su ID
    actualizar: (id, data) =>
      api.request(`/api/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    // Elimina permanentemente un usuario del sistema por su ID
    eliminar: (id) =>
      api.request(`/api/usuarios/${id}`, { method: 'DELETE' }),

    // Desactiva un usuario (soft delete): cambia su estado a inactivo
    // sin eliminarlo físicamente de la base de datos
    desactivar: (id) =>
      api.request(`/api/usuarios/${id}/desactivar`, { method: 'PUT' }),
  },

  // =====================================================================
  // DOMINIO: EMPLEADOS
  // =====================================================================
  empleados: {
    // Lista todos los usuarios que tienen rol de empleado (ROL-002)
    // Filtrado por el backend para mostrar solo personal operativo
    listar: () => api.request('/api/empleados'),
  },

  // =====================================================================
  // DOMINIO: ROLES
  // =====================================================================
  roles: {
    // Lista todos los roles disponibles en el sistema (ej: ROL-001 Admin, ROL-002 Empleado)
    // Se usa principalmente en formularios de registro y edición de usuarios
    listar: () => api.request('/api/roles'),
  },

  // =====================================================================
  // DOMINIO: INSUMOS (materia prima para producción textil)
  // =====================================================================
  insumos: {
    // Lista todos los insumos registrados (telas, hilos, botones, etc.)
    listar: () => api.request('/api/insumos'),

    // Registra un nuevo insumo en el inventario
    crear: (data) =>
      api.request('/api/insumos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // Actualiza la información de un insumo existente (nombre, cantidad, unidad, etc.)
    actualizar: (id, data) =>
      api.request(`/api/insumos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    // Elimina un insumo del inventario de forma permanente
    eliminar: (id) =>
      api.request(`/api/insumos/${id}`, { method: 'DELETE' }),
  },

  // =====================================================================
  // DOMINIO: ASIGNACIONES DE INSUMOS A EMPLEADOS
  // =====================================================================
  asignaciones: {
    // Lista todas las asignaciones de insumos a empleados
    listar: () => api.request('/api/asignaciones'),

    // Crea una nueva asignación: vincula un insumo con un empleado para uso en producción
    crear: (data) =>
      api.request('/api/asignaciones', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // Obtiene todas las asignaciones de un empleado específico por su ID
    // Usado para ver qué insumos tiene asignados un empleado
    porEmpleado: (id) => api.request(`/api/asignaciones/empleado/${id}`),

    // Cambia el estado de una asignación (ej: pendiente → aprobada → entregada)
    // El body contiene el nuevo estado y posiblemente comentarios
    cambiarEstado: (id, data) =>
      api.request(`/api/asignaciones/${id}/estado`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // =====================================================================
  // DOMINIO: CATEGORÍAS DE PRODUCTOS
  // =====================================================================
  categorias: {
    // Lista todas las categorías de productos (ej: camisas, pantalones, faldas)
    // Se usa en formularios de pedidos y gestión de productos
    listar: () => api.request('/api/categorias'),
  },

  // =====================================================================
  // DOMINIO: UNIDADES DE MEDIDA
  // =====================================================================
  unidadesMedida: {
    // Lista todas las unidades de medida disponibles (metros, yardas, piezas, kg, etc.)
    // Se usa en la gestión de insumos y asignaciones de materia prima
    listar: () => api.request('/api/unidades-medida'),
  },

  // =====================================================================
  // DOMINIO: ÓRDENES DE PRODUCCIÓN / PEDIDOS
  // =====================================================================
  ordenes: {
    // Lista todas las órdenes de producción/pedidos registrados
    listar: () => api.request('/api/ordenes'),

    // Obtiene los detalles completos de una orden específica por su ID
    obtener: (id) => api.request(`/api/ordenes/${id}`),

    // Crea una nueva orden de producción con los datos del pedido
    // Incluye: cliente, productos, cantidades, fechas de entrega, etc.
    crear: (data) =>
      api.request('/api/ordenes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // Actualiza una orden existente (cambiar estado, modificar cantidades, etc.)
    actualizar: (id, data) =>
      api.request(`/api/ordenes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // =====================================================================
  // DOMINIO: JORNADAS LABORALES
  // =====================================================================
  jornadas: {
    // Lista todas las jornadas laborales registradas en el sistema
    listar: () => api.request('/api/jornadas'),

    // Registra el inicio de una nueva jornada laboral para un empleado
    // Contiene: id del empleado, hora de inicio, fecha
    crear: (data) =>
      api.request('/api/jornadas', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // Finaliza una jornada laboral existente registrando la hora de fin
    // Se usa al cerrar sesión del empleado (registro de salida)
    finalizar: (id, data) =>
      api.request(`/api/jornadas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    // Obtiene todas las jornadas de un empleado específico
    // Usado para mostrar historial de horas trabajadas
    porEmpleado: (id) => api.request(`/api/jornadas/empleado/${id}`),

    // Calcula el pago correspondiente a una jornada específica
    // El backend calcula: horas_trabajadas × tarifa_horaria
    calcularPago: (id) => api.request(`/api/jornadas/calcular-pago/${id}`),
  },

  // =====================================================================
  // DOMINIO: PAGOS
  // =====================================================================
  pagos: {
    // Lista todos los pagos registrados en el sistema
    listar: () => api.request('/api/pagos'),

    // Registra un nuevo pago para un empleado
    // Incluye: empleado, monto, método de pago, jornadas cubiertas, etc.
    crear: (data) =>
      api.request('/api/pagos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // Aprueba o rechaza un pago pendiente
    // El body contiene: nuevo estado (aprobado/rechazado) y posiblemente observaciones
    aprobar: (id, data) =>
      api.request(`/api/pagos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // =====================================================================
  // DOMINIO: MÉTODOS DE PAGO
  // =====================================================================
  metodosPago: {
    // Lista los métodos de pago disponibles (efectivo, transferencia, tarjeta, etc.)
    // Se usa en formularios de registro de pagos
    listar: () => api.request('/api/metodos-pago'),
  },

  // =====================================================================
  // DOMINIO: CLIENTES
  // =====================================================================
  clientes: {
    // Lista todos los clientes registrados (empresas o personas que hacen pedidos)
    listar: () => api.request('/api/clientes'),

    // Registra un nuevo cliente en el sistema
    // Incluye: nombre, dirección, teléfono, correo, etc.
    crear: (data) =>
      api.request('/api/clientes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // =====================================================================
  // DOMINIO: PRODUCTOS
  // =====================================================================
  productos: {
    // Lista todos los productos que fabrica/vende la empresa textil
    listar: () => api.request('/api/productos'),

    // Registra un nuevo producto en el catálogo
    // Incluye: nombre, categoría, ficha técnica, precio, etc.
    crear: (data) =>
      api.request('/api/productos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // =====================================================================
  // DOMINIO: REPORTES (consulta de datos y exportación a Excel)
  // =====================================================================
  reportes: {
    // Reporte de horas trabajadas por empleado, filtrable por mes y año.
    // Retorna resumen de horas + detalle de jornadas del filtro.
    horas: (params = {}) =>
      api.request(`/api/reportes/horas${construirQuery(params)}`),

    // Versión Excel del reporte de horas: descarga el archivo .xlsx
    exportarHoras: (params = {}) =>
      api.descargar(`/api/reportes/horas/excel${construirQuery(params)}`),

    // Reporte de trabajos/asignaciones de insumos a empleados.
    // Filtrable por mes y año; retorna resumen y detalle de asignaciones.
    trabajos: (params = {}) =>
      api.request(`/api/reportes/trabajos${construirQuery(params)}`),

    // Versión Excel del reporte de trabajos
    exportarTrabajos: (params = {}) =>
      api.descargar(`/api/reportes/trabajos/excel${construirQuery(params)}`),

    // Reporte de producción de órdenes/pedidos.
    // Filtrable por mes y año; retorna resumen y detalle de órdenes.
    produccion: (params = {}) =>
      api.request(`/api/reportes/produccion${construirQuery(params)}`),

    // Versión Excel del reporte de producción
    exportarProduccion: (params = {}) =>
      api.descargar(`/api/reportes/produccion/excel${construirQuery(params)}`),

    // Reporte de materias primas (insumos), filtrable por categoría.
    // Retorna resumen de stock total y detalle de insumos con existencia.
    materiasPrimas: (params = {}) =>
      api.request(`/api/reportes/materias-primas${construirQuery(params)}`),

    // Versión Excel del reporte de materias primas
    exportarMateriasPrimas: (params = {}) =>
      api.descargar(`/api/reportes/materias-primas/excel${construirQuery(params)}`),
  },

// =====================================================================
  // DOMINIO: MOLDES
  // =====================================================================
  moldes: {
    listar: (params = {}) =>
      api.request(`/api/moldes${construirQuery(params)}`),

    obtener: (id) => 
      api.request(`/api/moldes/${id}`),

    crear: (data) =>
      api.request('/api/moldes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    actualizar: (id, data) =>
      api.request(`/api/moldes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    eliminar: (id) =>
      api.request(`/api/moldes/${id}`, { method: 'DELETE' }),

    listarCategorias: () => 
      api.request('/api/moldes/categorias'),

    crearCategoria: (data) =>
      api.request('/api/moldes/categorias', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    eliminarCategoria: (id) =>
      api.request(`/api/moldes/categorias/${id}`, {
        method: 'DELETE',
      }),

    // Subir archivo binario de imagen (PNG, JPG, WEBP)
    subirImagen: async (archivo) => {
      const token = getToken();
      const formData = new FormData();
      formData.append('archivo', archivo);

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/api/moldes/subir-imagen`, {
        method: 'POST',
        headers, // No poner 'Content-Type', fetch lo configura solo al enviar FormData
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al subir la imagen');
      return data;
    },
  },
};
