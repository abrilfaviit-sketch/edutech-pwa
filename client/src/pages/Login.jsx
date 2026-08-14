import React, { useState } from 'react';
import { UserCheck, ShieldAlert, School } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  // Estado para el rol activo (por defecto 'preceptor')
  const [rolSeleccionado, setRolSeleccionado] = useState('preceptor');
  
  // Estados para los campos de texto
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  
  // Estado para manejar alertas y errores
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Base de datos de prueba integrada
  const usuariosValidos = {
    preceptor: [
      { nombre: "Maria Elena Rodriguez", dni: "20123456" }
    ],
    profesor: [
      { nombre: "Carlos Mendoza", dni: "30123456" },
      { nombre: "Laura Gómez", dni: "31234567" }
    ],
    alumno: [
      { nombre: "Matias Fernández", dni: "45123456" },
      { nombre: "Sofia López", dni: "45234567" }
    ]
  };

  // Manejar el cambio de rol
  const handleCambioRol = (nuevoRol) => {
    setRolSeleccionado(nuevoRol);
    setMensaje({ texto: '', tipo: '' });
  };

  // Procesar el formulario de Login
  const handleSubmit = (e) => {
    e.preventDefault();

    const nombreLimpio = nombre.trim().toLowerCase();
    const dniLimpio = dni.trim().replace(/\D/g, ''); // Deja solo números

    const listaRol = usuariosValidos[rolSeleccionado] || [];

    // Buscar si coinciden los datos
    const usuarioEncontrado = listaRol.find(
      (u) => u.nombre.toLowerCase() === nombreLimpio && u.dni === dniLimpio
    );

    if (usuarioEncontrado) {
      setMensaje({ texto: '', tipo: '' });

      const datosSesion = {
        nombre: usuarioEncontrado.nombre,
        dni: usuarioEncontrado.dni,
        rol: rolSeleccionado
      };

      // Guardamos la sesión en el navegador
      localStorage.setItem('usuarioSesion', JSON.stringify(datosSesion));

      // Si le pasamos la función de éxito, la ejecutamos
      if (onLoginSuccess) {
        onLoginSuccess(datosSesion);
      } else {
        // Redirección por defecto si usamos rutas de React
        alert(`¡Bienvenido/a ${usuarioEncontrado.nombre}! Redirigiendo al panel de ${rolSeleccionado.toUpperCase()}...`);
      }
    } else {
      setMensaje({
        texto: `Datos incorrectos para el perfil ${rolSeleccionado.toUpperCase()}.`,
        tipo: 'error'
      });
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

        {/* Selector de Rol */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 gap-1">
          <button
            type="button"
            onClick={() => handleCambioRol('preceptor')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
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
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
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
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              rolSeleccionado === 'alumno'
                ? 'bg-white text-blue-600 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Alumno
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-xs font-bold text-slate-700 mb-1.5">
              Nombre Completo
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Maria Elena Rodriguez"
              required
              autoComplete="off"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label htmlFor="dni" className="block text-xs font-bold text-slate-700 mb-1.5">
              Número de DNI
            </label>
            <input
              type="text"
              id="dni"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ej: 20123456 (sin puntos)"
              required
              autoComplete="off"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Cartel de Error o Advertencia */}
          {mensaje.texto && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 ${
                mensaje.tipo === 'error'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {mensaje.tipo === 'error' ? <ShieldAlert size={16} /> : <UserCheck size={16} />}
              <span>{mensaje.texto}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            Ingresar al Sistema
          </button>
        </form>

      </div>
    </div>
  );
}