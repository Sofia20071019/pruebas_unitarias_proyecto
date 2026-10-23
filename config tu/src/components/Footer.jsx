// ============================================================================
// ARCHIVO: Footer.jsx (Componente de pie de página)
// PROPOSITO: Componente de layout que renderiza el pie de página de la
//            aplicación. Muestra el nombre del sistema (Kimuka ERP), la
//            marca (Titan Sports), el año actual dinámicamente, y datos
//            de contacto del área de soporte técnico.
// ============================================================================

// Función componente que renderiza el footer de la aplicación
// Este componente se renderiza en todas las páginas a través de App.jsx
function Footer() {
    // Obtiene el año actual del sistema usando el objeto Date de JavaScript
    // getFullYear() retorna el año completo (ej: 2026)
    // Se usa para mantener el copyright actualizado automáticamente cada año
    const anio = new Date().getFullYear();

    return (
        // Etiqueta footer semántica HTML5 con la clase CSS "main-footer"
        // para estilizarlo según el diseño de la aplicación
        <footer className="main-footer">
            {/* Primera línea: nombre del ERP, marca y símbolo de copyright dinámico */}
            {/* &copy; es la entidad HTML que renderiza el símbolo © */}
            <p>Kimuka ERP - Titan Sports &copy; {anio}</p>
            {/* Segunda línea: información de contacto para soporte técnico */}
            <p>Datos de contacto del área de soporte.</p>
        </footer>
    );
}

// Exporta el componente como exportación por defecto para que pueda ser
// importado en App.jsx y renderizado en todas las rutas
export default Footer;
