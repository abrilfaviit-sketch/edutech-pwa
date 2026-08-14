import React, { useState } from 'react';
import { X, UploadCloud, FileCheck } from 'lucide-react';

export default function ModalEntrega({ tarea, onClose, onGuardar }) {
  const [archivo, setArchivo] = useState(null);
  const [comentario, setComentario] = useState('');

  if (!tarea) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!archivo) {
      alert('Por favor seleccioná un archivo primero.');
      return;
    }

    const entregaData = {
      tareaId: tarea.id,
      nombreArchivo: archivo.name || 'archivo.pdf',
      tamano: archivo.size ? (archivo.size / 1024).toFixed(1) + ' KB' : '0 KB',
      comentario: comentario || '',
      fecha: new Date().toLocaleDateString(),
    };

    if (typeof onGuardar === 'function') {
      onGuardar(entregaData);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-bold text-slate-800">Entregar Trabajo Práctico</h3>
        <p className="text-xs text-slate-500 mt-1">{tarea.titulo}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer relative">
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <UploadCloud className="mx-auto text-blue-500 mb-2" size={32} />
            <p className="text-xs font-semibold text-slate-700">
              {archivo ? archivo.name : 'Haz clic o arrastrá tu archivo PDF/Imagen'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Soporta archivos de hasta 10MB</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Comentarios para el docente (opcional)
            </label>
            <textarea
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Ej: Adjunto la resolución de los puntos 1 a 5..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
            >
              <FileCheck size={16} />
              Confirmar Entrega
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}