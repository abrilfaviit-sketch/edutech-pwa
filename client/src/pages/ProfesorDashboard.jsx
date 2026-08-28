import { useState } from 'react';
import jsPDF from 'jspdf';

export default function ProfesorDashboard({ usuario, onLogout, alumnos = [], setAlumnos }) {
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  // MATERIAS ASIGNADAS PREVIAMENTE POR EL DIRECTIVO (Con avance de programa)
  const [misMaterias, setMisMaterias] = useState([
    { 
      id: 1, 
      nombre: 'Programación I', 
      curso: '5° A', 
      turno: 'Mañana', 
      dias: ['Lunes', 'Miércoles'], 
      horario: '07:30 - 09:30',
      porcentajeProgreso: 65, // % del programa cubierto en el cuatrimestre
      unidadesTotales: 6,
      unidadesCompletadas: 4
    },
    { 
      id: 2, 
      nombre: 'Bases de Datos', 
      curso: '5° B', 
      turno: 'Tarde', 
      dias: ['Martes', 'Jueves'], 
      horario: '13:30 - 15:30',
      porcentajeProgreso: 40, // % del programa cubierto en el cuatrimestre
      unidadesTotales: 5,
      unidadesCompletadas: 2
    }
  ]);

  // ESTADO DEL PANEL PRINCIPAL
  const [diaSeleccionado, setDiaSeleccionado] = useState('Lunes');
  const materiasDelDia = misMaterias.filter(m => m.dias.includes(diaSeleccionado));
  
  // Garantiza que siempre haya una materia seleccionada por defecto si existe alguna
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(misMaterias[0] || null);

  const [activeTab, setActiveTab] = useState('inicio');
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
    if (!materiaSeleccionada) return estadoOriginal || 'Presente';
    return asistenciaPorMateria[materiaSeleccionada.id]?.[alumnoId] || estadoOriginal || 'Presente';
  };

  const handleAsistenciaChange = (alumnoId, estado) => {
    if (!materiaSeleccionada) return;
    setAsistenciaPorMateria(prev => ({
      ...prev,
      [materiaSeleccionada.id]: {
        ...(prev[materiaSeleccionada.id] || {}),
        [alumnoId]: estado
      }
    }));
  };

  const handleDescargarAsistencia = () => {
    if (!materiaSeleccionada) return;
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

  // MESAS DE EXAMEN
  const [mesasExamen, setMesasExamen] = useState([
    {
      id: 1,
      materiaId: 1,
      materiaNombre: 'Programación I',
      curso: '5° A',
      tipo: 'Regular', // Regular, Previa, Libre
      estadoInscripcion: 'Abierta',
      fecha: '2026-07-15',
      hora: '09:00',
      aula: 'Aula 101',
      inscriptos: [
        { id: 101, nombre: 'Gómez, Lucas', dni: '44.123.456', condicion: 'Regular' },
        { id: 102, nombre: 'Martínez, Sofia', dni: '43.876.543', condicion: 'Regular' }
      ]
    },
    {
      id: 2,
      materiaId: 2,
      materiaNombre: 'Bases de Datos',
      curso: '5° B',
      tipo: 'Previa',
      estadoInscripcion: 'Abierta',
      fecha: '2026-07-18',
      hora: '14:00',
      aula: 'Laboratorio 2',
      inscriptos: [
        { id: 103, nombre: 'Fernández, Mateo', dni: '42.998.112', condicion: 'Previa' }
      ]
    }
  ]);

  const [modalMesa, setModalMesa] = useState({ abierto: false, modo: 'crear', datos: null });
  const [modalInscriptos, setModalInscriptos] = useState({ abierto: false, mesa: null });

  const [formMesa, setFormMesa] = useState({
    materiaId: misMaterias[0]?.id || 1,
    tipo: 'Regular',
    fecha: '',
    hora: '',
    aula: '',
    estadoInscripcion: 'Abierta'
  });

  const handleAbrirModalCrear = () => {
    setFormMesa({
      materiaId: materiaSeleccionada ? materiaSeleccionada.id : (misMaterias[0]?.id || 1),
      tipo: 'Regular',
      fecha: '',
      hora: '',
      aula: '',
      estadoInscripcion: 'Abierta'
    });
    setModalMesa({ abierto: true, modo: 'crear', datos: null });
  };

  const handleAbrirModalEditar = (mesa) => {
    setFormMesa({
      materiaId: mesa.materiaId,
      tipo: mesa.tipo,
      fecha: mesa.fecha,
      hora: mesa.hora,
      aula: mesa.aula,
      estadoInscripcion: mesa.estadoInscripcion
    });
    setModalMesa({ abierto: true, modo: 'editar', datos: mesa });
  };

  const handleGuardarMesa = (e) => {
    e.preventDefault();
    const mat = misMaterias.find(m => m.id === parseInt(formMesa.materiaId));

    if (modalMesa.modo === 'crear') {
      const nuevaMesa = {
        id: Date.now(),
        materiaId: mat.id,
        materiaNombre: mat.nombre,
        curso: mat.curso,
        tipo: formMesa.tipo,
        estadoInscripcion: formMesa.estadoInscripcion,
        fecha: formMesa.fecha,
        hora: formMesa.hora,
        aula: formMesa.aula,
        inscriptos: []
      };
      setMesasExamen(prev => [nuevaMesa, ...prev]);
      mostrarNotificacion('¡Mesa de examen creada exitosamente!');
    } else {
      setMesasExamen(prev => prev.map(m => {
        if (m.id === modalMesa.datos.id) {
          return {
            ...m,
            materiaId: mat.id,
            materiaNombre: mat.nombre,
            curso: mat.curso,
            tipo: formMesa.tipo,
            estadoInscripcion: formMesa.estadoInscripcion,
            fecha: formMesa.fecha,
            hora: formMesa.hora,
            aula: formMesa.aula
          };
        }
        return m;
      }));
      mostrarNotificacion('¡Mesa de examen actualizada!');
    }

    setModalMesa({ abierto: false, modo: 'crear', datos: null });
  };

  // TAREAS Y TRABAJOS
  const [nuevaTarea, setNuevaTarea] = useState({ titulo: '', fechaEntrega: '', consigna: '', archivo: null });
  const [tareasPorMateria, setTareasPorMateria] = useState({
    1: [
      {
        id: 101,
        titulo: 'TP N° 1: Algoritmos y Diagramas de Flujo',
        fechaEntrega: '2026-08-25',
        consigna: 'Resolver los ejercicios 1 al 5 del cuadernillo. Adjuntar diagrama en PDF o imagen legible.',
        archivoNombre: 'Guia_Ejercicios_TP1.pdf',
        entregadosCount: 3,
        corregidosCount: 2
      }
    ]
  });
  
  const tareasActuales = materiaSeleccionada ? (tareasPorMateria[materiaSeleccionada.id] || []) : [];

  const totalAlumnosMateria = alumnosActuales.length || 1;
  const totalTareasCount = tareasActuales.length;
  const totalEntregadosCount = tareasActuales.reduce((acc, t) => acc + (t.entregadosCount || 0), 0);
  const totalCorregidosCount = tareasActuales.reduce((acc, t) => acc + (t.corregidosCount || 0), 0);
  const totalPosiblesEntregas = totalTareasCount * totalAlumnosMateria;
  const totalPendientesCount = Math.max(0, totalPosiblesEntregas - totalEntregadosCount);
  const porcentajeCumplimiento = totalPosiblesEntregas > 0 ? Math.round((totalEntregadosCount / totalPosiblesEntregas) * 100) : 0;

  // ALERTAS ACADÉMICAS
  const [alertasAcademicas] = useState([
    {
      id: 1,
      tipo: 'inasistencia',
      nivel: 'critico',
      titulo: 'Inasistencias Críticas',
      descripcion: 'El alumno Fernández, Mateo (5° B) alcanzó 5 inasistencias consecutivas.',
      materia: 'Bases de Datos',
      fecha: 'Hoy'
    },
    {
      id: 2,
      tipo: 'entrega',
      nivel: 'advertencia',
      titulo: 'Entregas Fuera de Término',
      descripcion: '3 alumnos entregaron el TP N° 1 después de la fecha límite establecida.',
      materia: 'Programación I',
      fecha: 'Ayer'
    },
    {
      id: 3,
      tipo: 'examen',
      nivel: 'info',
      titulo: 'Próxima Mesa de Examen',
      descripcion: 'Mesa de Regularización de Programación I programada en 5 días (Aula 101).',
      materia: 'Programación I',
      fecha: 'En 5 días'
    }
  ]);

  const handlePublicarTarea = (e) => {
    e.preventDefault();
    if (!materiaSeleccionada) return;
    if (!nuevaTarea.titulo || !nuevaTarea.consigna) {
      alert('Por favor, completá el título y la consigna.');
      return;
    }

    const tareaPublicada = {
      id: Date.now(),
      titulo: nuevaTarea.titulo,
      fechaEntrega: nuevaTarea.fechaEntrega || 'Sin fecha límite',
      consigna: nuevaTarea.consigna,
      archivoNombre: nuevaTarea.archivo ? nuevaTarea.archivo.name : null,
      entregadosCount: 0,
      corregidosCount: 0
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
    if (!materiaSeleccionada) return;

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

  const handleDescargarPlanificacionPDF = (plan) => {
    if (!materiaSeleccionada) return;
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

  const handleTabChange = (tab) => {
    if (!materiaSeleccionada && misMaterias.length > 0) {
      setMateriaSeleccionada(misMaterias[0]);
    }
    setActiveTab(tab);
  };

  // Promedio General de Avance entre todas las materias
  const avancePromedioGeneral = Math.round(
    misMaterias.reduce((acc, m) => acc + m.porcentajeProgreso, 0) / (misMaterias.length || 1)
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col notranslate" translate="no">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-slate-800 font-semibold text-sm">
            Rol: <strong className="text-indigo-600">Docente</strong>
          </span>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-lg border font-medium">
            Profe: {usuario?.nombre || 'Carlos Mendoza'}
          </span>
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
                    value={materiaSeleccionada?.id || ''}
                    onChange={(e) => {
                      const m = misMaterias.find(item => item.id === parseInt(e.target.value));
                      setMateriaSeleccionada(m || null);
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
                  onClick={() => setActiveTab('inicio')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'inicio' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
                >
                  🏠 Inicio
                </button>
                <button
                  onClick={() => setActiveTab('misDatos')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'misDatos' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
                >
                  👤 Mis Datos
                </button>
                <button
                  onClick={() => handleTabChange('notas')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'notas' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
                >
                  📝 Calificaciones
                </button>
                <button
                  onClick={() => handleTabChange('asistencia')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'asistencia' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
                >
                  📅 Asistencia
                </button>
                <button
                  onClick={() => handleTabChange('tareas')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'tareas' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
                >
                  📚 Tareas y Trabajos
                </button>
                <button
                  onClick={() => handleTabChange('planificacion')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'planificacion' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
                >
                  📌 Planificación Docente
                </button>
                <button
                  onClick={() => setActiveTab('mesasExamen')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'mesasExamen' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
                >
                  🎓 Mesas de Examen
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

          {activeTab === 'inicio' ? (
            /* PESTAÑA: INICIO */
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h1 className="text-2xl font-bold text-slate-800">Bienvenido</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hola, <strong className="text-slate-700">{usuario?.nombre || 'Carlos Mendoza'}</strong> - Panel Docente
                </p>
              </div>

              <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-sm space-y-1">
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">Escuela Técnica</span>
                <h2 className="text-xl font-bold">Escuela Técnica N° 12 "Ing. José B. González"</h2>
                <p className="text-xs text-indigo-200">Av. del Libertador 8250, Buenos Aires</p>
              </div>

              {/* Tarjetas de Métricas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Mis Materias</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{misMaterias.length}</p>
                  </div>
                  <span className="text-2xl p-3 bg-indigo-50 text-indigo-600 rounded-xl">📚</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Trabajos Entregados</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">185</p>
                  </div>
                  <span className="text-2xl p-3 bg-emerald-50 text-emerald-600 rounded-xl">📩</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Trabajos Pendientes</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">55</p>
                  </div>
                  <span className="text-2xl p-3 bg-amber-50 text-amber-600 rounded-xl">⏳</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Mesas Activas</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{mesasExamen.length}</p>
                  </div>
                  <span className="text-2xl p-3 bg-indigo-50 text-indigo-600 rounded-xl">🎓</span>
                </div>
              </div>

              {/* ÚLTIMO ARREGLO: GRÁFICO DE PROGRESO DE PLANIFICACIÓN */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      📊 Progreso de Planificación Académica
                    </h3>
                    <p className="text-xs text-slate-500">Porcentaje del programa de estudio cubierto durante el cuatrimestre</p>
                  </div>
                  <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-100 text-xs font-bold">
                    <span>Avance General:</span>
                    <span className="text-sm text-indigo-800">{avancePromedioGeneral}%</span>
                  </div>
                </div>

                {/* Listado de Progreso por Materia */}
                <div className="space-y-4">
                  {misMaterias.map(materia => (
                    <div key={materia.id} className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 text-sm">{materia.nombre}</span>
                          <span className="text-slate-500 block">
                            Curso: <strong>{materia.curso}</strong> • Unidades: <strong>{materia.unidadesCompletadas} de {materia.unidadesTotales} dictadas</strong>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-indigo-600">{materia.porcentajeProgreso}%</span>
                          <span className="text-[10px] text-slate-400 block font-medium">Cubierto</span>
                        </div>
                      </div>

                      {/* Barra de Progreso */}
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            materia.porcentajeProgreso >= 60 
                              ? 'bg-gradient-to-r from-indigo-500 to-emerald-500' 
                              : materia.porcentajeProgreso >= 40 
                              ? 'bg-gradient-to-r from-amber-400 to-indigo-500' 
                              : 'bg-gradient-to-r from-rose-400 to-amber-400'
                          }`}
                          style={{ width: `${materia.porcentajeProgreso}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleTabChange('planificacion')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
                  >
                    <span>Gestionar temas y planificaciones →</span>
                  </button>
                </div>
              </div>

              {/* TARJETA DE ALERTAS ACADÉMICAS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      ⚠️ Alertas Académicas
                    </h3>
                    <p className="text-xs text-slate-500">Notificaciones prioritarias sobre ausentismo, entregas y exámenes</p>
                  </div>
                  <span className="text-xs bg-rose-50 text-rose-700 font-bold px-3 py-1 rounded-full border border-rose-200">
                    {alertasAcademicas.length} Avisos
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {alertasAcademicas.map(alerta => {
                    const esCritico = alerta.nivel === 'critico';
                    const esAdvertencia = alerta.nivel === 'advertencia';

                    return (
                      <div
                        key={alerta.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 transition ${
                          esCritico
                            ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                            : esAdvertencia
                            ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                            : 'bg-indigo-50/50 border-indigo-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              esCritico
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : esAdvertencia
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                            }`}>
                              {alerta.materia}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{alerta.fecha}</span>
                          </div>

                          <h4 className="font-bold text-slate-800 text-xs mt-1">{alerta.titulo}</h4>
                          <p className="text-[11px] text-slate-600 leading-snug">{alerta.descripcion}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (alerta.tipo === 'inasistencia') handleTabChange('asistencia');
                              else if (alerta.tipo === 'entrega') handleTabChange('tareas');
                              else setActiveTab('mesasExamen');
                            }}
                            className={`text-[11px] font-bold hover:underline ${
                              esCritico ? 'text-rose-700' : esAdvertencia ? 'text-amber-700' : 'text-indigo-700'
                            }`}
                          >
                            Ver detalle →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PRÓXIMAS ENTREGAS A CORREGIR */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      📋 Próximas Entregas a Corregir
                    </h3>
                    <p className="text-xs text-slate-500">Trabajos prácticos con revisiones pendientes por curso</p>
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-full border border-amber-200">
                    55 Pendientes
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-xs">TP N° 3: Consultas Avanzadas SQL</span>
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100">
                          Programación I - 5° A
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>📩 <strong>18/25</strong> alumnos entregaron</span>
                        <span>📅 Límite: <strong>12 Oct, 23:59 hs</strong></span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleTabChange('tareas')}
                      className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition"
                    >
                      Revisar Entregas
                    </button>
                  </div>

                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-xs">TP N° 2: Diseños de Modelos Relacionales</span>
                        <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md border border-purple-100">
                          Bases de Datos - 5° B
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>📩 <strong>37/40</strong> alumnos entregaron</span>
                        <span>📅 Límite: <strong>15 Oct, 18:00 hs</strong></span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleTabChange('tareas')}
                      className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition"
                    >
                      Revisar Entregas
                    </button>
                  </div>
                </div>
              </div>

              {/* ACCESOS RÁPIDOS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-base">⚡ Accesos Rápidos</h3>
                  <p className="text-xs text-slate-500">Accedé directamente a las tareas operativas más habituales</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => handleTabChange('notas')}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition text-left group flex flex-col justify-between space-y-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition">
                        📝
                      </span>
                      <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition">
                        Ir →
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Cargar Notas</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Cargar o editar notas de evaluaciones</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange('tareas')}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition text-left group flex flex-col justify-between space-y-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition">
                        📚
                      </span>
                      <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition">
                        Ir →
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Crear Nueva Tarea</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Subir TP y consignas de trabajos</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => mostrarNotificacion('Función para publicar avisos seleccionada.')}
                    className="p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition text-left group flex flex-col justify-between space-y-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition">
                        📢
                      </span>
                      <span className="text-xs font-bold text-amber-600 group-hover:translate-x-1 transition">
                        Ir →
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Publicar Anuncio / Aviso</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Enviar novedades al alumnado</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'misDatos' ? (
            /* PESTAÑA: MIS DATOS */
            <div className="space-y-6">
              <div className="border-b pb-3">
                <h1 className="text-2xl font-bold text-slate-800">Perfil Docente</h1>
                <p className="text-xs text-slate-500 mt-1">Información personal y profesional vinculada a la institución.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
                    <span className="text-indigo-600 text-lg">👤</span>
                    <h2>Datos Personales</h2>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Nombre completo</span>
                      <span className="text-slate-800 font-bold">{usuario?.nombre || 'Carlos Mendoza'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">DNI</span>
                      <span className="text-slate-800 font-bold">12.345.678</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Email</span>
                      <span className="text-slate-800 font-bold">{usuario?.email || 'c.mendoza@et12.edu.ar'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500 font-medium">Teléfono</span>
                      <span className="text-slate-800 font-bold">+54 11 2345-6789</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
                    <span className="text-indigo-600 text-lg">🎓</span>
                    <h2>Datos Profesionales</h2>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Título</span>
                      <span className="text-slate-800 font-bold">Ing. en Sistemas</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Especialización</span>
                      <span className="text-slate-800 font-bold">Programación</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Materias asignadas</span>
                      <span className="text-slate-800 font-bold">{misMaterias.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500 font-medium">Escuela</span>
                      <span className="text-slate-800 font-bold text-right">Escuela Técnica N° 12 "Ing. José B. González"</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'mesasExamen' ? (
            /* PESTAÑA: MESAS DE EXAMEN */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Mesas de Examen</h1>
                  <p className="text-xs text-slate-500 mt-0.5">Gestión de turnos de examen y listas de inscriptos.</p>
                </div>
                <button
                  onClick={handleAbrirModalCrear}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <span>+</span> Crear Mesa de Examen
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-medium">Tipos de Mesa:</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Regular</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Previa</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Libre</span>
              </div>

              <div className="space-y-3">
                {mesasExamen.map(mesa => (
                  <div key={mesa.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:border-slate-300 transition">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-800">{mesa.materiaNombre}</h3>
                        <span className="text-[11px] text-slate-500 font-medium">({mesa.curso})</span>
                        
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          mesa.tipo === 'Regular'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : mesa.tipo === 'Previa'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {mesa.tipo}
                        </span>

                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          mesa.estadoInscripcion === 'Abierta'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          Inscripción {mesa.estadoInscripcion}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">📅 {mesa.fecha || 'Sin fecha'}</span>
                        <span className="flex items-center gap-1">🕒 {mesa.hora || 'Sin hora'}</span>
                        <span className="flex items-center gap-1">📍 {mesa.aula || 'Sin aula'}</span>
                        <span className="flex items-center gap-1 text-slate-700 font-bold">👥 {mesa.inscriptos.length} inscriptos</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModalInscriptos({ abierto: true, mesa })}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        Ver Inscriptos
                      </button>
                      <button
                        onClick={() => handleAbrirModalEditar(mesa)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition border border-slate-200"
                      >
                        ✏️ Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* MODAL CREAR / EDITAR MESA */}
              {modalMesa.abierto && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5 animate-fadeIn">
                    <div className="flex justify-between items-center border-b pb-3">
                      <h2 className="text-base font-bold text-slate-800">
                        {modalMesa.modo === 'crear' ? 'Crear Mesa de Examen' : 'Editar Mesa de Examen'}
                      </h2>
                      <button onClick={() => setModalMesa({ abierto: false, modo: 'crear', datos: null })} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
                    </div>

                    <form onSubmit={handleGuardarMesa} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Materia *</label>
                        <select
                          value={formMesa.materiaId}
                          onChange={(e) => setFormMesa({ ...formMesa, materiaId: e.target.value })}
                          className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium text-slate-800"
                        >
                          {misMaterias.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre} - {m.curso}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-600 mb-1">Tipo de Mesa *</label>
                          <select
                            value={formMesa.tipo}
                            onChange={(e) => setFormMesa({ ...formMesa, tipo: e.target.value })}
                            className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium text-slate-800"
                          >
                            <option value="Regular">Regular</option>
                            <option value="Previa">Previa</option>
                            <option value="Libre">Libre</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-600 mb-1">Estado Inscripción *</label>
                          <select
                            value={formMesa.estadoInscripcion}
                            onChange={(e) => setFormMesa({ ...formMesa, estadoInscripcion: e.target.value })}
                            className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium text-slate-800"
                          >
                            <option value="Abierta">Abierta</option>
                            <option value="Cerrada">Cerrada</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-600 mb-1">Fecha *</label>
                          <input
                            type="date"
                            value={formMesa.fecha}
                            onChange={(e) => setFormMesa({ ...formMesa, fecha: e.target.value })}
                            className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium text-slate-800"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-600 mb-1">Hora *</label>
                          <input
                            type="time"
                            value={formMesa.hora}
                            onChange={(e) => setFormMesa({ ...formMesa, hora: e.target.value })}
                            className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium text-slate-800"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Aula / Ubicación *</label>
                        <input
                          type="text"
                          placeholder="Ej: Aula 101 o Laboratorio 2"
                          value={formMesa.aula}
                          onChange={(e) => setFormMesa({ ...formMesa, aula: e.target.value })}
                          className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium text-slate-800"
                          required
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t">
                        <button
                          type="button"
                          onClick={() => setModalMesa({ abierto: false, modo: 'crear', datos: null })}
                          className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700"
                        >
                          Guardar Mesa
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL VER INSCRIPTOS */}
              {modalInscriptos.abierto && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b pb-3">
                      <div>
                        <h2 className="text-base font-bold text-slate-800">Inscriptos en Mesa de Examen</h2>
                        <p className="text-xs text-slate-500">
                          {modalInscriptos.mesa?.materiaNombre} ({modalInscriptos.mesa?.curso}) - {modalInscriptos.mesa?.tipo}
                        </p>
                      </div>
                      <button onClick={() => setModalInscriptos({ abierto: false, mesa: null })} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
                    </div>

                    <div className="max-h-60 overflow-y-auto divide-y text-xs">
                      {modalInscriptos.mesa?.inscriptos.length > 0 ? (
                        modalInscriptos.mesa.inscriptos.map(i => (
                          <div key={i.id} className="py-2.5 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-800">{i.nombre}</p>
                              <p className="text-[11px] text-slate-400">DNI: {i.dni}</p>
                            </div>
                            <span className="px-2.5 py-1 bg-slate-100 border text-slate-600 rounded-lg text-[10px] font-bold">
                              {i.condicion}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="py-6 text-center text-slate-400">Aún no hay alumnos inscriptos en esta mesa.</p>
                      )}
                    </div>

                    <div className="flex justify-end border-t pt-3">
                      <button
                        onClick={() => setModalInscriptos({ abierto: false, mesa: null })}
                        className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : materiaSeleccionada ? (
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

              {/* PESTAÑA: CALIFICACIONES */}
              {activeTab === 'notas' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                    <select value={trimestre} onChange={(e) => setTrimestre(e.target.value)} className="px-3 py-1.5 border rounded-lg text-xs bg-slate-50 font-medium">
                      <option value="1° Trimestre">1° Trimestre</option>
                      <option value="2° Trimestre">2° Trimestre</option>
                      <option value="3° Trimestre">3° Trimestre</option>
                    </select>
                    <button onClick={() => mostrarNotificacion('¡Planilla de notas guardada correctamente!')} className="px-5 py-2 bg-emerald-600 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-emerald-700">
                       Guardar Planilla
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

              {/* PESTAÑA: ASISTENCIA */}
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
                           Guardar y Cerrar
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

              {/* PESTAÑA: TAREAS Y TRABAJOS */}
              {activeTab === 'tareas' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase">Entregados</p>
                        <p className="text-xl font-bold text-emerald-600 mt-1">{totalEntregadosCount}</p>
                      </div>
                      <span className="text-2xl p-2 bg-emerald-50 text-emerald-600 rounded-lg"></span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase">Pendientes</p>
                        <p className="text-xl font-bold text-rose-500 mt-1">{totalPendientesCount}</p>
                      </div>
                      <span className="text-2xl p-2 bg-rose-50 text-rose-500 rounded-lg"></span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase">Corregidos</p>
                        <p className="text-xl font-bold text-amber-600 mt-1">{totalCorregidosCount}</p>
                      </div>
                      <span className="text-2xl p-2 bg-amber-50 text-amber-600 rounded-lg"></span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase">Cumplimiento</p>
                        <p className="text-xl font-bold text-indigo-600 mt-1">{porcentajeCumplimiento}%</p>
                      </div>
                      <span className="text-2xl p-2 bg-indigo-50 text-indigo-600 rounded-lg"></span>
                    </div>
                  </div>

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
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Adjuntar archivo o consigna (opcional):</label>
                      <input
                        id="archivoTareaInput"
                        type="file"
                        onChange={(e) => setNuevaTarea({ ...nuevaTarea, archivo: e.target.files[0] })}
                        className="block w-full text-xs text-slate-500
                          file:mr-4 file:py-2.5 file:px-4
                          file:rounded-xl file:border-0
                          file:text-xs file:font-bold
                          file:bg-indigo-50 file:text-indigo-600
                          hover:file:bg-indigo-100 hover:file:text-indigo-700
                          file:cursor-pointer cursor-pointer transition-all"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition">
                         Publicar Actividad
                      </button>
                    </div>
                  </form>

                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-800">Tareas Publicadas ({tareasActuales.length})</h3>
                    {tareasActuales.length > 0 ? (
                      tareasActuales.map(t => {
                        const entregados = t.entregadosCount || 0;
                        const corregidos = t.corregidosCount || 0;
                        const pendientes = Math.max(0, totalAlumnosMateria - entregados);

                        return (
                          <div key={t.id} className="bg-white p-5 rounded-xl border shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-slate-800">{t.titulo}</h4>
                              <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                                Entrega: {t.fechaEntrega}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">{t.consigna}</p>
                            {t.archivoNombre && <span className="text-xs font-semibold text-indigo-600 block">📄 Adjunto: {t.archivoNombre}</span>}

                            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-medium">
                              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">Entregaron: <strong>{entregados}/{totalAlumnosMateria}</strong></span>
                              <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md">Pendientes: <strong>{pendientes}</strong></span>
                              <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">Corregidos: <strong>{corregidos}</strong></span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-white p-8 rounded-xl border text-center text-slate-400">
                        <p className="text-xs">Aún no se han publicado trabajos prácticos para esta materia.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PESTAÑA: PLANIFICACIÓN DOCENTE */}
              {activeTab === 'planificacion' && (
                <div className="space-y-8">
                  {/* Avance particular de la materia en pantalla */}
                  <div className="bg-white p-6 rounded-xl border shadow-sm space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 text-sm">Avance Actual de la Cátedra</span>
                      <span className="font-extrabold text-indigo-600 text-base">{materiaSeleccionada.porcentajeProgreso}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${materiaSeleccionada.porcentajeProgreso}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Unidades pedagógicas completadas: <strong>{materiaSeleccionada.unidadesCompletadas}</strong> de <strong>{materiaSeleccionada.unidadesTotales}</strong>
                    </p>
                  </div>

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
                         Guardar Planificación
                      </button>
                    </div>
                  </form>

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
              <span className="text-4xl">📘</span>
              <h2 className="text-xl font-bold text-slate-800">Por favor, seleccioná una materia del menú lateral</h2>
              <p className="text-xs text-slate-500">O elegí un día de la semana con clases asignadas para continuar.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}