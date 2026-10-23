// ============================================================================
// ARCHIVO: InicioDeSesion.jsx (Página de login)
// PROPOSITO: Página de autenticación principal de la aplicación. Permite a
//            los usuarios iniciar sesión con su correo electrónico y contraseña.
//            Al autenticarse exitosamente:
//              1. Almacena los datos de sesión en localStorage
//              2. Redirige al dashboard correspondiente según el rol del usuario
//                 - ROL-001 (Administrador) → /dashboardadmin
//                 - ROL-002 (Empleado) → /registro-horas
//            Si falla la autenticación, muestra un mensaje de error.
//            Incluye enlace a la página de recuperación de contraseña.
// ============================================================================

// Importa los hooks useState (estado local)
import { useState } from 'react';
// Importa Link para navegación y useNavigate para redireccionamiento programático
import { Link, useNavigate } from 'react-router-dom';
// Importa el cliente API para realizar la petición de login al backend
import { api } from '../api';

// Función componente que renderiza el formulario de inicio de sesión
function InicioDeSesion() {
  // Estado local para el campo de correo electrónico del formulario
  const [email, setEmail] = useState('');
  // Estado local para el campo de contraseña del formulario
  const [password, setPassword] = useState('');
  // Hook de navegación programática: permite redirigir al usuario después del login
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // Función: handleLogin
  // ---------------------------------------------------------------------------
  // Manejador del envío del formulario de login. Ejecuta el flujo completo
  // de autenticación:
  //   1. Previene el envío tradicional del formulario (recarga de página)
  //   2. Llama al endpoint de login del backend con las credenciales
  //   3. Si es exitoso, guarda la sesión en localStorage y redirige
  //   4. Si falla, muestra un mensaje de error al usuario
  // ---------------------------------------------------------------------------
  const handleLogin = async (e) => {
    // Previene el comportamiento por defecto del formulario (recarga de página)
    e.preventDefault();
    try {
      // Realiza la petición POST al backend con correo y contraseña
      const response = await api.auth.login(email, password);
      // Extrae los datos del usuario de la respuesta de la API
      const user = response.data;

      // --- Almacenamiento de la sesión en localStorage ---
      // localStorage persiste los datos incluso después de cerrar el navegador

      // Guarda solo el nombre del usuario (usado para mostrar en headers)
      localStorage.setItem('kimuka_sesion_activa', user.nombre);
      // Guarda el objeto completo del usuario como JSON string
      // Incluye: idUsuario, nombre, correo, rol, idRol, token JWT, etc.
      localStorage.setItem('usuarioLogueado', JSON.stringify(user));
      // Guarda el token JWT de forma separada para conveniencia
      localStorage.setItem('token', user.token);

      // --- Redirección basada en el rol del usuario ---
      if (user.idRol === 'ROL-001') {
        // Si es Administrador (ROL-001), redirige al dashboard de administración
        navigate('/dashboardadmin');
      } else {
        // Si es Empleado (cualquier otro rol, típicamente ROL-002),
        // redirige al registro de horas (entrada de jornada laboral)
        navigate('/registro-horas');
      }
    } catch (error) {
      // Si la petición falla (credenciales incorrectas, error de red, etc.),
      // muestra un alert con el mensaje de error del backend o uno genérico
      alert(error.message || 'Credenciales inválidas. Verifica tu correo y contraseña.');
    }
  };

  return (
    <>
      {/* Barra de navegación superior con enlace para volver a la landing page */}
      <nav className="top-nav">
        <Link to="/">VOLVER</Link>
      </nav>

      {/* Contenido principal: formulario de login centrado en la página */}
      <main className="content-wrapper flex-center">
        <div className="panel-registro max-w-500">
          <div className="form-section-cell w-100">

            {/* Logo de Kimuka encima del formulario */}
            <div className="text-center margin-b-25">
              <img src="../img/logo kimuka.png" alt="Logo" className="logo-img-auth" />
            </div>

            {/* Título de la sección de autenticación */}
            <h2 className="form-title text-center margin-t-10 font-size-xl">Acceso al Sistema</h2>

            {/* Formulario de login */}
            {/* onSubmit llama a handleLogin que maneja la autenticación */}
            <form className="grid-form" id="form-login" onSubmit={handleLogin}>

              {/* Campo de correo electrónico */}
              <div className="input-group">
                <label htmlFor="user-email">Correo Electrónico Corporativo</label>
                <input
                  type="email"                    // Tipo email: validación nativa del navegador
                  id="user-email"                 // ID para asociar con el label (accesibilidad)
                  placeholder="hola@sitioincreible.co"  // Texto de ejemplo en el campo
                  value={email}                   // Valor controlado por el estado local
                  onChange={(e) => setEmail(e.target.value)}  // Actualiza el estado al escribir
                  required                        // Validación HTML: campo obligatorio
                />
              </div>

              {/* Campo de contraseña */}
              <div className="input-group">
                <label htmlFor="user-pass">Contraseña Corporativa</label>
                <input
                  type="password"                 // Tipo password: oculta los caracteres
                  id="user-pass"                  // ID para asociar con el label (accesibilidad)
                  placeholder="••••••••"          // Placeholder con puntos para indicar contraseña
                  value={password}                // Valor controlado por el estado local
                  onChange={(e) => setPassword(e.target.value)}  // Actualiza el estado al escribir
                  required                        // Validación HTML: campo obligatorio
                />
              </div>

              {/* Botón de envío del formulario */}
              <button type="submit" className="btn-submit w-100 margin-t-15">
                Ingresar de Forma Segura
              </button>

              {/* Separador visual y enlace a recuperación de contraseña */}
              <div className="text-center margin-t-20" style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
                <p className="text-muted font-size-sm" style={{ margin: 0 }}>
                  ¿Tienes problemas para acceder?{' '}
                  {/* Enlace a la página de recuperación de contraseña con estilo destacado */}
                  <Link to="/recuperar-contrasena" style={{ color: '#f39c12', fontWeight: 'bold', textDecoration: 'none' }}>
                    Recuperar contraseña aquí
                  </Link>
                </p>
              </div>

            </form>
          </div>
        </div>
      </main>
    </>
  );
}

// Exporta el componente como exportación por defecto para ser usado en App.jsx
export default InicioDeSesion;
