# Guía de Componentes UI (CONA-FRONT)

Esta guía explica cómo usar los componentes reutilizables del proyecto. Todos están hechos con React + TailwindCSS y usan iconos de lucide-react.

Índice
- Button
- Input
- Breadcrumb
- Card (Card, CardHeader, CardContent, CardFooter)
- Modal
- Table
- Calendar
- Alert (SweetAlert2)

## Button

Archivo: `src/components/button.jsx`

Props principales:
- `type` ("button" | "submit" | "reset") — por defecto "button"
- `loading` (boolean) — muestra spinner y deshabilita
- `disabled` (boolean)
- `fullWidth` (boolean) — ancho completo; por defecto true
- `className` (string)
- `onClick` (func)

Ejemplos:
```jsx
import Button from "../components/button";

<Button>Guardar</Button>
<Button loading>Guardando…</Button>
<Button fullWidth={false} className="bg-white text-gray-900 border border-gray-200 hover:bg-gray-50">Cancelar</Button>
```

## Input

Archivo: `src/components/input.jsx`

Props principales:
- `id`, `label`, `type` ("text" | "email" | "password" | ...)
- `value`, `onChange`
- `placeholder`, `autoComplete`, `required`, `disabled`
- `icon` (componente de icono, ej. `Mail`) — se muestra a la izquierda
- `error` (string) — mensaje de error
- `className`, `inputClassName`, `containerClassName`

Ejemplos:
```jsx
import Input from "../components/input";
import { Mail, Lock } from "lucide-react";

<Input id="email" label="Correo" type="email" icon={Mail} value={email} onChange={e=>setEmail(e.target.value)} />
<Input id="password" label="Contraseña" type="password" icon={Lock} value={pwd} onChange={e=>setPwd(e.target.value)} />
```

## Breadcrumb

Archivo: `src/components/breadcrumb.jsx`

Props:
- `homeTo` (string) — ruta del dashboard al presionar el icono Home
- `items` (Array<{label, to?}>) — elementos del breadcrumb; el último es la página actual

Ejemplo:
```jsx
import Breadcrumb from "../components/breadcrumb";

<Breadcrumb homeTo="/admin" items={[{ label: "Usuarios", to: "/admin/users" }, { label: "Listado" }]} />
```

## Card

Archivo: `src/components/card.jsx`

Subcomponentes:
- `Card` — contenedor
- `CardHeader({ title, description, right })`
- `CardContent`
- `CardFooter`

Ejemplo:
```jsx
import { Card, CardHeader, CardContent, CardFooter } from "../components/card";

<Card>
  <CardHeader title="Título" description="Descripción opcional" />
  <CardContent>
    <p>Contenido…</p>
  </CardContent>
  <CardFooter>
    <small className="text-gray-500">Pie</small>
  </CardFooter>
</Card>
```

## Modal

Archivo: `src/components/modal.jsx`

Props:
- `open` (boolean)
- `onClose` (func) — cierra con ESC y click en overlay
- `title` (string | node)
- `footer` (node) — botones o acciones

Ejemplo:
```jsx
import Modal from "../components/modal";

<Modal open={open} onClose={()=>setOpen(false)} title="Detalle" footer={<div>…</div>}>
  Contenido del modal
</Modal>
```

## Table

Archivo: `src/components/table.jsx`

Props:
- `columns`: Array<{ header, accessor, key?, cell? }>
  - `accessor`: string | (row)=>any
  - `cell?`: (value, row)=>node — para personalizar celda
- `data`: Array<any>
- `pagination` (boolean) — activar paginación
- `pageSize` (number) — por defecto 10
- `page` y `onPageChange` — modo controlado (opcional)
- `showSummary` (boolean) — muestra “Mostrando X–Y de Z”

Ejemplo simple:
```jsx
const columns = [
  { header: "Nombre", accessor: "name" },
  { header: "Correo", accessor: "email" },
  { header: "Rol", accessor: "role" },
  { header: "Acciones", accessor: "actions", cell: (_v, row) => <Button fullWidth={false}>Ver</Button> },
];
<Table columns={columns} data={rows} pagination pageSize={5} />
```

## Calendar

Archivo: `src/components/calendar.jsx`

Props:
- `value` (Date) — fecha seleccionada (opcional)
- `onChange` (func(Date)) — callback al seleccionar
- `initialYear`, `initialMonth` (number) — alternativa a `value`
- `minDate`, `maxDate` (Date) — límites
- `disabled` (func(Date)=>boolean) — deshabilitar fechas

Ejemplo:
```jsx
import Calendar from "../components/calendar";

<Calendar value={date} onChange={setDate} minDate={new Date(2024,0,1)} maxDate={new Date(2026,11,31)} />
```

## Alert (SweetAlert2)

Archivo: `src/components/alert.jsx`

Funciones:
- `alertSuccess(title?, text?)`
- `alertError(title?, text?)`
- `alertInfo(title?, text?)`
- `alertWarning(title?, text?)`
- `alertConfirm({ title?, text?, confirmText?, cancelText?, icon? })`
- `alertToast(title, icon?)` — icon: "success" | "info" | "error" | "warning" | "question"

Ejemplos:
```jsx
import { alertConfirm, alertSuccess, alertInfo, alertToast } from "../components/alert.jsx";

const res = await alertConfirm({ title: "¿Cambiar estado?", confirmText: "Sí" });
if (res.isConfirmed) await alertSuccess("Listo", "Estado actualizado");
else alertInfo("Acción cancelada");

alertToast("Guardado", "success");
```

Notas
- Todos los componentes están estilizados con Tailwind; puedes extender `className` para personalizar.
- Los iconos vienen de `lucide-react` y se pasan como componentes (por ejemplo, `icon={Mail}`).
- Mantén los componentes sin lógica de negocio; eso va en servicios/contexts.
