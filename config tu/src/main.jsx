// Importa React, la biblioteca principal para crear interfaces de usuario declarativas
import React from 'react'
// Importa ReactDOM, el puente entre React y el DOM real del navegador
import ReactDOM from 'react-dom/client'
// Importa el componente raíz de la aplicación (App) que contiene todo el enrutamiento y lógica principal
import App from './App'
// Importa los estilos CSS globales que definen la apariencia visual de toda la aplicación
import './styles/styles.css'

// Crea la raíz de renderizado de React en el elemento HTML con id="root" (definido en index.html)
// El método createRoot es la API de React 18+ para iniciar el renderizado moderno con concurrent features
ReactDOM.createRoot(document.getElementById('root')).render(
  // React.StrictMode es un envoltorio de desarrollo que ayuda a detectar problemas potenciales:
  // - Renderizados dobles (para encontrar efectos secundarios innecesarios)
  // - APIs deprecadas (para prepararse para futuras versiones de React)
  // - Problemas con el ciclo de vida de los componentes
  // En producción, StrictMode no tiene efecto y no afecta el rendimiento
  <React.StrictMode>
    {/* Renderiza el componente App, que contiene el enrutador y toda la lógica de la aplicación */}
    <App />
  </React.StrictMode>,
)
