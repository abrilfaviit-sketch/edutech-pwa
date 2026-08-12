import React, { useState } from 'react';
import { LogIn, UserCheck } from 'lucide-react';

export default function Login() {
  const [rol, setRol] = useState('alumno');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ rol, email, password });
    alert(`Intentando ingresar como ${rol} con email: ${email}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
            <LogIn size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">EduTech PWA</h2>
          <p className="text-sm text-slate-500 mt-1">Ingresá a tu cuenta para continuar</p>
        </div>

        {/* Selección de Rol Actualizada */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setRol('alumno')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              rol === 'alumno' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Alumno
          </button>
          <button
            type="button"
            onClick={() => setRol('docente')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              rol === 'docente' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Docente
          </button>
          <button
            type="button"
            onClick={() => setRol('preceptor')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              rol === 'preceptor' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Preceptor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-6"
          >
            <UserCheck size={18} />
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}