import { useState } from 'react';
import { UserCheck, ShieldAlert, School } from 'lucide-react';
import api from '../../services/api';// Puente Axios hacia http://localhost:4000/api 

export default function Login({ onLoginSuccess }) {
  // Estado para el rol activo (por defecto 'preceptor')
  const [rolSeleccionado, setRolSeleccionado] = useState('preceptor');
  
  // Estados para los campos de credenciales reales
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado para controlar la carga y peticiones al backend
  const [cargando, setCargando] = useState(false);
  
  // Estado para manejar alertas y errores en pantalla
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Manejar el cambio de rol en la interfaz
  const handleCambioRol = (nuevoRol) => {
    setRolSeleccionado(nuevoRol);
    setMensaje({ texto: '', tipo: '' });
  };

  // Procesar el formulario de Login enviando los datos al Backend en Node.js
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });
    setCargando(true);

    try {
      // 1. Enviar petición HTTP POST al servidor Express
      const respuesta = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password,
        rol: rolSeleccionado // Enviamos el rol seleccionado para validación si el backend lo requiere
      });

      // 2. Extraer token y datos del usuario devueltos por el backend
      const { token, usuario } = respuesta.data;

      // 3. Guardar sesión y JWT en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      setMensaje({
        texto: `¡Bienvenido/a ${usuario.nombre || 'al sistema'}! Redirigiendo...`,
        tipo: 'exito'
      });

      // 4. Ejecutar el callback de éxito o redirigir
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(usuario);
        } else {
          window.location.href = '/dashboard';
        }
      }, 1000);

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      
      // Capturar el mensaje exacto de error enviado por Express (o error de red)
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
        
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-1">
            <School size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión Escolar</h2>
          <p className="text-sm text-slate-500">Seleccioná tu perfil e ingresá tus datos</p>
        </div>

        {/* Selector de Rol (Incluye los 4 roles del Backend) */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleCambioRol('directora')}
            className={`flex-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
              rolSeleccionado === 'directora'
                ? 'bg-white text-blue-600 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Directora
          </button>
          <button
            type="button"
            onClick={() => handleCambioRol('preceptor')}
            className={`flex-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
              rolSeleccionado === 'preceptor'
                ? 'bg-white text-blue-600 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Preceptor
          </button>
          <button
            type="button"
            onClick={() => handleCambioRol('profesor')}
            className={`flex-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
              rolSeleccionado === 'profesor'
                ? 'bg-white text-blue-600 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Profesor
          </button>
          <button
            type="button"
            onClick={() => handleCambioRol('alumno')}
            className={`flex-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
              rolSeleccionado === 'alumno'
                ? 'bg-white text-blue-600 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Alumno
          </button>
        </div>

        {/* Formulario conectado a la API */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
              Correo Electrónico / Usuario
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: usuario@escuela.edu.ar"
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

          {/* Cartel de Mensaje de Error / Éxito / Advertencia */}
          {mensaje.texto && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 ${
                mensaje.tipo === 'error'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : mensaje.tipo === 'exito'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {mensaje.tipo === 'error' ? (
                <ShieldAlert size={16} />
              ) : (
                <UserCheck size={16} />
              )}
              <span>{mensaje.texto}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center"
          >
            {cargando ? 'Verificando...' : 'Ingresar al Sistema'}
          </button>
        </form>

      </div>
    </div>
  );
}