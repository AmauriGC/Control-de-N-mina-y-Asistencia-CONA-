# CONA-FRONT

Sistema de control de Nómina y Asistencia — Frontend con React + Vite.

## ¿Qué es este proyecto?

Interfaz web para gestionar nómina y asistencia con dos roles principales: **Admin** y **Employee**. Incluye autenticación, dashboard, sidebar y páginas separadas por rol.

## Estructura del proyecto

```
src/
├── App.jsx                    # Rutas principales
├── main.jsx                   # Punto de entrada React
├── pages/
│   ├── Login.jsx              # Pantalla de inicio de sesión
│   ├── admin/                 # Páginas del administrador
│   │   ├── AdminHome.jsx
│   │   ├── components/        # Componentes exclusivos de admin
│   │   └── services/          # Lógica/API de admin
│   └── employee/              # Páginas del empleado
│       ├── EmployeeHome.jsx
│       ├── components/
│       └── services/
├── layouts/
│   └── DashboardLayout.jsx    # Layout general con sidebar
├── shared/
│   └── Sidebar.jsx            # Menú lateral compartido
├── auth/
│   └── service/
│       └── authService.js     # Login, logout, validación de token
├── AxiosClient/
│   └── axiosClient.js         # Cliente HTTP configurado
├── context/
│   └── AuthContext.jsx        # Estado global de autenticación
├── router/
│   ├── router.jsx             # Configuración de rutas
│   └── RequireRole.jsx        # Protección de rutas por rol
└── utils/
    └── jwt.js                 # Decodificar/validar JWT
```

## Cómo trabajamos

### Ramas

- `main` → producción (no tocar directamente)
- `develop` → desarrollo (base para nuevas ramas)
- `feature/nombre-descriptivo` → nueva funcionalidad
- `fix/nombre-del-bug` → corrección de errores
- `style/nombre-del-estilo` → implementación del diseño

### Commits

Formato simple: `tipo: descripción corta`

Ejemplos:

- `feat: añadir filtro por fecha en asistencias`
- `fix: corregir validación en formulario de login`
- `chore: actualizar dependencias`

### Flujo de trabajo paso a paso

**1. Actualizar develop y crear tu rama**

```bash
git checkout develop
git pull
git checkout -b feature/nombre-de-tu-funcionalidad
```

**2. Trabajar en tus cambios**

Haz tus modificaciones, crea componentes, edita archivos, etc.

**3. Guardar tus cambios**

```bash
# Agregar todos los archivos modificados
git add .

# O agregar archivos específicos
git add src/pages/admin/MiNuevaPagina.jsx

# Hacer commit
git commit -m "feat(reports): añadir página de reportes"
```

**4. Subir tu rama**

```bash
git push origin feature/nombre-de-tu-funcionalidad
```

**5. Crear Pull Request**

- Ve a GitHub/GitLab
- Abre un PR de tu rama hacia `develop`
- Describe qué hiciste y por qué
- Asigna a 1 revisor del equipo

**6. Esperar aprobación**

El revisor autoriza y hace el merge. **No lo hagas tú mismo.**

Si no conoces Git o tienes dudas, pregunta en el equipo.

## Archivos importantes

| Archivo               | Para qué sirve                                                      |
| --------------------- | ------------------------------------------------------------------- |
| `authService.js`      | Maneja login, logout y validación de tokens                         |
| `axiosClient.js`      | Configuración de peticiones HTTP (headers, base URL, interceptores) |
| `AuthContext.jsx`     | Estado compartido del usuario autenticado                           |
| `router.jsx`          | Define todas las rutas de la app                                    |
| `RequireRole.jsx`     | Protege rutas según el rol del usuario                              |
| `DashboardLayout.jsx` | Envuelve las páginas con sidebar y estructura común                 |
| `Sidebar.jsx`         | Menú lateral con opciones según rol                                 |

## ¿Dónde hago cambios?

- **Añadir una pantalla nueva**: crear archivo en `pages/admin/` o `pages/employee/` y registrarla en `router.jsx`
- **Componente reutilizable**: `src/components/` o `src/shared/`
- **Nueva llamada a la API**: agregar función en `services/` de la carpeta correspondiente
- **Cambiar el menú**: editar `Sidebar.jsx`
- **Modificar autenticación**: revisar `authService.js` y `AuthContext.jsx`

## Reglas básicas

- **No subir** archivos `.env` ni credenciales al repositorio
- Mantén los componentes pequeños y enfocados
- Si algo no funciona, revisa la consola del navegador y la terminal
- Antes de hacer PR, asegúrate de que la app corra sin errores
