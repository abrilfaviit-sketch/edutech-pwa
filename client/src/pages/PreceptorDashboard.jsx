import { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarCheck, 
  AlertTriangle, 
  User, 
  Settings, 
  LogOut, 
  CheckCircle2, 
  Search, 
  Loader2 
} from 'lucide-react';
import api from '../services/api';

export default function PreceptorDashboard({ usuario, onLogout, onCerrarSesion }) {
  const handleSalir = onLogout || onCerrarSesion;

  // Estados de datos
  const [misCursos, setMisCursos] = useState([]);
  const [todosLosCursos, setTodosLosCursos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [historialSanciones, setHistorialSanciones] = useState([]);
  
  // UI & Navegación
  const [activeTab, setActiveTab] = useState('dashboard');
  const [configurandoCursos, setConfigurandoCursos] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('Todos');
  const [turnoFilter, setTurnoFilter] = useState('Todos');
  const [cursoAsistencia, setCursoAsistencia] = useState('');
  const [fechaAsistencia, setFechaAsistencia] = useState(new Date().toISOString().split('T')[0]);

  // Formulario de sanciones
  const [sancionAlumnoId, setSancionAlumnoId] = useState('');
  const [sancionTipo, setSancionTipo] = useState('Apercibimiento');
  const [sancionFecha, setSancionFecha] = useState(new Date().toISOString().split('T')[0]);
  const [sancionMotivo, setSancionMotivo] = useState('');

  //Carga datos iniciales desde el backend
  useEffect(() => {
    const cargarDatosPreceptor = async () => {
      try {
        setCargando(true);
        const [resCursos, resAlumnos, resSanciones] = await Promise.all([
          api.get('/preceptor/cursos'),
          api.get('/preceptor/alumnos'),
          api.get('/preceptor/sanciones')
        ]);

        const cursosAsignados = resCursos.data.misCursos || [];
        setMisCursos(cursosAsignados);
        setTodosLosCursos(resCursos.data.todosLosCursos || []);
        setAlumnos(resAlumnos.data || []);
        setHistorialSanciones(resSanciones.data || []);

        if (cursosAsignados.length > 0) {
          setCursoAsistencia(cursosAsignados[0]);
        }
      } catch (error) {
        console.error('Error al cargar datos del preceptor:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosPreceptor();
  }, []);

  // Alternar cursos asignados
  const toggleCurso = (curso) => {
    if (misCursos.includes(curso)) {
      setMisCursos(misCursos.filter(c => c !== curso));
    } else {
      setMisCursos([...misCursos, curso]);
    }
  };

  // Filtrado de alumnos por cursos asignados
  const alumnosDeMisCursos = alumnos.filter(a => misCursos.includes(a.curso));

  const alumnosFiltrados = alumnosDeMisCursos.filter(alumno => {
    const coincideBusqueda = 
      alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (alumno.dni && alumno.dni.toString().includes(searchTerm));
    const coincideDivision = divisionFilter === 'Todos' || alumno.curso === divisionFilter;
    const coincideTurno = turnoFilter === 'Todos' || alumno.turno === turnoFilter;
    return coincideBusqueda && coincideDivision && coincideTurno;
  });

  // Modificar asistencia localmente en pantalla
  const handleEstadoAsistenciaChange = (alumnoId, nuevoEstado) => {
    setAlumnos(prev =>
      prev.map(a => (a.id.toString() === alumnoId.toString() ? { ...a, estado: nuevoEstado } : a))
    );
  };

  // Persistir Toma de Asistencia en Supabase / Backend
  const handleGuardarAsistencia = async () => {
    try {
      setGuardando(true);
      const alumnosDelCurso = alumnosDeMisCursos.filter(a => a.curso === cursoAsistencia);
      
      const payload = {
        fecha: fechaAsistencia,
        curso: cursoAsistencia,
        asistencias: alumnosDelCurso.map(a => ({
          alumno_id: a.id,
          estado: a.estado || 'Presente'
        }))
      };

      await api.post('/preceptor/asistencia', payload);
      alert('¡Asistencia registrada con éxito!');
    } catch (error) {
      console.error('Error al guardar asistencia:', error);
      alert('Error al intentar registrar la asistencia.');
    } finally {
      setGuardando(false);
    }
  };

  // Persistir Nueva Sanción
  const handleGuardarSancion = async () => {
    if (!sancionAlumnoId || !sancionMotivo.trim()) {
      alert('Por favor seleccioná un alumno e ingresá el motivo.');
      return;
    }

    try {
      setGuardando(true);
      const payload = {
        alumno_id: sancionAlumnoId,
        tipo: sancionTipo,
        motivo: sancionMotivo,
        fecha: sancionFecha
      };

      const res = await api.post('/preceptor/sanciones', payload);
      
      setHistorialSanciones([res.data, ...historialSanciones]);
      alert('¡Sanción registrada correctamente!');
      setSancionAlumnoId('');
      setSancionMotivo('');
    } catch (error) {
      console.error('Error al guardar sanción:', error);
      alert('Ocurrió un error al registrar la sanción.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-3">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <p className="text-sm font-medium">Cargando panel de preceptoría...</p>
      </div>
    );
  }

  // Modal / Pantalla de selección de cursos
  if (configurandoCursos) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Seleccioná tus Cursos a Cargo</h2>
            <p className="text-sm text-slate-500 mt-1">
              Marcá las divisiones de las que sos responsable.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-80 overflow-y-auto p-1">
            {todosLosCursos.map((curso) => {
              const seleccionado = misCursos.includes(curso);
              return (
                <button
                  key={curso}
                  type="button"
                  onClick={() => toggleCurso(curso)}
                  className={`py-2 px-3 rounded-xl font-semibold text-xs border transition flex justify-between items-center cursor-pointer ${
                    seleccionado
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{curso}</span>
                  {seleccionado && <span>✓</span>}
                </button>
              );
            })}
          </div>

          <div className="border-t pt-4 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Cursos seleccionados: <strong>{misCursos.length}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                if (misCursos.length === 0) {
                  alert('Debes seleccionar al menos un curso a cargo.');
                  return;
                }
                if (!misCursos.includes(cursoAsistencia)) {
                  setCursoAsistencia(misCursos[0]);
                }
                setConfigurandoCursos(false);
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow transition cursor-pointer"
            >
              Confirmar y Continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header Superior */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-slate-800 font-semibold text-sm">
            Rol: <strong className="text-blue-600">Preceptor</strong>
          </span>
          <button
            type="button"
            onClick={() => setConfigurandoCursos(true)}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 font-medium transition flex items-center gap-1.5 cursor-pointer"
          >
            <Settings size={14} /> Mis Cursos ({misCursos.length})
          </button>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Online</span>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-slate-300 p-4 flex flex-col justify-between min-h-[calc(100vh-57px)]">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">General</p>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Users size={16} /> Panel
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('perfil')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    activeTab === 'perfil' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <User size={16} /> Mis Datos
                </button>
              </nav>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gestión Preceptoría</p>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('alumnos')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    activeTab === 'alumnos' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Users size={16} /> Mis Cursos
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('asistencia')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    activeTab === 'asistencia' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <CalendarCheck size={16} /> Toma de Asistencia
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('sanciones')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    activeTab === 'sanciones' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <AlertTriangle size={16} /> Sanciones
                </button>
              </nav>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSalir}
            className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition mt-6 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Vista 1: Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Panel del Preceptor</h1>
                <p className="text-slate-500 text-sm">
                  Cursos a cargo: {misCursos.length > 0 ? misCursos.join(', ') : 'Ninguno asignado'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Total Alumnos A Cargo</span>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{alumnosDeMisCursos.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
                  <span className="text-xs text-slate-500 font-medium">Presentes Hoy</span>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {alumnosDeMisCursos.filter(a => a.estado === 'Presente').length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
                  <span className="text-xs text-slate-500 font-medium">Ausentes Hoy</span>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {alumnosDeMisCursos.filter(a => a.estado === 'Ausente').length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
                  <span className="text-xs text-slate-500 font-medium">Tardanzas Hoy</span>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {alumnosDeMisCursos.filter(a => a.estado === 'Tardanza').length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Vista 2: Mis Cursos / Alumnos */}
          {activeTab === 'alumnos' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Mis Cursos y Alumnos</h1>
                <p className="text-slate-500 text-sm">Listado de alumnos de tus divisiones asignadas ({alumnosFiltrados.length} mostrados)</p>
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar por Nombre o DNI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Turno:</span>
                  {['Todos', 'Mañana', 'Tarde'].map(turno => (
                    <button
                      key={turno}
                      type="button"
                      onClick={() => setTurnoFilter(turno)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${turnoFilter === turno ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {turno}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDivisionFilter('Todos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${divisionFilter === 'Todos' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Todos
                  </button>
                  {misCursos.map(div => (
                    <button
                      key={div}
                      type="button"
                      onClick={() => setDivisionFilter(div)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${divisionFilter === div ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {div}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                    <tr>
                      <th className="p-4">Alumno</th>
                      <th className="p-4">DNI</th>
                      <th className="p-4">Curso</th>
                      <th className="p-4">Turno</th>
                      <th className="p-4">Estado Hoy</th>
                      <th className="p-4">Inasistencias</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alumnosFiltrados.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="p-4 font-medium text-slate-800">{a.nombre}</td>
                        <td className="p-4">{a.dni}</td>
                        <td className="p-4">{a.curso}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            a.turno === 'Mañana' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {a.turno}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            a.estado === 'Presente' ? 'bg-emerald-100 text-emerald-800' :
                            a.estado === 'Tardanza' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {a.estado || 'Presente'}
                          </span>
                        </td>
                        <td className="p-4">{a.inasistencias || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vista 3: Asistencia */}
          {activeTab === 'asistencia' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Toma de Asistencia Diaria</h1>
                <p className="text-slate-500 text-sm">Seleccioná uno de tus cursos asignados</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Curso / División</label>
                    <select 
                      value={cursoAsistencia}
                      onChange={(e) => setCursoAsistencia(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {misCursos.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Fecha</label>
                    <input 
                      type="date" 
                      value={fechaAsistencia}
                      onChange={(e) => setFechaAsistencia(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleGuardarAsistencia}
                  disabled={guardando}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  {guardando ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Guardar Asistencia
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                    <tr>
                      <th className="p-4">Alumno</th>
                      <th className="p-4">Turno</th>
                      <th className="p-4 text-center">Presente</th>
                      <th className="p-4 text-center">Ausente</th>
                      <th className="p-4 text-center">Tardanza</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alumnosDeMisCursos
                      .filter(a => a.curso === cursoAsistencia)
                      .map(a => (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="p-4 font-medium text-slate-800">{a.nombre}</td>
                          <td className="p-4">
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-600">
                              {a.turno}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <input 
                              type="radio" 
                              name={`asistencia-${a.id}`} 
                              checked={(a.estado || 'Presente') === 'Presente'} 
                              onChange={() => handleEstadoAsistenciaChange(a.id, 'Presente')}
                              className="w-4 h-4 accent-emerald-600 cursor-pointer" 
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input 
                              type="radio" 
                              name={`asistencia-${a.id}`} 
                              checked={a.estado === 'Ausente'} 
                              onChange={() => handleEstadoAsistenciaChange(a.id, 'Ausente')}
                              className="w-4 h-4 accent-red-600 cursor-pointer" 
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input 
                              type="radio" 
                              name={`asistencia-${a.id}`} 
                              checked={a.estado === 'Tardanza'} 
                              onChange={() => handleEstadoAsistenciaChange(a.id, 'Tardanza')}
                              className="w-4 h-4 accent-amber-600 cursor-pointer" 
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vista 4: Perfil */}
          {activeTab === 'perfil' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-slate-800">Mis Datos</h1>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 max-w-xl">
                <p><strong>Nombre:</strong> {usuario?.nombre || 'Preceptor'}</p>
                <p><strong>Cargo:</strong> Preceptor</p>
                <p><strong>Cursos Asignados:</strong> {misCursos.join(', ')}</p>
                <p><strong>Total de Alumnos Administrados:</strong> {alumnosDeMisCursos.length}</p>

                <button
                  type="button"
                  onClick={() => setConfigurandoCursos(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
                >
                  Cambiar Mis Cursos a Cargo
                </button>
              </div>
            </div>
          )}

          {/* Vista 5: Sanciones */}
          {activeTab === 'sanciones' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Registro de Sanciones</h1>
                <p className="text-slate-500 text-sm">Aplica sanciones a alumnos de tus divisiones a cargo</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2">Registrar Nueva Sanción</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Seleccionar Alumno</label>
                    <select 
                      value={sancionAlumnoId}
                      onChange={(e) => setSancionAlumnoId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Buscar estudiante...</option>
                      {alumnosDeMisCursos.map(a => (
                        <option key={a.id} value={a.id}>{a.nombre} ({a.curso} - Turno {a.turno})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo de Sanción</label>
                    <select
                      value={sancionTipo}
                      onChange={(e) => setSancionTipo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Apercibimiento">Apercibimiento</option>
                      <option value="Amonestación">Amonestación</option>
                      <option value="Suspensión">Suspensión</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Fecha</label>
                    <input 
                      type="date"
                      value={sancionFecha}
                      onChange={(e) => setSancionFecha(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Motivo / Detalle</label>
                  <textarea
                    rows={3}
                    value={sancionMotivo}
                    onChange={(e) => setSancionMotivo(e.target.value)}
                    placeholder="Describí el motivo de la sanción..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleGuardarSancion}
                    disabled={guardando}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    {guardando ? <Loader2 className="animate-spin" size={16} /> : <AlertTriangle size={16} />}
                    Aplicar Sanción
                  </button>
                </div>
              </div>

              {/* Historial de Sanciones */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 font-semibold text-slate-800 text-sm">
                  Historial Reciente de Sanciones
                </div>
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                    <tr>
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Alumno</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historialSanciones.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400 text-xs">
                          No hay sanciones registradas aún.
                        </td>
                      </tr>
                    ) : (
                      historialSanciones.map((s, idx) => (
                        <tr key={s.id || idx} className="hover:bg-slate-50">
                          <td className="p-4 text-xs text-slate-500">{s.fecha}</td>
                          <td className="p-4 font-medium text-slate-800">{s.alumno_nombre || s.alumno_id}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">
                              {s.tipo}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600">{s.motivo}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}