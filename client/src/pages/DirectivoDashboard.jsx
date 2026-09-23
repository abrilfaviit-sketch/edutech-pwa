import { useState, useEffect } from 'react';
import { School, LogOut, Users, BookOpen, Loader2, GraduationCap, UserCheck } from 'lucide-react';
import api from '../services/api';

export default function DirectivoDashboard({ usuario, onLogout, onCerrarSesion }) {
  const [activeTab, setActiveTab] = useState('inicio');
  const handleSalir = onLogout || onCerrarSesion;

  // Estados para métricas traídas de Supabase
  const [metricas, setMetricas] = useState({
    totalAlumnos: 0,
    totalProfesores: 0,
    asistenciaPromedio: '0%'
  });
  const [cargando, setCargando] = useState(true);

  // Cargar estadísticas desde el backend
  useEffect(() => {
    const cargarResumen = async () => {
      try {
        setCargando(true);
        // Petición al endpoint que calcula métricas directivas
        const res = await api.get('/directivo/resumen');
        setMetricas(res.data);
      } catch (error) {
        console.error('Error al cargar métricas directivas desde Supabase:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarResumen();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar del Directivo */}
      <aside className="w-64 bg-slate-900 text-slate-300 p-4 flex flex-col justify-between h-screen sticky top-0 border-r border-slate-800">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <School size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Panel Directivo</h2>
              <p className="text-xs text-slate-400">
                Hola, <strong className="text-blue-400">{usuario?.nombre || 'Directora'}</strong>
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('inicio')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'inicio' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <BookOpen size={16} /> Resumen General
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('institucion')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'institucion' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Users size={16} /> Gestión Institucional
            </button>
          </nav>
        </div>

        {/* Botón de Salida */}
        <button
          type="button"
          onClick={handleSalir}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow cursor-pointer"
        >
          <LogOut size={16} /> Cerrar Sesión
        </button>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            {activeTab === 'inicio' ? 'Bienvenida al Panel Directivo' : 'Gestión Institucional'}
          </h1>
          <p className="text-sm text-slate-500">
            Desde aquí podés supervisar las actividades del establecimiento escolar, los preceptores, profesores y alumnos.
          </p>
        </div>

        {/* Métricas dinámicas traídas de la DB */}
        {cargando ? (
          <div className="flex items-center gap-2 text-slate-500 py-6">
            <Loader2 className="animate-spin text-blue-600" size={20} />
            <span className="text-sm font-medium">Cargando métricas de la institución...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <GraduationCap size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Total de Alumnos</p>
                <h3 className="text-xl font-bold text-slate-800">{metricas.totalAlumnos || 0}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Docentes Activos</p>
                <h3 className="text-xl font-bold text-slate-800">{metricas.totalProfesores || 0}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <UserCheck size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Asistencia Global</p>
                <h3 className="text-xl font-bold text-slate-800">{metricas.asistenciaPromedio || '0%'}</h3>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}