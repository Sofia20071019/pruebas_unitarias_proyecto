# =============================================================================
# ARCHIVO: run.py
# PROPOSITO: Punto de entrada principal de la aplicacion Flask. Este script
#            instancia la aplicacion mediante la fabrica create_app() y la
#            ejecuta en modo de desarrollo con el servidor de debug activado.
# =============================================================================

# Importar la funcion factory que genera y configura la instancia de Flask
from app import create_app

# Crear la instancia de la aplicacion Flask usando la fabrica de aplicaciones
app = create_app()

# Verificar si el script se ejecuta directamente (no importado como modulo)
# para iniciar el servidor de desarrollo de Flask
if __name__ == "__main__":
    # Ejecutar el servidor Flask con el modo debug activado, lo cual permite
    # recarga automatica del servidor ante cambios y muestra errores detallados
    app.run(debug=True)
