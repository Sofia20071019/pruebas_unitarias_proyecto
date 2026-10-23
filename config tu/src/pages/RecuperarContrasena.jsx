// ============================================================================
// ARCHIVO: RecuperarContrasena.jsx (Página de recuperación de contraseña)
// PROPOSITO: Página que permite a los usuarios solicitar el restablecimiento
//            de su contraseña. El usuario ingresa su correo electrónico
//            registrado y el sistema envía la solicitud al administrador
//            para que procese el cambio de contraseña manualmente.
//            No implementa recuperación automática por email.
// ============================================================================

// Importa useState para manejar el estado del campo de correo electrónico
import { useState } from 'react';
// Importa Link para crear enlaces de navegación sin recarga de página
import { Link } from 'react-router-dom';
// Importa el cliente API para enviar la solicitud de recuperación al backend
import { api } from '../api';

// Función componente que renderiza el formulario de recuperación de contraseña
function RecuperarContrasena() {
  // Estado local para el campo de correo electrónico del formulario
  const [correo, setCorreo] = useState('');

  // ---------------------------------------------------------------------------
  // Función: handleRecuperar
  // ---------------------------------------------------------------------------
  // Manejador del envío del formulario de recuperación.
  // Envía el correo electrónico al backend, que procesa la solicitud
  // y notifica al administrador para que genere una nueva contraseña.
  // ---------------------------------------------------------------------------
  const handleRecuperar = async (e) => {
    // Previene el envío tradicional del formulario (recarga de página)
    e.preventDefault();
    try {
      // Envía la solicitud de recuperación al endpoint del backend
      // El backend probablemente envía un email al administrador
      await api.auth.recuperarContrasena(correo);
      // Muestra confirmación exitosa al usuario
      alert('Solicitud enviada al administrador.');
    } catch (error) {
      // Si falla (correo no registrado, error de red, etc.), muestra el error
      alert(error.message || 'Correo no registrado.');
    }
  };

  return (
    <>
      {/* Barra de navegación superior con enlace para volver al login */}
      <nav className="top-nav">
        <Link to="/login">VOLVER</Link>
      </nav>

      {/* Contenido principal: formulario de recuperación centrado en la página */}
      <main className="content-wrapper flex-center">
        <div className="panel-registro max-w-500">
          <div className="form-section-cell w-100">

            {/* Título de la sección */}
            <h2 className="form-title font-size-lg text-center margin-b-20">Restablecer Contraseña</h2>

            {/* Instrucciones para el usuario: explica el proceso manual de recuperación */}
            <p className="text-muted font-size-md text-center margin-b-25">
              Ingrese el correo institucional. El administrador se encargará de darle una nueva contraseña.
            </p>

            {/* Formulario de recuperación */}
            <form className="grid-form" onSubmit={handleRecuperar}>

              {/* Campo de correo electrónico */}
              <div className="input-group">
                <label>Correo Electrónico Corporativo</label>
                <input
                  type="email"                    // Tipo email: validación nativa del navegador
                  placeholder="ejemplo@titansports.com"  // Placeholder con ejemplo de formato
                  value={correo}                  // Valor controlado por el estado local
                  onChange={(e) => setCorreo(e.target.value)}  // Actualiza el estado al escribir
                  required                        // Validación HTML: campo obligatorio
                />
              </div>

              {/* Botón de envío de la solicitud */}
              <button type="submit" className="btn-submit w-100 margin-t-15">Enviar</button>

            </form>
          </div>
        </div>
      </main>
    </>
  );
}

// Exporta el componente como exportación por defecto para ser usado en App.jsx
export default RecuperarContrasena;
