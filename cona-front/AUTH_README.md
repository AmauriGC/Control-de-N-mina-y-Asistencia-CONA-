# 🔐 Sistema de Autenticación - CONA Front

## 📁 Estructura de la carpeta `auth/`

```
src/auth/
├── components/
│   ├── LoginForm.jsx          # Formulario de inicio de sesión
│   └── ProtectedRoute.jsx     # Componente para proteger rutas
├── context/
│   └── AuthContext.jsx        # Context API para manejo de estado de auth
├── hooks/
│   └── useAuth.js            # Hook personalizado para usar auth
├── pages/
│   ├── Login.jsx             # Página de login
│   ├── Register.jsx          # Página de registro (pendiente)
│   └── ForgotPassword.jsx    # Página de recuperación (pendiente)
├── services/
│   ├── axiosClient.js        # Cliente Axios con interceptores
│   └── authService.js        # Servicios de autenticación
└── utils/
    └── tokenManager.js       # Manejo de tokens en localStorage
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8080/api
```

## 📝 Archivos Principales

### 1. **axiosClient.js** - Cliente HTTP Global

Maneja todas las peticiones HTTP con:
- ✅ Interceptor de peticiones: Añade automáticamente el token JWT
- ✅ Interceptor de respuestas: Maneja errores y respuestas del backend
- ✅ Redirección automática al login si el token expira (401/403)

```javascript
import axiosClient from '@/auth/services/axiosClient'

// Uso en servicios
const response = await axiosClient.get('/endpoint')
```

### 2. **authService.js** - Servicios de Autenticación

Métodos disponibles:
- `login(credentials)` - Iniciar sesión
- `logout()` - Cerrar sesión
- `getCurrentUser()` - Obtener usuario actual
- `isAuthenticated()` - Verificar si hay sesión activa

### 3. **tokenManager.js** - Gestión de Tokens

Maneja el almacenamiento en localStorage:
- `getToken()` / `setToken(token)` - Manejo de token JWT
- `getUser()` / `setUser(user)` - Manejo de datos del usuario
- `clearAll()` - Limpiar todo el localStorage

### 4. **AuthContext.jsx** - Context Global

Provee el estado de autenticación a toda la aplicación:
- `user` - Datos del usuario actual
- `isAuthenticated` - Estado de autenticación
- `login(email, password)` - Función para iniciar sesión
- `logout()` - Función para cerrar sesión

## 🔌 Integración con el Backend

### Endpoint de Login

**URL:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response (ApiResponse<AuthResponse>):**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "1",
      "email": "usuario@ejemplo.com",
      "name": "Nombre Usuario",
      "role": "admin"
    }
  },
  "timestamp": "2025-11-15T10:30:00Z",
  "path": "/api/auth/login"
}
```

### Formato de Respuesta del Backend

Todas las respuestas siguen el formato `ApiResponse<T>`:
```typescript
{
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}
```

## 🚀 Uso en Componentes

### Ejemplo 1: Usar el hook useAuth

```jsx
import { useAuth } from '@/auth/context/AuthContext'

function MiComponente() {
  const { user, isAuthenticated, logout } = useAuth()
  
  return (
    <div>
      <p>Usuario: {user?.name}</p>
      <p>Rol: {user?.role}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  )
}
```

### Ejemplo 2: Proteger Rutas

```jsx
import { ProtectedRoute } from '@/auth/components/ProtectedRoute'

<Route 
  path="/admin" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminPage />
    </ProtectedRoute>
  } 
/>
```

### Ejemplo 3: Hacer Peticiones Autenticadas

```jsx
import axiosClient from '@/auth/services/axiosClient'

async function obtenerDatos() {
  try {
    // El token se añade automáticamente en el header
    const response = await axiosClient.get('/empleados')
  } catch (error) {
    console.error(error.message)
  }
}
```

## 🔄 Flujo de Autenticación

1. **Login:**
   - Usuario ingresa credenciales en `LoginForm`
   - Se envía petición a `/api/auth/login`
   - Backend responde con token y datos del usuario
   - Token y usuario se guardan en localStorage
   - Usuario es redirigido al dashboard

2. **Peticiones Autenticadas:**
   - axiosClient intercepta todas las peticiones
   - Añade automáticamente: `Authorization: Bearer <token>`
   - Backend valida el token en cada request

3. **Logout:**
   - Usuario hace clic en "Cerrar Sesión"
   - Se ejecuta `authService.logout()`
   - Se limpia todo el localStorage
   - Usuario es redirigido al login

4. **Token Expirado:**
   - Backend responde con 401/403
   - Interceptor de respuestas detecta el error
   - Se limpia el localStorage automáticamente
   - Usuario es redirigido al login

## 📦 Dependencias Necesarias

```bash
npm install axios react-router-dom
```

## 🧪 Pruebas

Para probar el sistema:

1. **Asegúrate de que el backend esté corriendo** en `http://localhost:8080`

2. **Inicia el frontend:**
   ```bash
   npm run dev
   ```

3. **Prueba el login** con credenciales válidas del backend

4. **Verifica en DevTools > Application > Local Storage:**
   - `auth_token`: Debe contener el JWT
   - `user_data`: Debe contener los datos del usuario

## 🔒 Seguridad

- ✅ Token JWT almacenado en localStorage
- ✅ Token enviado automáticamente en cada petición
- ✅ Redirección automática al login si el token expira
- ✅ Limpieza de datos al cerrar sesión
- ⚠️ No se almacena la contraseña en ningún momento

## 📌 Notas Importantes

1. El token se añade automáticamente a TODAS las peticiones hechas con `axiosClient`
2. No uses `axios` directamente, siempre usa `axiosClient`
3. El backend debe enviar el token en la respuesta del login con la estructura definida
4. Asegúrate de que el backend esté configurado para aceptar el header `Authorization`

## 🎯 Próximos Pasos

- [ ] Implementar registro de usuarios
- [ ] Implementar recuperación de contraseña
- [ ] Agregar refresh token
- [ ] Implementar recordar sesión
