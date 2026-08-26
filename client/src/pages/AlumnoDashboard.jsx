import React, { useState } from 'react';
import { BookOpen, Upload, CheckCircle, Clock, AlertCircle, LogOut } from 'lucide-react';
import ModalEntrega from '../components/ModalEntrega';

export default function AlumnoDashboard({ onLogout, onCerrarSesion }) {
  // Función para cerrar sesión limpiando todo el almacenamiento
  const handleSalir = () => {
    if (onLogout) onLogout();
    else if (onCerrarSesion) onCerrarSesion();
    else {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const [materias] = useState([
    { id: 1, nombre: 'Base de Datos I', docente: 'Prof. García', tareasPendientes: 1 },
    { id: 2, nombre: 'Programación Web', docente: 'Prof. Martínez', tareasPendientes: 2 },
    { id: 3, nombre: 'Inglés Técnico', docente: 'Prof. López', tareasPendientes: 0 },
  ]);

  const [tareas, setTareas] = useState([
    { id: 101, materiaId: 1, titulo: 'Diagrama Entidad Relación', fechaEntrega: '2026-08-15', estado: 'pendiente' },
    { id: 102, materiaId: 2, titulo: 'Maquetado PWA con React', fechaEntrega: '2026-08-20', estado: 'pendiente' },
    { id: 103, materiaId: 3, titulo: 'Traducción de Documentación', fechaEntrega: '2026-08-10', estado: 'entregado' },
  ]);

  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [notificacion, setNotificacion] = useState(false);

  const handleGuardarEntrega = (datosEntrega) => {
    if (!datosEntrega) return;

    setTareas((prevTareas) =>
      prevTareas.map((t) =>
        t.id === datosEntrega.tareaId ? { ...t, estado: 'entregado' } : t
      )
    );

    setTareaSeleccionada(null);

    setNotificacion(true);
    setTimeout(() => {
      setNotificacion(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative">
      {/* Notificación Toast simple */}
      {notificacion && (
        <div key="toast-exito" className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold">
          <CheckCircle size={18} />
          <span>¡Trabajo entregado con éxito!</span>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold">EduTech PWA</h1>
            <p className="text-xs text-slate-500">Panel del Estudiante</p>
          </div>
        </div>
        <button 
          type="button"
          onClick={handleSalir} 
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-red-600 transition-all bg-slate-100 hover:bg-red-50 px-3 py-2 rounded-lg cursor-pointer"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold">¡Hola de nuevo! 👋</h2>
          <p className="text-blue-100 text-sm mt-1">Tenés tareas pendientes para esta semana.</p>
        </div>

        {/* Sección Materias */}
        <div>
          <h3 className="text-base font-bold text-slate-700 mb-4">Tus Materias</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {materias.map((m) => (
              <div key={m.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full">Activa</span>
                <h4 className="font-bold text-slate-800 mt-3">{m.nombre}</h4>
                <p className="text-xs text-slate-500 mt-1">{m.docente}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lista Tareas */}
        <div>
          <h3 className="text-base font-bold text-slate-700 mb-4">Próximas Entregas</h3>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
            {tareas.map((t) => {
              const estaEntregado = t.estado === 'entregado';

              return (
                <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-800 text-sm">{t.titulo}</h4>
                      {estaEntregado ? (
                        <span key={`badge-entregado-${t.id}`} className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          <CheckCircle size={12} /> Entregado
                        </span>
                      ) : (
                        <span key={`badge-pendiente-${t.id}`} className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          <Clock size={12} /> Pendiente
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <AlertCircle size={12} /> Vence el: {t.fechaEntrega}
                    </p>
                  </div>

                  {estaEntregado ? (
                    <button 
                      key={`btn-entregado-${t.id}`}
                      type="button"
                      disabled
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed opacity-90"
                    >
                      <CheckCircle size={14} /> Tarea Entregada
                    </button>
                  ) : (
                    <button 
                      key={`btn-pendiente-${t.id}`}
                      type="button"
                      onClick={() => setTareaSeleccionada(t)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 cursor-pointer transition-all"
                    >
                      <Upload size={14} /> Subir Trabajo
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Modal */}
      {tareaSeleccionada && (
        <ModalEntrega
          key="modal-entrega-component"
          tarea={tareaSeleccionada}
          onClose={() => setTareaSeleccionada(null)}
          onGuardar={handleGuardarEntrega}
        />
      )}
    </div>
  );
}