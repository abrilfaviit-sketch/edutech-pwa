import { useState, useEffect } from 'react';
import PreceptorDashboard from './pages/PreceptorDashboard';
import ProfesorDashboard from './pages/ProfesorDashboard';
import Login from './pages/Login';
import AlumnoDashboard from './pages/AlumnoDashboard';
import DirectivoDashboard from './pages/DirectivoDashboard'; 
import { obtenerAlumnos } from './services/alumnosService.js';

// import { alumnosData } from './data/alumnosData'; (ya no lo usamos más, era temporal)

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
  //alumnosGlobales como array vacío para esperar los datos de la bd
  const [alumnosGlobales, setAlumnosGlobales] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Recupera la sesión guardada al recargar la página 
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

  // Carga los alumnos desde el Backend cuando un usuario inicia sesión
  useEffect(() => {
    if (usuario) {
      const cargarAlumnos = async () => {
        try {
          setCargando(true);
          const datos = await obtenerAlumnos();
          setAlumnosGlobales(datos || []);
        } catch (error) {
          console.error("Error al traer los alumnos del backend:", error);
        } finally {
          setCargando(false);
        }
      };
      cargarAlumnos();
    }
  }, [usuario]);

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

  // Si no hay usuario logueado, muestra el Login
  if (!usuario) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Si está trayendo la lista de alumnos de bd muestra pantalla de carga
  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
        Cargando datos del sistema...
      </div>
    );
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

  // Directivo / Directora
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