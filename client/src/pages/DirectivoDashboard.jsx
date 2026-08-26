import React, { useState } from 'react';
import { School, LogOut, Users, BookOpen, Settings } from 'lucide-react';

export default function DirectivoDashboard({ usuario, onLogout, onCerrarSesion }) {
  const [activeTab, setActiveTab] = useState('inicio');
  const handleSalir = onLogout || onCerrarSesion;

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
              onClick={() => setActiveTab('inicio')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'inicio' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <BookOpen size={16} /> Resumen General
            </button>
            <button
              onClick={() => setActiveTab('institucion')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
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
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h1 className="text-2xl font-bold text-slate-800">
            {activeTab === 'inicio' ? 'Bienvenida al Panel Directivo' : 'Gestión Institucional'}
          </h1>
          <p className="text-sm text-slate-500">
            Desde aquí podés supervisar las actividades del establecimiento escolar, los preceptores, profesores y alumnos.
          </p>
        </div>
      </main>
    </div>
  );
}