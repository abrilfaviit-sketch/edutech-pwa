import { useState } from 'react';
import { UserCheck, ShieldAlert, School } from 'lucide-react';
import api from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [rolSeleccionado, setRolSeleccionado] = useState('preceptor');
  const [usuarioOEmail, setUsuarioOEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const handleCambioRol = (nuevoRol) => {
    setRolSeleccionado(nuevoRol);
    setMensaje({ texto: '', tipo: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });
    setCargando(true);

    try {
      const respuesta = await api.post('/auth/login', {
        usuario: usuarioOEmail.trim(),
        email: usuarioOEmail.trim(),
        password: password,
        rol: rolSeleccionado
      });

      const { token, usuario } = respuesta.data;

      // Si la pestaña seleccionada es 'directora', le asignamos el rol 'directora'
      const rolDefinitivo = rolSeleccionado === 'directora' ? 'directora' : (usuario.rol || usuario.rol_id || rolSeleccionado);

      const usuarioFinal = {
        ...usuario,
        rol: rolDefinitivo
      };

      // Guardamos la sesión con el nombre EXACTO que lee App.jsx
      localStorage.setItem('token', token);
      localStorage.setItem('usuarioSesion', JSON.stringify(usuarioFinal));

      setMensaje({
        texto: `¡Bienvenido/a ${usuarioFinal.nombre || 'al sistema'}! Redirigiendo...`,
        tipo: 'exito'
      });

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(usuarioFinal);
        }
      }, 800);

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      const errorServidor = error.response?.data?.error || 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';

      setMensaje({
        texto: errorServidor,
        tipo: 'error'
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">

        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-1">
            <School size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión Escolar</h2>
          <p className="text-sm text-slate-500">Seleccioná tu perfil e ingresá tus datos</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 gap-1 overflow-x-auto">
          {['directora', 'preceptor', 'profesor', 'alumno'].map((rol) => (
            <button
              key={rol}
              type="button"
              onClick={() => handleCambioRol(rol)}
              className={`flex-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all capitalize ${rolSeleccionado === rol
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {rol}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="usuario" className="block text-xs font-bold text-slate-700 mb-1.5">
              Correo Electrónico / Usuario
            </label>
            <input
              type="text"
              id="usuario"
              value={usuarioOEmail}
              onChange={(e) => setUsuarioOEmail(e.target.value)}
              placeholder="Ej: nombre_usuario o correo@escuela.edu.ar"
              required
              autoComplete="username"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {mensaje.texto && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 ${mensaje.tipo === 'error'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
            >
              {mensaje.tipo === 'error' ? <ShieldAlert size={16} /> : <UserCheck size={16} />}
              <span>{mensaje.texto}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer flex items-center justify-center"
          >
            {cargando ? 'Verificando...' : 'Ingresar al Sistema'}
          </button>
        </form>

      </div>
    </div>
  );
}