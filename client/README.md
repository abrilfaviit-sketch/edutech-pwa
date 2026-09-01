## Historial
SEMANA 1: Armado de la cara del proyecto
----------------------------------------------------------------------
En esta primera etapa nos enfocamos en que todo se viera bien y funcionara 
en la pantalla. Para no depender de un servidor todavía, usamos datos 
de prueba.

• Creamos la pantalla del Preceptor (PreceptorDashboard.jsx) con sus 
  filtros de cursos, la lista de asistencias y el panel de sanciones.
• Le pusimos datos "de mentira" guardados en un archivo (alumnosData.js) 
  para ver cómo reaccionaban los botones y la interfaz.


- SEMANA 2: Construimos el Backend
----------------------------------------------------------------------
Acá dejamos de lado la pantalla un ratito y nos pusimos a programar 
el servidor que va a guardar la información real.

• Levantamos el servidor con Node.js en la dirección http://localhost:4000/api.
• Programamos el sistema de seguridad (/auth/login) para que valide si 
  la contraseña es correcta y entregue una "llave digital" (Token JWT).
• Preparamos las rutas (/alumnos) para cuando el frontend le pida datos.


- SEMANA 3: Conectamos todo 
----------------------------------------------------------------------
En este punto juntamos la pantalla que hicimos en la Semana 1 con el motor 
de la Semana 2. 

1. El usuario entra a la pantalla de Login (Login.jsx):
   • Elige su rol (Preceptor, Profesor, Directivo o Alumno).
   • Pone su usuario y clave, y el archivo api.js se los manda al servidor.

2. Si los datos son correctos:
   • Guardamos la "llave" (Token) en la memoria del navegador (localStorage).
   • El componente principal (App.jsx) toma el mando.

3. App.jsx decide qué mostrar:
   • Llama a alumnosServices.js para traer a los alumnos reales del servidor.
   • Revisa el rol del usuario que entró y le abre la puerta a su pantalla 
     correspondiente (PreceptorDashboard, ProfesorDashboard, etc).

## Estado del proyecto
Semana 3:
[ Login.jsx ]
   │
   ├─► Envía credenciales vía POST a /auth/login (api.js)
   ├─► Guarda 'token' y 'usuarioSesion' en localStorage
   └─► Notifica a App.jsx ejecutando onLoginSuccess(usuarioFinal)
         │
         ▼
[ App.jsx ]
   │
   ├─► Verifica si existe sesión activa
   ├─► Obtiene la lista global mediante obtenerAlumnos() (alumnosServices.js)
   └─► Renderiza el Dashboard correspondiente según el rol:
         ├─► Preceptor  ──► [ PreceptorDashboard.jsx ]
         ├─► Profesor   ──► [ ProfesorDashboard.jsx ]
         ├─► Directivo  ──► [ DirectivoDashboard.jsx ]
         └─► Alumno     ──► [ AlumnoDashboard.jsx ]



---------------------------------------------------------------------------------------------------------
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.