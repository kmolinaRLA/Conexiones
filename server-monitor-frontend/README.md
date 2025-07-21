# Server Monitor Frontend

Interfaz web moderna y corporativa para el monitoreo de servidores y conexiones MPLS nacionales.

## Características

### 🎨 Diseño Moderno y Corporativo
- **Interfaz intuitiva** con gradientes azules y elementos visuales limpios
- **Responsive design** que se adapta a diferentes tamaños de pantalla
- **Iconografía consistente** usando Lucide React
- **Animaciones suaves** y transiciones fluidas

### 📊 Sistema de Estados Visuales
- 🟢 **Verde (good)**: Conexión estable, latencia < 100ms
- 🟡 **Amarillo (warning)**: Tiempos altos de latencia (100-300ms)
- 🔴 **Rojo (error)**: Sin conexión o latencia > 300ms

### 🏗️ Dos Secciones Principales

#### 1. Servicios y Servidores
- **Vista de tarjetas**: Cada servidor se muestra como una tarjeta elegante
- **Estado general**: Indicador visual del estado del servidor
- **Vista detallada**: Al hacer clic, muestra todos los servicios del servidor
- **Información de servicios**: Cada servicio muestra su estado y latencia

#### 2. MPLS Nacionales
- **Vista por departamentos**: Cuadros individuales para cada departamento
- **Estado de conectividad**: Indicadores visuales claros
- **Latencia promedio**: Información de rendimiento de cada conexión

### 🔄 Actualizaciones en Tiempo Real
- **Polling automático**: Actualización cada 30 segundos
- **Indicador de estado**: Muestra cuando fue la última actualización
- **Carga fluida**: Indicadores de carga elegantes

## Tecnologías Utilizadas

- **React 19.1.0**: Framework principal
- **Tailwind CSS**: Framework de estilos utilitarios
- **Lucide React**: Librería de iconos moderna
- **Hooks de React**: useState, useEffect para manejo de estado

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
