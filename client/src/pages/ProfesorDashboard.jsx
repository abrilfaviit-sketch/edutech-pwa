import React, { useState } from 'react';
import jsPDF from 'jspdf';

export default function ProfesorDashboard({ usuario, onLogout, alumnos = [], setAlumnos }) {
  const [configuracionCompletada, setConfiguracionCompletada] = useState(false);
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  // CONFIGURACIÓN INICIAL DE MATERIAS Y HORARIOS
  const [misMaterias, setMisMaterias] = useState([
    { id: 1, nombre: 'Programación I', curso: '5° A', turno: 'Mañana', dias: ['Lunes', 'Miércoles'], horario: '07:30 - 09:30' },
    { id: 2, nombre: 'Bases de Datos', curso: '5° B', turno: 'Tarde', dias: ['Martes', 'Jueves'], horario: '13:30 - 15:30' }
  ]);

  const [nuevaMateria, setNuevaMateria] = useState({
    nombre: '',
    curso: '1° A',
    turno: 'Mañana',
    dias: [],
    horarioDesde: '07:30',
    horarioHasta: '09:30'
  });

  const handleToggleDia = (dia) => {
    setNuevaMateria(prev => {
      const yaExiste = prev.dias.includes(dia);
      return {
        ...prev,
        dias: yaExiste ? prev.dias.filter(d => d !== dia) : [...prev.dias, dia]
      };
    });
  };

  const handleAgregarMateria = (e) => {
    e.preventDefault();
    if (!nuevaMateria.nombre || !nuevaMateria.curso || nuevaMateria.dias.length === 0) {
      alert('Por favor, ingresá el nombre de la materia, el curso y al menos un día.');
      return;
    }

    const materiaCreada = {
      id: Date.now(),
      nombre: nuevaMateria.nombre,
      curso: nuevaMateria.curso,
      turno: nuevaMateria.turno,
      dias: nuevaMateria.dias,
      horario: `${nuevaMateria.horarioDesde} - ${nuevaMateria.horarioHasta}`
    };

    setMisMaterias(prev => [...prev, materiaCreada]);
    setNuevaMateria({
      nombre: '',
      curso: '1° A',
      turno: 'Mañana',
      dias: [],
      horarioDesde: '07:30',
      horarioHasta: '09:30'
    });
  };

  const handleEliminarMateria = (id) => {
    setMisMaterias(prev => prev.filter(m => m.id !== id));
  };

  // ESTADO DEL PANEL PRINCIPAL
  const [diaSeleccionado, setDiaSeleccionado] = useState('Lunes');
  const materiasDelDia = misMaterias.filter(m => m.dias.includes(diaSeleccionado));
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(misMaterias[0] || null);

  const [activeTab, setActiveTab] = useState('notas');
  const [trimestre, setTrimestre] = useState('1° Trimestre');
  const [mensajeExito, setMensajeExito] = useState('');

  const [mostrarTomaAsistencia, setMostrarTomaAsistencia] = useState(false);

  // ALUMNOS FILTRADOS SEGÚN LA MATERIA/CURSO
  const alumnosActuales = materiaSeleccionada 
    ? alumnos.filter(a => a.curso === materiaSeleccionada.curso)
    : [];

  // ASISTENCIA
  const [asistenciaPorMateria, setAsistenciaPorMateria] = useState({});

  const getEstadoAsistencia = (alumnoId, estadoOriginal) => {
    return asistenciaPorMateria[materiaSeleccionada?.id]?.[alumnoId] || estadoOriginal || 'Presente';
  };

  const handleAsistenciaChange = (alumnoId, estado) => {
    setAsistenciaPorMateria(prev => ({
      ...prev,
      [materiaSeleccionada.id]: {
        ...(prev[materiaSeleccionada.id] || {}),
        [alumnoId]: estado
      }
    }));
  };

  const handleDescargarAsistencia = () => {
    const fecha = new Date().toLocaleDateString();
    let contenido = `REGISTRO DE ASISTENCIA\n`;
    contenido += `Materia: ${materiaSeleccionada.nombre}\n`;
    contenido += `Curso: ${materiaSeleccionada.curso} - Turno: ${materiaSeleccionada.turno}\n`;
    contenido += `Fecha: ${fecha}\n`;
    contenido += `-------------------------------------------\n\n`;

    alumnosActuales.forEach(a => {
      const estado = getEstadoAsistencia(a.id, a.estado);
      contenido += `- ${a.nombre} (DNI: ${a.dni}): [${estado.toUpperCase()}]\n`;
    });

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Asistencia_${materiaSeleccionada.nombre}_${materiaSeleccionada.curso}_${fecha.replace(/\//g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // TAREAS Y TRABAJOS
  const [nuevaTarea, setNuevaTarea] = useState({ titulo: '', fechaEntrega: '', consigna: '', archivo: null });
  const [tareasPorMateria, setTareasPorMateria] = useState({});
  const tareasActuales = materiaSeleccionada ? (tareasPorMateria[materiaSeleccionada.id] || []) : [];

  const handlePublicarTarea = (e) => {
    e.preventDefault();
    if (!nuevaTarea.titulo || !nuevaTarea.consigna) {
      alert('Por favor, completá el título y la consigna.');
      return;
    }

    const tareaPublicada = {
      id: Date.now(),
      titulo: nuevaTarea.titulo,
      fechaEntrega: nuevaTarea.fechaEntrega || 'Sin fecha límite',
      consigna: nuevaTarea.consigna,
      archivoNombre: nuevaTarea.archivo ? nuevaTarea.archivo.name : null
    };

    setTareasPorMateria(prev => ({
      ...prev,
      [materiaSeleccionada.id]: [tareaPublicada, ...(prev[materiaSeleccionada.id] || [])]
    }));

    setNuevaTarea({ titulo: '', fechaEntrega: '', consigna: '', archivo: null });
    const fileInput = document.getElementById('archivoTareaInput');
    if (fileInput) fileInput.value = '';

    mostrarNotificacion('¡Actividad publicada con éxito!');
  };

  // PLANIFICACIONES DOCENTES
  const [planificacionesPorMateria, setPlanificacionesPorMateria] = useState({
    1: [
      { id: 101, periodo: 'Plan Anual 2026', descripcion: 'Ejes temáticos y contenidos mínimos para Programación I.', archivoNombre: 'Planificacion_Prog1_2026.pdf', fechaSubida: '10/03/2026', estado: 'Aprobado' }
    ]
  });

  const [nuevaPlanificacion, setNuevaPlanificacion] = useState({
    periodo: 'Plan Anual 2026',
    descripcion: '',
    archivo: null
  });

  const planificacionesActuales = materiaSeleccionada ? (planificacionesPorMateria[materiaSeleccionada.id] || []) : [];

  const handleSubirPlanificacion = (e) => {
    e.preventDefault();

    const planSubido = {
      id: Date.now(),
      periodo: nuevaPlanificacion.periodo,
      descripcion: nuevaPlanificacion.descripcion || 'Sin observaciones.',
      archivoNombre: nuevaPlanificacion.archivo ? nuevaPlanificacion.archivo.name : 'Documento_Planificacion.pdf',
      fechaSubida: new Date().toLocaleDateString(),
      estado: 'En Revisión'
    };

    setPlanificacionesPorMateria(prev => ({
      ...prev,
      [materiaSeleccionada.id]: [planSubido, ...(prev[materiaSeleccionada.id] || [])]
    }));

    setNuevaPlanificacion({ periodo: 'Plan Anual 2026', descripcion: '', archivo: null });
    const fileInput = document.getElementById('archivoPlanificacionInput');
    if (fileInput) fileInput.value = '';

    mostrarNotificacion('¡Planificación registrada con éxito!');
  };

  // DESCARGA DE PDF DE PLANIFICACIÓN
  const handleDescargarPlanificacionPDF = (plan) => {
    const doc = new jsPDF();

    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DOCUMENTO OFICIAL DE PLANIFICACIÓN', 15, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Ciclo Lectivo 2026', 160, 18);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLES DE LA CÁTEDRA', 15, 45);

    doc.setLineWidth(0.5);
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 48, 195, 48);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Docente: ${usuario?.nombre || 'Docente'}`, 15, 58);
    doc.text(`Materia: ${materiaSeleccionada.nombre}`, 15, 66);
    doc.text(`Curso / Turno: ${materiaSeleccionada.curso} (${materiaSeleccionada.turno})`, 15, 74);
    doc.text(`Período / Documento: ${plan.periodo}`, 15, 82);
    doc.text(`Fecha de Presentación: ${plan.fechaSubida}`, 15, 90);
    doc.text(`Estado Administrativo: ${plan.estado}`, 15, 98);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('EJES TEMÁTICOS Y OBSERVACIONES', 15, 115);
    doc.line(15, 118, 195, 118);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const lineasTexto = doc.splitTextToSize(plan.descripcion, 180);
    doc.text(lineasTexto, 15, 128);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('----------------------------------------------------', 130, 250);
    doc.text('Firma y Aprobación Dirección', 132, 256);
    
    doc.text('Generado desde el Panel Académico Docente.', 15, 280);

    doc.save(`Planificacion_${materiaSeleccionada.nombre}_${plan.periodo.replace(/ /g, '_')}.pdf`);
  };

  // ACTUALIZACIÓN DE NOTAS EN EL ESTADO GLOBAL
  const handleNotaChange = (alumnoId, campo, valor) => {
    const num = Math.min(10, Math.max(0, parseFloat(valor) || 0));
    
    setAlumnos(prevAlumnos => {
      return prevAlumnos.map(a => {
        if (a.id === alumnoId) {
          const modificado = { ...a, [campo]: num };
          const e1 = modificado.examen1 || modificado.nota1 || 0;
          const e2 = modificado.examen2 || modificado.nota2 || 0;
          const tp = modificado.tp || modificado.TP || 0;

          const prom = parseFloat(((e1 + e2 + tp) / 3).toFixed(2));
          return { 
            ...modificado, 
            promedio: prom,
            estadoNotas: prom >= 6 ? 'Aprobado' : 'Desaprobado'
          };
        }
        return a;
      });
    });
  };

  const mostrarNotificacion = (texto) => {
    setMensajeExito(texto);
    setTimeout(() => setMensajeExito(''), 3000);
  };

  // VISTA 1: CONFIGURACIÓN DE MATERIAS
  if (!configuracionCompletada) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-100">
        <div className="max-w-3xl w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-8 space-y-6">
          <div className="flex justify-between items-start border-b border-slate-700 pb-4">
            <div>
              <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">Paso de Configuración</span>
              <h1 className="text-2xl font-bold text-white mt-1">Configurá tus Materias y Cursos</h1>
              <p className="text-xs text-slate-400 mt-1">
                Hola <strong>{usuario?.nombre || 'Profesor'}</strong>, seleccioná o agregá las materias y años que dictás.
              </p>
            </div>
            <button onClick={onLogout} className="text-xs text-red-400 hover:underline">
              Cerrar Sesión
            </button>
          </div>

          <form onSubmit={handleAgregarMateria} className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/80 space-y-4">
            <h2 className="text-sm font-bold text-indigo-300">➕ Agregar Materia / Curso</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nombre de la Materia *</label>
                <input
                  type="text"
                  placeholder="Ej: Programación, Historia..."
                  value={nuevaMateria.nombre}
                  onChange={(e) => setNuevaMateria({ ...nuevaMateria, nombre: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Curso / Año *</label>
                <input
                  type="text"
                  placeholder="Ej: 5° A, 2° B"
                  value={nuevaMateria.curso}
                  onChange={(e) => setNuevaMateria({ ...nuevaMateria, curso: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Turno</label>
                <select
                  value={nuevaMateria.turno}
                  onChange={(e) => setNuevaMateria({ ...nuevaMateria, turno: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Mañana">Mañana</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noche">Noche</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-2">Días de Cursada *</label>
                <div className="flex gap-1.5">
                  {diasSemana.map(dia => {
                    const seleccionado = nuevaMateria.dias.includes(dia);
                    return (
                      <button
                        type="button"
                        key={dia}
                        onClick={() => handleToggleDia(dia)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                          seleccionado
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {dia.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={nuevaMateria.horarioDesde}
                    onChange={(e) => setNuevaMateria({ ...nuevaMateria, horarioDesde: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <span className="text-slate-500 pt-5">-</span>
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={nuevaMateria.horarioHasta}
                    onChange={(e) => setNuevaMateria({ ...nuevaMateria, horarioHasta: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition">
                + Añadir Cátedra
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Mis Materias Asignadas ({misMaterias.length})</h3>
            {misMaterias.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {misMaterias.map(m => (
                  <div key={m.id} className="flex justify-between items-center bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <div>
                      <h4 className="font-bold text-white text-sm">{m.nombre} <span className="text-indigo-400 font-normal">({m.curso})</span></h4>
                      <p className="text-[11px] text-slate-400">{m.dias.join(', ')} • {m.horario} • Turno {m.turno}</p>
                    </div>
                    <button onClick={() => handleEliminarMateria(m.id)} className="text-xs text-red-400 hover:text-red-300 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-800/50">
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-400 bg-amber-950/30 p-3 rounded-lg border border-amber-800/40 text-center">
                Agregá al menos una materia para ingresar a tu panel.
              </p>
            )}
          </div>

          <div className="border-t border-slate-700 pt-4 flex justify-end">
            <button
              disabled={misMaterias.length === 0}
              onClick={() => {
                setMateriaSeleccionada(misMaterias[0]);
                setConfiguracionCompletada(true);
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-lg"
            >
               Confirmar y Entrar al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VISTA 2: DASHBOARD PRINCIPAL DEL PROFESOR
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-slate-800 font-semibold text-sm">
            Rol: <strong className="text-indigo-600">Docente</strong>
          </span>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-lg border font-medium">
            Profe: {usuario?.nombre || 'Docente'}
          </span>
          <button onClick={() => setConfiguracionCompletada(false)} className="text-xs text-indigo-600 hover:underline font-medium">
            ⚙ Reconfigurar Materias
          </button>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Ciclo Lectivo 2026</span>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Lateral */}
        <aside className="w-64 bg-slate-900 text-slate-300 p-4 flex flex-col justify-between min-h-[calc(100vh-57px)]">
          <div className="space-y-6">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Día de la Semana</p>
                <div className="grid grid-cols-5 gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                  {diasSemana.map(dia => (
                    <button
                      key={dia}
                      onClick={() => {
                        setDiaSeleccionado(dia);
                        const materiasDia = misMaterias.filter(m => m.dias.includes(dia));
                        if (materiasDia.length > 0) {
                          setMateriaSeleccionada(materiasDia[0]);
                          setMostrarTomaAsistencia(false);
                        }
                      }}
                      className={`py-1 text-[10px] font-bold rounded transition ${
                        diaSeleccionado === dia ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {dia.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Cursos ({diaSeleccionado})</p>
                {materiasDelDia.length > 0 ? (
                  <select
                    value={materiaSeleccionada?.id}
                    onChange={(e) => {
                      const m = misMaterias.find(item => item.id === parseInt(e.target.value));
                      setMateriaSeleccionada(m);
                      setMostrarTomaAsistencia(false);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2.5 font-medium focus:outline-none"
                  >
                    {materiasDelDia.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre} - {m.curso}</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-amber-400">
                    Sin clases los {diaSeleccionado}s.
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gestión Académica</p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('notas')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'notas' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
                >
                  📝 Calificaciones
                </button>
                <button
                  onClick={() => setActiveTab('asistencia')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'asistencia' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
                >
                  📅 Asistencia
                </button>
                <button
                  onClick={() => setActiveTab('tareas')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'tareas' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
                >
                  📚 Tareas y Trabajos
                </button>
                <button
                  onClick={() => setActiveTab('planificacion')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'planificacion' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
                >
                  📌 Planificación Docente
                </button>
              </nav>
            </div>
          </div>

          <button onClick={onLogout} className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition mt-6">
            Cerrar Sesión
          </button>
        </aside>

        {/* ÁREA DE CONTENIDO */}
        <main className="flex-1 p-8 overflow-y-auto relative">
          {mensajeExito && (
            <div className="fixed top-5 right-5 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce z-50">
              <span>✅</span>
              <span className="text-sm font-semibold">{mensajeExito}</span>
            </div>
          )}

          {materiaSeleccionada ? (
            <>
              {/* Banner Encabezado */}
              <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-md mb-6 flex justify-between items-center">
                <div>
                  <span className="text-xs uppercase font-semibold text-indigo-300">{materiaSeleccionada.dias.join(' y ')} • {materiaSeleccionada.horario}</span>
                  <h1 className="text-2xl font-bold">{materiaSeleccionada.nombre}</h1>
                  <p className="text-xs text-indigo-200 mt-1">Curso: <strong>{materiaSeleccionada.curso}</strong> | Turno: <strong>{materiaSeleccionada.turno}</strong></p>
                </div>
                <div className="bg-indigo-800/60 border border-indigo-700 px-4 py-2 rounded-xl text-center">
                  <span className="block text-xs text-indigo-300">Alumnos Inscritos</span>
                  <span className="text-xl font-bold">{alumnosActuales.length}</span>
                </div>
              </div>

              {/* PESTAÑA 1: CALIFICACIONES (RESTAURADA) */}
              {activeTab === 'notas' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                    <select value={trimestre} onChange={(e) => setTrimestre(e.target.value)} className="px-3 py-1.5 border rounded-lg text-xs bg-slate-50 font-medium">
                      <option value="1° Trimestre">1° Trimestre</option>
                      <option value="2° Trimestre">2° Trimestre</option>
                      <option value="3° Trimestre">3° Trimestre</option>
                    </select>
                    <button onClick={() => mostrarNotificacion('¡Planilla de notas guardada correctamente!')} className="px-5 py-2 bg-emerald-600 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-emerald-700">
                      💾 Guardar Planilla
                    </button>
                  </div>

                  <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                        <tr>
                          <th className="p-4">Alumno</th>
                          <th className="p-4">DNI</th>
                          <th className="p-4 text-center">Examen 1</th>
                          <th className="p-4 text-center">Examen 2</th>
                          <th className="p-4 text-center">TP</th>
                          <th className="p-4 text-center">Promedio</th>
                          <th className="p-4 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {alumnosActuales.length > 0 ? (
                          alumnosActuales.map(a => {
                            const e1 = a.examen1 ?? a.nota1 ?? 0;
                            const e2 = a.examen2 ?? a.nota2 ?? 0;
                            const tp = a.tp ?? a.TP ?? 0;

                            return (
                              <tr key={a.id} className="hover:bg-slate-50">
                                <td className="p-4 font-medium text-slate-800">{a.nombre}</td>
                                <td className="p-4 text-xs text-slate-500">{a.dni}</td>
                                <td className="p-4 text-center">
                                  <input type="number" min="1" max="10" value={e1} onChange={(e) => handleNotaChange(a.id, 'examen1', e.target.value)} className="w-14 text-center border rounded py-1 bg-slate-50 text-xs font-semibold" />
                                </td>
                                <td className="p-4 text-center">
                                  <input type="number" min="1" max="10" value={e2} onChange={(e) => handleNotaChange(a.id, 'examen2', e.target.value)} className="w-14 text-center border rounded py-1 bg-slate-50 text-xs font-semibold" />
                                </td>
                                <td className="p-4 text-center">
                                  <input type="number" min="1" max="10" value={tp} onChange={(e) => handleNotaChange(a.id, 'tp', e.target.value)} className="w-14 text-center border rounded py-1 bg-slate-50 text-xs font-semibold" />
                                </td>
                                <td className="p-4 text-center font-bold text-slate-800">{a.promedio}</td>
                                <td className="p-4 text-center">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${a.promedio >= 6 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                    {a.promedio >= 6 ? 'Aprobado' : 'Desaprobado'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="7" className="p-6 text-center text-xs text-slate-400">
                              No se encontraron alumnos inscriptos en el curso <strong>{materiaSeleccionada.curso}</strong>.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/*PESTAÑA 2: ASISTENCIA */}
              
              {activeTab === 'asistencia' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-800">Toma de Asistencia de Clase</h2>
                      <p className="text-xs text-slate-500 mt-1">Materia: <strong>{materiaSeleccionada.nombre} ({materiaSeleccionada.curso})</strong></p>
                    </div>

                    {!mostrarTomaAsistencia ? (
                      <button
                        onClick={() => setMostrarTomaAsistencia(true)}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition transform active:scale-95 flex items-center gap-2"
                      >
                        📋 Tomar Asistencia
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleDescargarAsistencia}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5"
                        >
                          📥 Descargar Registro
                        </button>
                        <button
                          onClick={() => {
                            mostrarNotificacion('¡Asistencia guardada correctamente!');
                            setMostrarTomaAsistencia(false);
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition"
                        >
                          💾 Guardar y Cerrar
                        </button>
                      </div>
                    )}
                  </div>

                  {mostrarTomaAsistencia ? (
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden animate-fadeIn">
                      <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500 font-semibold">
                          <tr>
                            <th className="p-4">Alumno</th>
                            <th className="p-4">DNI</th>
                            <th className="p-4 text-center">Estado de Asistencia</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {alumnosActuales.map(a => {
                            const estado = getEstadoAsistencia(a.id, a.estado);
                            return (
                              <tr key={a.id} className="hover:bg-slate-50">
                                <td className="p-4 font-medium text-slate-800">{a.nombre}</td>
                                <td className="p-4 text-xs text-slate-500">{a.dni}</td>
                                <td className="p-4">
                                  <div className="flex justify-center gap-3">
                                    <button
                                      onClick={() => handleAsistenciaChange(a.id, 'Presente')}
                                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                        estado === 'Presente'
                                          ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                      }`}
                                    >
                                      ✓ Presente
                                    </button>
                                    <button
                                      onClick={() => handleAsistenciaChange(a.id, 'Ausente')}
                                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                        estado === 'Ausente'
                                          ? 'bg-red-600 text-white border-red-600 shadow'
                                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                      }`}
                                    >
                                      ✕ Ausente
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-white p-10 rounded-xl border text-center text-slate-400 space-y-2">
                      <span className="text-3xl block">📋</span>
                      <p className="text-xs">Hacé clic en <strong>"Tomar Asistencia"</strong> para desplegar la lista de alumnos de esta materia.</p>
                    </div>
                  )}
                </div>
              )}

              {/* PESTAÑA 3: TAREAS Y TRABAJOS */}
             
              {activeTab === 'tareas' && (
                <div className="space-y-8">
                  <form onSubmit={handlePublicarTarea} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-slate-800 border-b pb-2">Subir Nuevo Trabajo Práctico</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Título de la Actividad *"
                        value={nuevaTarea.titulo}
                        onChange={(e) => setNuevaTarea({ ...nuevaTarea, titulo: e.target.value })}
                        className="px-3 py-2 border rounded-lg text-sm bg-slate-50"
                        required
                      />
                      <input
                        type="date"
                        value={nuevaTarea.fechaEntrega}
                        onChange={(e) => setNuevaTarea({ ...nuevaTarea, fechaEntrega: e.target.value })}
                        className="px-3 py-2 border rounded-lg text-sm bg-slate-50"
                      />
                    </div>
                    <textarea
                      rows="3"
                      placeholder="Consigna..."
                      value={nuevaTarea.consigna}
                      onChange={(e) => setNuevaTarea({ ...nuevaTarea, consigna: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50"
                      required
                    ></textarea>
                    <input
                      id="archivoTareaInput"
                      type="file"
                      onChange={(e) => setNuevaTarea({ ...nuevaTarea, archivo: e.target.files[0] })}
                      className="text-xs text-slate-500"
                    />
                    <div className="flex justify-end">
                      <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition">
                        📤 Publicar Actividad
                      </button>
                    </div>
                  </form>

                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-800">Tareas Publicadas ({tareasActuales.length})</h3>
                    {tareasActuales.length > 0 ? (
                      tareasActuales.map(t => (
                        <div key={t.id} className="bg-white p-5 rounded-xl border shadow-sm space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-800">{t.titulo}</h4>
                            <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                              Entrega: {t.fechaEntrega}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">{t.consigna}</p>
                          {t.archivoNombre && <span className="text-xs font-semibold text-indigo-600 block">📄 Adjunto: {t.archivoNombre}</span>}
                        </div>
                      ))
                    ) : (
                      <div className="bg-white p-8 rounded-xl border text-center text-slate-400">
                        <p className="text-xs">Aún no se han publicado trabajos prácticos para esta materia.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PESTAÑA 4: PLANIFICACIÓN DOCENTE CON GENERACIÓN DE PDF*/}
              {activeTab === 'planificacion' && (
                <div className="space-y-8">
                  <form onSubmit={handleSubirPlanificacion} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                    <div className="border-b pb-3 flex justify-between items-center">
                      <div>
                        <h2 className="text-base font-bold text-slate-800">Cargar Nueva Planificación</h2>
                        <p className="text-xs text-slate-500">Materia: <strong>{materiaSeleccionada.nombre} ({materiaSeleccionada.curso})</strong></p>
                      </div>
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200 font-semibold">
                        Envío Institucional
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Período / Tipo de Documento *</label>
                        <select
                          value={nuevaPlanificacion.periodo}
                          onChange={(e) => setNuevaPlanificacion({ ...nuevaPlanificacion, periodo: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 text-slate-800 focus:outline-none"
                        >
                          <option value="Plan Anual 2026">Planificación Anual Completa</option>
                          <option value="1° Trimestre">Planificación 1° Trimestre</option>
                          <option value="2° Trimestre">Planificación 2° Trimestre</option>
                          <option value="3° Trimestre">Planificación 3° Trimestre</option>
                          <option value="Proyecto Pedagógico">Proyecto Pedagógico Especial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Adjuntar Archivo (Opcional)</label>
                        <input
                          id="archivoPlanificacionInput"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setNuevaPlanificacion({ ...nuevaPlanificacion, archivo: e.target.files[0] })}
                          className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Ejes Temáticos y Objetivos *</label>
                      <textarea
                        rows="4"
                        placeholder="Escribí los contenidos clave, unidades pedagógicas y metas generales de la cursada..."
                        value={nuevaPlanificacion.descripcion}
                        onChange={(e) => setNuevaPlanificacion({ ...nuevaPlanificacion, descripcion: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 text-slate-800"
                        required
                      ></textarea>
                    </div>

                    <div className="flex justify-end">
                      <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow transition">
                        📌 Guardar Planificación
                      </button>
                    </div>
                  </form>

                  {/* HISTORIAL Y GENERACIÓN DE PDF */}
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-800">Planificaciones Cargadas ({planificacionesActuales.length})</h3>
                    {planificacionesActuales.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {planificacionesActuales.map(p => (
                          <div key={p.id} className="bg-white p-5 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-sm">{p.periodo}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  p.estado === 'Aprobado'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {p.estado === 'Aprobado' ? '✓ Aprobada' : '⏳ En Revisión'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-2">{p.descripcion}</p>
                              <span className="text-[11px] text-slate-400 block">Registrado el: {p.fechaSubida}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDescargarPlanificacionPDF(p)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5"
                              >
                                📄 Descargar PDF
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white p-8 rounded-xl border text-center text-slate-400">
                        <p className="text-xs">Sin planificaciones cargadas para esta materia.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border text-center space-y-3">
              <span className="text-4xl">☕</span>
              <h2 className="text-xl font-bold text-slate-800">Sin clases asignadas este día</h2>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}