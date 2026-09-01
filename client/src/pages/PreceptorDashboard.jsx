import { useState } from 'react';

export default function PreceptorDashboard({ usuario, onLogout, alumnos = [], setAlumnos, todosLosCursos = [] }) {
  // Cursos asignados por defecto al preceptor
  const [misCursos, setMisCursos] = useState(['5° A', '5° B', '5° C']);
  const [configurandoCursos, setConfigurandoCursos] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('Todos');
  const [turnoFilter, setTurnoFilter] = useState('Todos');
  const [cursoAsistencia, setCursoAsistencia] = useState('5° A');

  // Estados para sanciones
  const [sancionAlumnoId, setSancionAlumnoId] = useState('');
  const [sancionTipo, setSancionTipo] = useState('Apercibimiento');
  const [sancionFecha, setSancionFecha] = useState(new Date().toISOString().split('T')[0]);
  const [sancionMotivo, setSancionMotivo] = useState('');

  // Historial dinámico de sanciones
  const [historialSanciones, setHistorialSanciones] = useState([
    { id: 1, alumno: 'Felipe Castro', curso: '5° A', turno: 'Mañana', tipo: 'Amonestación (2)', motivo: 'Uso indebido del celular en hora de clase.', fecha: '12/08/2026' },
    { id: 2, alumno: 'Joaquín Diaz', curso: '5° B', turno: 'Tarde', tipo: 'Apercibimiento', motivo: 'Llegada tarde reiterada sin justificación.', fecha: '10/08/2026' }
  ]);

  // Alternar selección de un curso
  const toggleCurso = (curso) => {
    if (misCursos.includes(curso)) {
      setMisCursos(misCursos.filter(c => c !== curso));
    } else {
      setMisCursos([...misCursos, curso]);
    }
  };

  // Alumnos filtrados únicamente por los cursos a cargo del preceptor
  const alumnosDeMisCursos = alumnos.filter(a => misCursos.includes(a.curso));

  // Alumnos filtrados con barra de búsqueda, división y turno
  const alumnosFiltrados = alumnosDeMisCursos.filter(alumno => {
    const coincideBusqueda = alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             alumno.dni.toString().includes(searchTerm);
    const coincideDivision = divisionFilter === 'Todos' || alumno.curso === divisionFilter;
    const coincideTurno = turnoFilter === 'Todos' || alumno.turno === turnoFilter;
    return coincideBusqueda && coincideDivision && coincideTurno;
  });

  // Cambiar el estado de asistencia en tiempo real de un alumno
  const handleEstadoAsistenciaChange = (alumnoId, nuevoEstado) => {
    if (!setAlumnos) return;
    setAlumnos(prev =>
      prev.map(a => (a.id.toString() === alumnoId.toString() ? { ...a, estado: nuevoEstado } : a))
    );
  };

  const handleGuardarSancion = () => {
    if (!sancionAlumnoId || !sancionMotivo.trim()) {
      alert('Por favor seleccioná un alumno e ingresá el motivo.');
      return;
    }

    const alumnoEncontrado = alumnos.find(a => a.id.toString() === sancionAlumnoId.toString());
    const [year, month, day] = sancionFecha.split('-');

    const nuevaSancion = {
      id: Date.now(),
      alumno: alumnoEncontrado ? alumnoEncontrado.nombre : 'Alumno no encontrado',
      curso: alumnoEncontrado ? alumnoEncontrado.curso : '-',
      turno: alumnoEncontrado ? alumnoEncontrado.turno : '-',
      tipo: sancionTipo,
      motivo: sancionMotivo,
      fecha: `${day}/${month}/${year}`
    };

    setHistorialSanciones([nuevaSancion, ...historialSanciones]);
    alert('¡Sanción registrada con éxito!');
    setSancionAlumnoId('');
    setSancionMotivo('');
  };

  // Pantalla / Modal de config de cursos
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
                  className={`py-2 px-3 rounded-xl font-semibold text-xs border transition flex justify-between items-center ${
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow transition"
            >
              Confirmar y Continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Superior */}
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-slate-800 font-semibold text-sm">
            Rol: <strong className="text-blue-600">Preceptor</strong>
          </span>
          <button
            onClick={() => setConfigurandoCursos(true)}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border font-medium transition"
          >
            ⚙️ Mis Cursos ({misCursos.length})
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
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
                >
                  Panel
                </button>
                <button
                  onClick={() => setActiveTab('perfil')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'perfil' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
                >
                  Mis Datos
                </button>
              </nav>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gestión Preceptoría</p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('alumnos')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'alumnos' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
                >
                  Mis Cursos
                </button>
                <button
                  onClick={() => setActiveTab('asistencia')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'asistencia' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
                >
                  Toma de Asistencia
                </button>
                <button
                  onClick={() => setActiveTab('sanciones')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'sanciones' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
                >
                  Sanciones
                </button>
              </nav>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition mt-6"
          >
            Cerrar Sesión
          </button>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Vista 1: dashboard*/}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Panel del Preceptor</h1>
                <p className="text-slate-500 text-sm">
                  Cursos a cargo: {misCursos.length > 0 ? misCursos.join(', ') : 'Ninguno asignado'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Total Alumnos A Cargo</span>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{alumnosDeMisCursos.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm border-l-4 border-l-emerald-500">
                  <span className="text-xs text-slate-500 font-medium">Presentes Hoy</span>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {alumnosDeMisCursos.filter(a => a.estado === 'Presente').length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm border-l-4 border-l-red-500">
                  <span className="text-xs text-slate-500 font-medium">Ausentes Hoy</span>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {alumnosDeMisCursos.filter(a => a.estado === 'Ausente').length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm border-l-4 border-l-amber-500">
                  <span className="text-xs text-slate-500 font-medium">Tardanzas Hoy</span>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {alumnosDeMisCursos.filter(a => a.estado === 'Tardanza').length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Vista 2: mis cursos/alumnos*/}
          {activeTab === 'alumnos' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Mis Cursos y Alumnos</h1>
                <p className="text-slate-500 text-sm">Listado de alumnos de tus divisiones asignadas ({alumnosFiltrados.length} mostrados)</p>
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
                <input
                  type="text"
                  placeholder="Buscar por Nombre o DNI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Turno:</span>
                  {['Todos', 'Mañana', 'Tarde'].map(turno => (
                    <button
                      key={turno}
                      onClick={() => setTurnoFilter(turno)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${turnoFilter === turno ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {turno}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setDivisionFilter('Todos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${divisionFilter === 'Todos' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Todos
                  </button>
                  {misCursos.map(div => (
                    <button
                      key={div}
                      onClick={() => setDivisionFilter(div)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${divisionFilter === div ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {div}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b text-xs uppercase font-semibold text-slate-500">
                    <tr>
                      <th className="p-4">Alumno</th>
                      <th className="p-4">DNI</th>
                      <th className="p-4">Curso</th>
                      <th className="p-4">Turno</th>
                      <th className="p-4">Estado Hoy</th>
                      <th className="p-4">Inasistencias</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
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
                            {a.estado}
                          </span>
                        </td>
                        <td className="p-4">{a.inasistencias}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vista 3: asistencia*/}
          {activeTab === 'asistencia' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Toma de Asistencia Diaria</h1>
                <p className="text-slate-500 text-sm">Seleccioná uno de tus cursos asignados</p>
              </div>

              <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Curso / División</label>
                    <select 
                      value={cursoAsistencia}
                      onChange={(e) => setCursoAsistencia(e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="px-3 py-2 border rounded-lg text-sm bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => alert('¡Asistencia guardada correctamente!')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition"
                >
                  Guardar Asistencia
                </button>
              </div>

              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b text-xs uppercase font-semibold text-slate-500">
                    <tr>
                      <th className="p-4">Alumno</th>
                      <th className="p-4">Turno</th>
                      <th className="p-4 text-center">Presente</th>
                      <th className="p-4 text-center">Ausente</th>
                      <th className="p-4 text-center">Tardanza</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
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
                              checked={a.estado === 'Presente'} 
                              onChange={() => handleEstadoAsistenciaChange(a.id, 'Presente')}
                              className="w-4 h-4 accent-emerald-600" 
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input 
                              type="radio" 
                              name={`asistencia-${a.id}`} 
                              checked={a.estado === 'Ausente'} 
                              onChange={() => handleEstadoAsistenciaChange(a.id, 'Ausente')}
                              className="w-4 h-4 accent-red-600" 
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input 
                              type="radio" 
                              name={`asistencia-${a.id}`} 
                              checked={a.estado === 'Tardanza'} 
                              onChange={() => handleEstadoAsistenciaChange(a.id, 'Tardanza')}
                              className="w-4 h-4 accent-amber-600" 
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vista 4: perfil*/}
          {activeTab === 'perfil' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-slate-800">Mis Datos</h1>
              <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <p><strong>Nombre:</strong> {usuario?.nombre || 'Andrea Cardozo'}</p>
                <p><strong>Cargo:</strong> Preceptor</p>
                <p><strong>Cursos Asignados:</strong> {misCursos.join(', ')}</p>
                <p><strong>Total de Alumnos Administrados:</strong> {alumnosDeMisCursos.length}</p>

                <button
                  onClick={() => setConfigurandoCursos(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition"
                >
                  Cambiar Mis Cursos a Cargo
                </button>
              </div>
            </div>
          )}

          {/* Vista 5: sanciones*/}
          {activeTab === 'sanciones' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Registro de Sanciones</h1>
                <p className="text-slate-500 text-sm">Aplica sanciones a alumnos de tus divisiones a cargo</p>
              </div>

              <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <h2 className="text-base font-semibold text-slate-800 border-b pb-2">Registrar Nueva Sanción</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Seleccionar Alumno</label>
                    <select 
                      value={sancionAlumnoId}
                      onChange={(e) => setSancionAlumnoId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Apercibimiento">Apercibimiento Escrito</option>
                      <option value="Amonestación (1)">Amonestación (1)</option>
                      <option value="Amonestación (2)">Amonestación (2)</option>
                      <option value="Llamado de Atención">Llamado de Atención</option>
                      <option value="Acta de Convivencia">Acta de Convivencia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Fecha</label>
                    <input 
                      type="date" 
                      value={sancionFecha}
                      onChange={(e) => setSancionFecha(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Motivo / Observación</label>
                  <textarea 
                    rows="2"
                    value={sancionMotivo}
                    onChange={(e) => setSancionMotivo(e.target.value)}
                    placeholder="Detalle del incidente..."
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={handleGuardarSancion}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg shadow-sm transition"
                  >
                    Guardar Sanción
                  </button>
                </div>
              </div>

              {/* Historial */}
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-700">Historial de Sanciones Recientes</h3>
                  <span className="text-xs font-medium text-slate-500">Total: {historialSanciones.length}</span>
                </div>
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b text-xs uppercase font-semibold text-slate-500">
                    <tr>
                      <th className="p-4">Alumno</th>
                      <th className="p-4">Curso</th>
                      <th className="p-4">Turno</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Motivo</th>
                      <th className="p-4">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {historialSanciones.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-4 font-medium text-slate-800">{item.alumno}</td>
                        <td className="p-4">{item.curso}</td>
                        <td className="p-4">{item.turno}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.tipo.includes('Amonestación') ? 'bg-red-100 text-red-800' :
                            item.tipo.includes('Apercibimiento') ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.tipo}
                          </span>
                        </td>
                        <td className="p-4">{item.motivo}</td>
                        <td className="p-4">{item.fecha}</td>
                      </tr>
                    ))}
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