import React, { useState, useEffect } from 'react';
import PreceptorDashboard from './pages/PreceptorDashboard';
import ProfesorDashboard from './pages/ProfesorDashboard';
import Login from './pages/Login';
import AlumnoDashboard from './pages/AlumnoDashboard';

// 1. Importamos la data unificada desde tu archivo mock
import { alumnosData } from './data/alumnosData';

// 2. Cursos disponibles para los filtros
const todosLosCursos = [
  '1° A', '1° B', '1° C',
  '2° A', '2° B', '2° C',
  '3° A', '3° B', '3° C',
  '4° A', '4° B', '4° C',
  '5° A', '5° B', '5° C',
  '6° A', '6° B', '6° C'
];

export default function App() {
  const [usuario, setUsuario] = useState(null);
  
  // ESTADO GLOBAL DE ALUMNOS (Cargado con la data mock)
  const [alumnosGlobales, setAlumnosGlobales] = useState(alumnosData);

  useEffect(() => {
    const sesionGuardada = localStorage.getItem('usuarioSesion');
    if (sesionGuardada) {
      setUsuario(JSON.parse(sesionGuardada));
    }
  }, []);

  const handleLoginSuccess = (datosUsuario) => {
    setUsuario(datosUsuario);
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuarioSesion');
    setUsuario(null);
  };

  if (!usuario) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (usuario.rol === 'alumno' || usuario.rol == 1) {
    return <AlumnoDashboard onCerrarSesion={handleCerrarSesion} />;
  }

  if (usuario.rol == 2 || usuario.rol === 'preceptor') {
    return (
      <PreceptorDashboard 
        usuario={usuario} 
        onLogout={handleCerrarSesion} 
        alumnos={alumnosGlobales}
        setAlumnos={setAlumnosGlobales}
        todosLosCursos={todosLosCursos}
      />
    );
  }
  
  if (usuario.rol == 3 || usuario.rol === 'profesor') {
    return (
      <ProfesorDashboard 
        usuario={usuario} 
        onLogout={handleCerrarSesion} 
        alumnos={alumnosGlobales}
        setAlumnos={setAlumnosGlobales}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 max-w-md w-full space-y-4">
        <span className="text-4xl">🔑</span>
        <h2 className="text-xl font-bold text-slate-800">
          ¡Hola, {usuario.nombre || 'Usuario'}!
        </h2>
        <p className="text-sm text-slate-500">
          Iniciaste sesión con el rol: <strong className="uppercase text-blue-600">{usuario.rol}</strong>.
        </p>
        <button
          onClick={handleCerrarSesion}
          className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all"
        >
          Cerrar Sesión / Volver al Login
        </button>
      </div>
    </div>
  );
}