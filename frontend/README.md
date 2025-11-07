# Frontend - CRUD UI con React

Interfaz de usuario desarrollada con React 18 que proporciona una UI simple e intuitiva para gestionar usuarios mediante operaciones CRUD conectadas al backend API.

## 📋 Descripción

Aplicación React que permite:
- Visualizar lista de usuarios en tiempo real
- Agregar nuevos usuarios con validación
- Interfaz responsive y minimalista
- Integración con backend via axios

## 🛠️ Stack Tecnológico

- **Framework**: React 18.2.0
- **Build Tool**: react-scripts 5.0.1 (Create React App)
- **HTTP Client**: axios 1.6.0
- **Testing**: @testing-library/react, @testing-library/jest-dom
- **Runtime**: web-vitals para métricas de rendimiento

## 📁 Estructura del Proyecto

```
frontend/
├── public/
│   ├── index.html          # HTML template
│   ├── manifest.json       # PWA manifest
│   └── robots.txt
├── src/
│   ├── App.js              # Componente principal (CRUD UI)
│   ├── App.css             # Estilos del componente
│   ├── config.js           # Configuración de endpoints API
│   ├── index.js            # Entry point React
│   ├── index.css           # Estilos globales
│   └── reportWebVitals.js  # Métricas de rendimiento
├── package.json            # Dependencias y scripts
├── Dockerfile              # Multi-stage build para producción
└── README.md              # Este archivo
```

## 🔧 Configuración de API

### `src/config.js`

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  USERS: `${API_URL}/users`,
  HEALTH: `${API_URL}/healthz`
};
```

### Variables de Entorno

#### Desarrollo Local
Crear archivo `.env` en la raíz del frontend:
```bash
REACT_APP_API_URL=http://localhost:3000
```

#### Producción (Render)
Configurar en **Render Dashboard → Frontend Service → Environment**:
```bash
REACT_APP_API_URL=https://crud-backend-1o29.onrender.com
```

**⚠️ IMPORTANTE**: Sin esta variable, el frontend intentará conectarse a `localhost:3000` lo que causará errores CORS en producción.

## 🎨 Componente Principal - App.js

### Funcionalidades

#### Estado Local
```javascript
const [users, setUsers] = useState([]);
const [name, setName] = useState('');
```

#### Cargar Usuarios (useEffect)
```javascript
useEffect(() => {
  axios.get(API_ENDPOINTS.USERS)
    .then(res => setUsers(res.data))
    .catch(err => console.error('Error fetching users:', err));
}, []);
```

#### Agregar Usuario con Validación
```javascript
const addUser = async () => {
  if (!name.trim()) return; // Validación nombres vacíos
  
  const res = await axios.post(API_ENDPOINTS.USERS, { name });
  setUsers([...users, res.data]);
  setName(''); // Limpiar input
};
```

**Características especiales**:
- ✅ Validación de nombres vacíos (commit `c561849`)
- ✅ El timestamp lo añade el backend automáticamente
- ✅ Input se limpia después de agregar usuario exitosamente

### UI/UX

- Input de texto para nombre de usuario
- Botón "Add User" para crear nuevo registro
- Lista ordenada (`<ol>`) mostrando usuarios con sus timestamps
- Estilos CSS simples y limpios

## 🚀 Desarrollo Local

### Requisitos Previos
- Node.js 14+ instalado
- Backend corriendo en `http://localhost:3000`

### Instalación

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install
```

### Scripts Disponibles

#### `npm start`
Inicia el servidor de desarrollo en `http://localhost:3001`

- Hot reload activado
- Abre automáticamente en el navegador
- Muestra errores de lint en consola

```bash
npm start
```

#### `npm run build`
Crea build optimizado para producción en la carpeta `build/`

- Minificación de código
- Optimización de assets
- Source maps generados
- Listo para deployment

```bash
npm run build
```

#### `npm test`
Ejecuta tests en modo interactivo watch

```bash
npm test
```

#### `npm run eject`
**⚠️ Operación irreversible**: Expone configuración de Webpack/Babel

## 🐳 Docker

### Dockerfile Multi-Stage

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
```

### Build y Run Local

```bash
# Build imagen
docker build -t crud-frontend .

# Ejecutar contenedor
docker run -p 3001:3000 \
  -e REACT_APP_API_URL=http://localhost:3000 \
  crud-frontend
```

## 📦 Deployment en Render

### Configuración Automática

El frontend se despliega automáticamente cuando se hace push a `main`:

- **URL Producción**: https://crud-frontend-cerx.onrender.com
- **Auto-deploy**: GitHub Actions trigger → Render webhook
- **Build Command**: `npm run build`
- **Start Command**: `serve -s build -l 3000`

### Variables de Entorno Requeridas

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `REACT_APP_API_URL` | `https://crud-backend-1o29.onrender.com` | URL del backend en producción |

### Troubleshooting Render

#### Error: CORS Policy
**Síntoma**: `Access-Control-Allow-Origin header is missing`

**Solución**:
1. Verificar que `REACT_APP_API_URL` esté configurada en Render
2. Confirmar que el backend tenga el frontend URL en CORS whitelist
3. Hacer redeploy del frontend después de cambiar variables

#### Frontend conecta a backend incorrecto
**Causa**: Variable `REACT_APP_API_URL` no configurada o incorrecta

**Verificar en navegador**:
```javascript
// Abrir DevTools → Console
console.log(process.env.REACT_APP_API_URL);
```

## 🧪 Testing

### Tests Incluidos

```bash
# Ejecutar suite de tests
npm test

# Coverage report
npm test -- --coverage
```

### Testing Library

```javascript
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders add user button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Add User/i);
  expect(buttonElement).toBeInTheDocument();
});
```

## 🔍 Debugging

### Verificar Conexión al Backend

Abrir DevTools → Network tab y revisar:

**Request exitoso**:
```http
GET https://crud-backend-1o29.onrender.com/users
Status: 200 OK
Response: [{"id":1,"name":"Usuario 14:30:45"}]
```

**Error de CORS**:
```
Access to fetch at 'https://crud-backend-...' from origin 'https://crud-frontend-...' 
has been blocked by CORS policy
```
→ Verificar configuración de variables de entorno

### Logs en Producción

Ver logs de build y runtime en:
- Render Dashboard → Frontend Service → Logs

## 📊 Web Vitals

El proyecto incluye `reportWebVitals.js` para métricas de rendimiento:

- **FCP** (First Contentful Paint)
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)
- **TTFB** (Time to First Byte)

```javascript
// src/index.js
reportWebVitals(console.log);
```

## 🔗 Enlaces Relacionados

- [Backend README](../backend/README.md)
- [Infrastructure README](../infrastructure/README.md)
- [Scripts de Utilidad](../scripts/README.md)
- [CI/CD Workflows](../.github/workflows/README.md)
- [React Documentation](https://react.dev/)
- [Create React App](https://create-react-app.dev/)

## 📝 Notas de Desarrollo

### Commits Importantes

- **c561849**: Implementación de validación de nombres vacíos
- **4032fd8**: Restauración de `package.json` después de error de build
- **689a5b7**: Eliminación de `.eslintrc.json` vacío que causaba fallo de build

### Decisiones de Diseño

- **Sin timestamps en frontend**: El backend añade automáticamente los timestamps
- **Validación simple**: Solo verifica que el campo no esté vacío
- **Sin estado de loading**: Operaciones asíncronas sin indicadores de carga (mejora futura)
- **Sin manejo de errores visuales**: Errores solo logueados en consola (mejora futura)
