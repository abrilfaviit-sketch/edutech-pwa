import React, { useState, useEffect } from 'react';
import PreceptorDashboard from './pages/PreceptorDashboard';
import ProfesorDashboard from './pages/ProfesorDashboard';
import Login from './pages/Login';
import AlumnoDashboard from './pages/AlumnoDashboard';
import DirectivoDashboard from './pages/DirectivoDashboard'; 

import { alumnosData } from './data/alumnosData';

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
  const [alumnosGlobales, setAlumnosGlobales] = useState(alumnosData);

  useEffect(() => {
    const sesionGuardada = localStorage.getItem('usuarioSesion');
    if (sesionGuardada) {
      try {
        setUsuario(JSON.parse(sesionGuardada));
      } catch (error) {
        localStorage.clear();
      }
    }
  }, []);

  const handleLoginSuccess = (datosUsuario) => {
    localStorage.setItem('usuarioSesion', JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  };

  const handleCerrarSesion = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUsuario(null);
    window.location.reload();
  };

  if (!usuario) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const rolUsuario = String(usuario.rol || usuario.rol_id || '').toLowerCase();

  // Alumno
  if (rolUsuario === '1' || rolUsuario === 'alumno') {
    return (
      <AlumnoDashboard 
        usuario={usuario}
        onLogout={handleCerrarSesion} 
        onCerrarSesion={handleCerrarSesion} 
      />
    );
  }

  // Preceptor
  if (rolUsuario === '2' || rolUsuario === 'preceptor') {
    return (
      <PreceptorDashboard 
        usuario={usuario} 
        onLogout={handleCerrarSesion} 
        onCerrarSesion={handleCerrarSesion}
        alumnos={alumnosGlobales}
        setAlumnos={setAlumnosGlobales}
        todosLosCursos={todosLosCursos}
      />
    );
  }

  // Directivo / Directora (Bloque completo del componente)
  if (rolUsuario === '4' || rolUsuario === 'directivo' || rolUsuario === 'directora') {
    return (
      <DirectivoDashboard 
        usuario={usuario} 
        onLogout={handleCerrarSesion} 
        onCerrarSesion={handleCerrarSesion}
      />
    );
  }
  
  // Profesor
  if (rolUsuario === '3' || rolUsuario === 'profesor') {
    return (
      <ProfesorDashboard 
        usuario={usuario} 
        onLogout={handleCerrarSesion} 
        onCerrarSesion={handleCerrarSesion}
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
        <button
          onClick={handleCerrarSesion}
          className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
        >
          Cerrar Sesión / Volver al Login
        </button>
      </div>
    </div>
  );
}