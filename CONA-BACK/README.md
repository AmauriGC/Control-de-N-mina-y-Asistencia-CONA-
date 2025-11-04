# 📋 CONA-BACK - Guía de Arquitectura del Proyecto

> Backend del sistema de Control de Nómina y Asistencia desarrollado con Spring Boot

---

## 📑 Tabla de Contenidos
- [Descripción General](#-descripción-general)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Estructura de Carpetas](#-estructura-de-carpetas)
- [Componentes del Sistema](#-componentes-del-sistema)
- [Flujo de una Petición](#-flujo-de-una-petición)
- [Convenciones y Buenas Prácticas](#-convenciones-y-buenas-prácticas)

---

## 🎯 Descripción General

CONA-BACK es una API REST desarrollada con Spring Boot que sigue una **arquitectura en capas**. El proyecto está organizado de manera modular para facilitar el mantenimiento, escalabilidad y trabajo en equipo.

**Tecnologías principales:**
- **Spring Boot 3.5.7** - Framework base
- **Spring Security + JWT** - Autenticación y autorización
- **Spring Data JPA** - Persistencia de datos
- **MySQL** - Base de datos relacional
- **Java 21** - Lenguaje de programación

---

## 🏗️ Arquitectura del Proyecto

El proyecto sigue el patrón **MVC (Model-View-Controller)** adaptado para APIs REST:

```
┌─────────────┐
│   Cliente   │  (Frontend, Postman, etc.)
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│          CONTROLLER                 │  ◄── Recibe peticiones HTTP
│   (AuthController, etc.)            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│          SERVICE                    │  ◄── Lógica de negocio
│   (AuthService, AuthServiceImpl)    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         REPOSITORY                  │  ◄── Acceso a datos
│   (UserRepository)                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       BASE DE DATOS (MySQL)         │
└─────────────────────────────────────┘
```

---

## 📁 Estructura de Carpetas

```
src/main/java/com/cona/
│
├── controller/              # Capa de Presentación
├── dto/                     # Objetos de Transferencia de Datos
├── entity/                  # Capa de Modelo (Entidades de BD)
├── enums/                   # Enumeraciones
├── exception/               # Manejo de Errores
├── kernel/                  # Utilidades Centrales
├── mapper/                  # Conversión Entity ↔ DTO
├── repository/              # Capa de Acceso a Datos
├── security/                # Configuración de Seguridad
└── service/                 # Capa de Lógica de Negocio
```

---

## 🔧 Componentes del Sistema

### 1️⃣ **Controller** (Controladores)
📂 Ubicación: `controller/`

**¿Qué es?**
Son los puntos de entrada de la API. Reciben las peticiones HTTP y devuelven respuestas.

**¿Para qué sirve?**
- Exponer endpoints (URLs) que el frontend puede consumir
- Validar datos de entrada básicos
- Llamar a los servicios correspondientes
- Devolver respuestas HTTP estandarizadas

**Ejemplo:**
```java
@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest request) {
        // Llama al servicio y devuelve respuesta
    }
}
```

**¿Qué va aquí?**
- Anotaciones de rutas (`@GetMapping`, `@PostMapping`, etc.)
- Validaciones simples de entrada
- Construcción de respuestas HTTP
- **NO** lógica de negocio compleja

---

### 2️⃣ **DTO** (Data Transfer Object)
📂 Ubicación: `controller/dto/`

**¿Qué es?**
Objetos simples que se usan para transferir datos entre el cliente y el servidor.

**¿Para qué sirve?**
- Definir la estructura de datos que se envía/recibe en los endpoints
- Separar la estructura de la BD de lo que exponemos al cliente
- Seguridad: No exponer campos sensibles de las entidades

**Ejemplo:**
```java
// AuthRequest.java - Lo que el cliente envía
public class AuthRequest {
    private String email;
    private String password;
}

// AuthResponse.java - Lo que el servidor responde
public class AuthResponse {
    private String token;
    private String email;
    private Role role;
}
```

**¿Qué va aquí?**
- Clases con atributos y getters/setters
- Validaciones con anotaciones (`@NotNull`, `@Email`, etc.)
- **NO** lógica de negocio

---

### 3️⃣ **Entity** (Entidades)
📂 Ubicación: `entity/`

**¿Qué es?**
Representación de las tablas de la base de datos en forma de clases Java.

**¿Para qué sirve?**
- Mapear tablas de la BD a objetos Java
- Definir relaciones entre tablas (OneToMany, ManyToOne, etc.)
- Persistir y recuperar datos

**Ejemplo:**
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String email;
    private String password;
    
    @Enumerated(EnumType.STRING)
    private Role role;
}
```

**¿Qué va aquí?**
- Anotaciones JPA (`@Entity`, `@Table`, `@Column`)
- Atributos que representan columnas
- Relaciones entre entidades
- **NO** exponer directamente en endpoints (usa DTOs)

---

### 4️⃣ **Enums** (Enumeraciones)
📂 Ubicación: `enums/`

**¿Qué es?**
Conjuntos de valores constantes predefinidos.

**¿Para qué sirve?**
- Definir opciones limitadas y fijas (roles, estados, tipos)
- Evitar errores por valores incorrectos
- Mejorar la legibilidad del código

**Ejemplo:**
```java
public enum Role {
    ADMIN,
    EMPLOYEE,
    MANAGER
}
```

**¿Qué va aquí?**
- Roles de usuario
- Estados (ACTIVO, INACTIVO, PENDIENTE)
- Tipos de documentos, categorías, etc.

---

### 5️⃣ **Exception** (Manejo de Errores)
📂 Ubicación: `exception/`

**¿Qué es?**
Sistema centralizado para manejar errores de manera consistente.

**¿Para qué sirve?**
- Capturar excepciones en toda la aplicación
- Devolver respuestas de error uniformes al cliente
- Evitar exponer detalles técnicos sensibles

**Componentes:**

#### `GlobalExceptionHandler.java`
Intercepta todas las excepciones y las convierte en respuestas HTTP apropiadas.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<?>> handleBusinessException(BusinessException ex) {
        // Devuelve una respuesta de error personalizada
    }
}
```

#### `exception/types/` - Excepciones Personalizadas
```java
public class BusinessException extends RuntimeException {
    // Excepción para errores de lógica de negocio
}
```

**¿Qué va aquí?**
- Handlers para diferentes tipos de excepciones
- Excepciones personalizadas del negocio
- Lógica de conversión de error → respuesta HTTP

---

### 6️⃣ **Kernel** (Núcleo/Utilidades)
📂 Ubicación: `kernel/`

**¿Qué es?**
Componentes centrales y utilidades compartidas por todo el proyecto.

#### `kernel/response/` - ApiResponse
**¿Para qué sirve?**
Estandarizar todas las respuestas de la API con un formato único.

```java
public class ApiResponse<T> {
    private int status;           // Código HTTP
    private String message;       // Mensaje descriptivo
    private T data;              // Datos de respuesta
    private LocalDateTime timestamp;
}
```

**Ventajas:**
- Todas las respuestas tienen el mismo formato
- Facilita el manejo en el frontend
- Incluye información útil (timestamp, status)

#### `kernel/utils/` - Utilidades
**¿Para qué sirve?**
Funciones auxiliares reutilizables.

```java
public class Sanitizer {
    public static String sanitizeEmail(String email) {
        // Limpia y valida un email
    }
}
```

**¿Qué va aquí?**
- Validadores
- Formateadores
- Conversores
- Funciones comunes

#### `kernel/initializer/` - DataInitializer
**¿Para qué sirve?**
Cargar datos iniciales en la base de datos al arrancar la aplicación.

```java
@Component
public class DataInitializer implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) {
        // Crea usuarios de prueba, datos iniciales, etc.
    }
}
```

---

### 7️⃣ **Mapper** (Mapeadores)
📂 Ubicación: `mapper/`

**¿Qué es?**
Clases que convierten entre Entities y DTOs.

**¿Para qué sirve?**
- Separar la lógica de conversión
- Evitar exponer entidades directamente
- Centralizar transformaciones de datos

**Ejemplo:**
```java
@Component
public class UserMapper {
    
    public UserDTO toDTO(User entity) {
        // Convierte User → UserDTO
    }
    
    public User toEntity(UserDTO dto) {
        // Convierte UserDTO → User
    }
}
```

**¿Qué va aquí?**
- Métodos de conversión Entity → DTO
- Métodos de conversión DTO → Entity
- Lógica de transformación de datos

---

### 8️⃣ **Repository** (Repositorios)
📂 Ubicación: `repository/`

**¿Qué es?**
Interfaces que gestionan el acceso a la base de datos.

**¿Para qué sirve?**
- Realizar operaciones CRUD (Create, Read, Update, Delete)
- Ejecutar consultas personalizadas
- Abstraer el acceso a datos

**Ejemplo:**
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.role = :role")
    List<User> findByRole(@Param("role") Role role);
}
```

**¿Qué va aquí?**
- Consultas derivadas del nombre del método
- Consultas personalizadas con `@Query`
- **NO** lógica de negocio

---

### 9️⃣ **Security** (Seguridad)
📂 Ubicación: `security/`

**¿Qué es?**
Configuración de autenticación, autorización y protección de endpoints.

#### `SecurityConfig.java`
Configuración principal de seguridad.

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        // Define qué endpoints son públicos y cuáles requieren autenticación
    }
}
```

#### `CustomUserDetailsService.java`
Carga información del usuario para la autenticación.

#### `security/jwt/` - Autenticación JWT
- **JwtTokenProvider**: Genera y valida tokens JWT
- **JwtAuthenticationFilter**: Intercepta peticiones y valida el token

#### `security/cors/` - CorsConfig
Configuración de CORS (qué dominios pueden acceder a la API).

**¿Qué va aquí?**
- Configuración de endpoints públicos/protegidos
- Lógica de autenticación
- Generación y validación de tokens
- Configuración de CORS

---

### 🔟 **Service** (Servicios)
📂 Ubicación: `service/` y `service/impl/`

**¿Qué es?**
Capa donde reside toda la lógica de negocio de la aplicación.

**¿Para qué sirve?**
- Implementar reglas de negocio
- Coordinar operaciones entre múltiples repositorios
- Validaciones complejas
- Transacciones

**Estructura:**
```
service/
├── AuthService.java           # Interfaz (contrato)
└── impl/
    └── AuthServiceImpl.java   # Implementación
```

**Ejemplo:**
```java
// Interfaz
public interface AuthService {
    AuthResponse login(AuthRequest request);
    void register(RegisterRequest request);
}

// Implementación
@Service
public class AuthServiceImpl implements AuthService {
    
    @Override
    public AuthResponse login(AuthRequest request) {
        // 1. Validar credenciales
        // 2. Generar token
        // 3. Devolver respuesta
    }
}
```

**¿Qué va aquí?**
- Lógica de negocio compleja
- Validaciones de reglas del negocio
- Coordinación de múltiples repositorios
- Manejo de transacciones
- **NO** código de acceso a BD directamente (usa repositorios)

---

## 🔄 Flujo de una Petición

Veamos cómo fluye una petición de login a través del sistema:

```
1. Cliente envía POST /auth/login
   ↓
2. AuthController recibe la petición
   └─ Valida que el JSON sea válido
   ↓
3. Controller llama a AuthService.login()
   ↓
4. AuthService ejecuta la lógica:
   ├─ Llama a UserRepository.findByEmail()
   ├─ Verifica la contraseña
   ├─ Genera JWT con JwtTokenProvider
   └─ Construye AuthResponse
   ↓
5. Service devuelve AuthResponse al Controller
   ↓
6. Controller envuelve en ApiResponse<AuthResponse>
   ↓
7. Cliente recibe la respuesta JSON
```

**Si ocurre un error:**
```
3. AuthService lanza BusinessException("Credenciales inválidas")
   ↓
4. GlobalExceptionHandler intercepta la excepción
   ↓
5. Convierte la excepción en ApiResponse con error
   ↓
6. Cliente recibe respuesta de error estructurada
```

---

## 📝 Convenciones y Buenas Prácticas

### 🎯 Dónde poner cada cosa

| Tipo de Código | Ubicación |
|----------------|-----------|
| Endpoint nuevo | `controller/` |
| Datos de entrada/salida | `controller/dto/` |
| Tabla nueva | `entity/` |
| Lógica de negocio | `service/impl/` |
| Consulta a BD | `repository/` |
| Conversión Entity↔DTO | `mapper/` |
| Excepción personalizada | `exception/types/` |
| Utilidad reutilizable | `kernel/utils/` |
| Configuración de seguridad | `security/` |

### ✅ Reglas de Oro

1. **Controller**: Solo recibe, delega y responde. No lógica compleja.
2. **Service**: Toda la lógica de negocio va aquí.
3. **Repository**: Solo consultas a BD, sin lógica de negocio.
4. **Entity**: No expongas directamente, usa DTOs.
5. **DTOs**: Úsalos siempre para comunicación con el cliente.
6. **Excepciones**: Usa excepciones personalizadas para errores del negocio.
7. **ApiResponse**: Todas las respuestas deben usar este formato.
8. **Mappers**: Centraliza las conversiones Entity↔DTO.

### 🚫 Qué NO hacer

- ❌ NO pongas lógica de negocio en el Controller
- ❌ NO accedas al Repository directamente desde el Controller
- ❌ NO expongas Entities directamente en los endpoints
- ❌ NO mezcles responsabilidades entre capas
- ❌ NO ignores las excepciones, manéjalas apropiadamente
- ❌ NO pongas contraseñas o secretos en el código (usa variables de entorno)

### ✨ Ejemplo de Implementación Completa

Para agregar un nuevo módulo (ejemplo: Empleados):

1. **Crear Entity**: `entity/Employee.java`
2. **Crear DTOs**: `controller/dto/EmployeeRequest.java`, `EmployeeResponse.java`
3. **Crear Repository**: `repository/EmployeeRepository.java`
4. **Crear Service**: `service/EmployeeService.java` + `service/impl/EmployeeServiceImpl.java`
5. **Crear Mapper**: `mapper/EmployeeMapper.java`
6. **Crear Controller**: `controller/EmployeeController.java`
7. **Configurar Seguridad**: Actualizar `SecurityConfig.java` si es necesario

---

## 🎓 Glosario Técnico

- **API REST**: Interfaz que permite comunicación entre sistemas usando HTTP
- **DTO**: Objeto simple para transferir datos entre capas
- **Entity**: Representación de una tabla de BD en Java
- **Repository**: Interfaz para operaciones con la BD
- **Service**: Capa de lógica de negocio
- **Controller**: Punto de entrada de peticiones HTTP
- **JWT**: Token de autenticación cifrado
- **CORS**: Configuración de qué dominios pueden acceder a la API
- **Exception Handler**: Manejador centralizado de errores
- **Mapper**: Convierte entre diferentes tipos de objetos

---

**¡Ahora ya conoces la estructura completa del proyecto! 🚀**

