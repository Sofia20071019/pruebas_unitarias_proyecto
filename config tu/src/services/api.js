// ============================================================================
// ARCHIVO: services/api.js (Cliente API auxiliar/legacy)
// PROPOSITO: Cliente API alternativo que parece ser una versión anterior o
//            de prueba del sistema de comunicación con el backend.
//            Apunta al puerto 8000 (diferente al api.js principal que usa 5000).
//            Contiene solo dos métodos básicos de conexión y consulta.
//            NOTA: Este archivo NO parece estar en uso activo por las páginas
//                  del proyecto. El archivo principal es src/api.js.
// ============================================================================

// URL base del servidor API, lee de variables de entorno o usa puerto 8000 por defecto
// NOTA: Diferente al api.js principal que usa puerto 5000
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Objeto que expone los métodos de conexión con la API
export const conexionAPI = {

  // -----------------------------------------------------------------------
  // Método: obtenerPruebas
  // -----------------------------------------------------------------------
  // Realiza una petición GET al endpoint de prueba de conexión.
  // Útil para verificar que el backend está funcionando y accesible.
  // Retorna: objeto JSON con la respuesta del servidor
  // Lanza: Error si la respuesta HTTP no es exitosa
  // -----------------------------------------------------------------------
  obtenerPruebas: async () => {
    const respuesta = await fetch(`${BASE_URL}/api/v1/prueba-conexion`);
    if (!respuesta.ok) throw new Error('Error al traer datos');
    return await respuesta.json();
  },

  // -----------------------------------------------------------------------
  // Método: obtenerSuministros
  // -----------------------------------------------------------------------
  // Ejemplo de método para obtener la lista de suministros del inventario.
  // Es una versión simplificada de la funcionalidad de insumos en api.js principal.
  // Retorna: objeto JSON con la lista de suministros
  // -----------------------------------------------------------------------
  obtenerSuministros: async () => {
    const respuesta = await fetch(`${BASE_URL}/api/v1/suministros`);
    return await respuesta.json();
  }
};
