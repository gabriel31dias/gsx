import React, { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Users, 
  BookOpen, 
  DollarSign, 
  Percent, 
  UserMinus, 
  UserCheck, 
  Sparkles,
  TrendingUp,
  X,
  FileCode2,
  ListOrdered,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { Course, CourseProgress, UserProfile, UserRole } from '../types';

export const AdminPanel: React.FC = () => {
  const { 
    courses, 
    allUsers, 
    progressList, 
    addCourse, 
    updateCourse, 
    deleteCourse, 
    toggleBlockUser,
    addActivityLog 
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<'metrics' | 'courses' | 'users'>('metrics');
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form Fields for new/edited course
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formInst, setFormInst] = useState('');
  const [formDur, setFormDur] = useState('20h');
  const [formCat, setFormCat] = useState('Frontend');
  const [formCover, setFormCover] = useState('https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80');

  // Metrics Calculations
  const totalStudents = allUsers.length;
  const totalCourses = courses.length;
  const totalRevenue = allUsers.filter(u => u.membershipPlan !== 'Nenhum' && u.membershipStatus === 'active').length * 49.90;
  
  // average completion rate estimation
  let completionPercentage = 0;
  if (courses.length > 0) {
    let totalLessonsCount = 0;
    courses.forEach(c => c.modules.forEach(m => totalLessonsCount += m.lessons.length));
    
    let completedLessonsCount = 0;
    progressList.forEach(p => completedLessonsCount += p.completedLessons.length);

    completionPercentage = totalLessonsCount > 0 ? Math.round((completedLessonsCount / (progressList.length * totalLessonsCount || 1)) * 100) : 0;
  }

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formInst.trim()) {
      alert("Título e Instrutor são mandatórios!");
      return;
    }

    const uniqueId = `course-${Date.now()}`;
    const newCourseObj: Course = {
      id: uniqueId,
      title: formTitle,
      description: formDesc,
      instructor: formInst,
      instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      duration: formDur,
      category: formCat,
      coverImage: formCover,
      rating: 5.0,
      isTrending: false,
      isPopular: false,
      modules: [
        {
          id: `mod-${Date.now()}-1`,
          title: 'Módulo 1: Primeiros Passos Essenciais',
          lessons: [
            {
              id: `les-${Date.now()}-1`,
              title: '1. Boas-vindas e Visão Geral da Turma',
              duration: '08:45',
              videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              description: 'Entenda os objetivos de aprendizado, a metodologia de ensino e como configurar sua máquina para acompanhar todas as atividades práticas hands-on.',
              materials: [],
              comments: []
            }
          ],
          quiz: {
            id: `quiz-${Date.now()}-1`,
            title: 'Questionário Inicial de Alinhamento de Expectativas',
            minScoreToPass: 100,
            questions: [
              {
                id: `q-${Date.now()}-1`,
                question: 'Qual é o principal foco deste treinamento de especialização?',
                options: [
                  'Formar profissionais aptos para o mercado corporativo altamente escalável',
                  'Ensino de técnicas puramente teóricas sem nenhum tipo de prática',
                  'Simulação simples que não exige codar nenhuma linha'
                ],
                correctOptionIndex: 0
              }
            ]
          }
        }
      ]
    };

    addCourse(newCourseObj);
    alert("Pronto! Novo curso publicado com sucesso e equipado com as primeiras lições!");
    resetForm();
    setShowAddCourseModal(false);
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDesc('');
    setFormInst('');
    setFormDur('20h');
    setFormCat('Frontend');
    setFormCover('https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80');
    setEditingCourse(null);
  };

  const handleEditClick = (course: Course) => {
    setEditingCourse(course);
    setFormTitle(course.title);
    setFormDesc(course.description);
    setFormInst(course.instructor);
    setFormDur(course.duration);
    setFormCat(course.category);
    setFormCover(course.coverImage);
    setShowAddCourseModal(true);
  };

  const handleUpdateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const updated: Course = {
      ...editingCourse,
      title: formTitle,
      description: formDesc,
      instructor: formInst,
      duration: formDur,
      category: formCat,
      coverImage: formCover
    };

    updateCourse(updated);
    alert("Curso atualizado com absoluto sucesso!");
    resetForm();
    setShowAddCourseModal(false);
  };

  return (
    <div className="bg-[#09090b] min-h-screen text-white max-w-7xl mx-auto px-4 lg:px-10 py-8 space-y-8 pb-20">
      
      {/* Title Segment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <span className="text-[10px] bg-purple-600/10 text-purple-400 font-extrabold px-2.5 py-1 rounded-md border border-purple-500/20 uppercase tracking-widest block w-fit mb-1">
            Módulo Administrativo
          </span>
          <h2 className="text-2xl font-black text-gray-100">Painel do Professor & Diretor</h2>
        </div>

        <button
          onClick={() => { resetForm(); setShowAddCourseModal(true); }}
          className="bg-red-600 hover:bg-red-700 hover:scale-103 transition text-xs font-bold text-white px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo Curso
        </button>
      </div>

      {/* Sub menu Navigation bar tabs */}
      <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none max-w-full border-b border-gray-850 p-1 bg-[#121215] rounded-xl self-start w-full sm:w-auto">
        {[
          { id: 'metrics', label: 'Métricas e Relatórios', icon: TrendingUp },
          { id: 'courses', label: `Gerir Cursos (${totalCourses})`, icon: BookOpen },
          { id: 'users', label: `Lista de Alunos (${totalStudents})`, icon: Users }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`shrink-0 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === t.id 
                ? 'bg-purple-600 text-white shadow shadow-purple-600/30' 
                : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TABS BODY RENDERS */}

      {/* TAB A: Reporting KPI Metrics */}
      {activeTab === 'metrics' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Dashboard Summary Row Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-[#121215] border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3.5 bg-blue-500/10 rounded-2xl text-blue-400 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Total Alunos</span>
                <span className="text-xl font-black text-white font-mono mt-0.5 block">{totalStudents}</span>
              </div>
            </div>

            <div className="bg-[#121215] border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3.5 bg-purple-500/10 rounded-2xl text-purple-400 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Total Cursos</span>
                <span className="text-xl font-black text-white font-mono mt-0.5 block">{totalCourses}</span>
              </div>
            </div>

            <div className="bg-[#121215] border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3.5 bg-yellow-500/10 rounded-2xl text-yellow-400 shrink-0">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Taxa Conclusão</span>
                <span className="text-xl font-black text-white font-mono mt-0.5 block">{completionPercentage}%</span>
              </div>
            </div>

            <div className="bg-[#121215] border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-400 shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Receita Total de Vendas</span>
                <span className="text-xl font-black text-white font-mono mt-0.5 block">R$ {totalRevenue.toFixed(2)}</span>
              </div>
            </div>

          </div>

          {/* Interactive HTML Custom Bar Chart and analytical layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Visual Chart 1: Visual bar chart of Popularity */}
            <div className="bg-[#121215] border border-gray-800/80 p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-center border-b border-gray-850 pb-3">
                <h3 className="font-extrabold text-sm text-gray-200">Cursos Mais Assistidos (Acessos)</h3>
                <span className="text-[10px] text-gray-500 uppercase font-mono">Semanal</span>
              </div>

              <div className="space-y-4 pt-2">
                {courses.map((c, i) => {
                  const percentWidth = [92, 75, 45, 12][i % 4] || 30;
                  return (
                    <div key={c.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-300">{c.title}</span>
                        <span className="text-gray-500 font-mono">{percentWidth * 3} visualizações</span>
                      </div>
                      <div className="w-full bg-black/60 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-red-600 via-purple-600 to-[#E50914] h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual Chart 2: Student growth and signups */}
            <div className="bg-[#121215] border border-gray-800/80 p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-center border-b border-gray-850 pb-3">
                <h3 className="font-extrabold text-sm text-gray-200">Novos Usuários por Período</h3>
                <span className="text-[10px] text-red-400 font-mono font-bold">Crescente</span>
              </div>
              
              <div className="h-52 flex items-end justify-between pt-6 px-4">
                {[
                  { month: 'Janeiro', count: 120 },
                  { month: 'Fevereiro', count: 210 },
                  { month: 'Março', count: 320 },
                  { month: 'Abril', count: 480 },
                  { month: 'Maio', count: 680 },
                ].map((item, index) => {
                  const maxVal = 680;
                  const ratio = (item.count / maxVal) * 100;
                  return (
                    <div key={index} className="flex flex-col items-center gap-2 group cursor-pointer w-12 text-center">
                      <div className="text-[10px] text-purple-400 opacity-0 group-hover:opacity-100 font-mono transition font-bold">
                        +{item.count}
                      </div>
                      <div 
                        className="w-7 bg-purple-600/35 hover:bg-purple-500 rounded-lg group-hover:scale-105 transition-all w-8 shadow"
                        style={{ height: `${ratio * 1.2}px` }}
                      />
                      <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap mt-1">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB B: Courses management CRUD list Table */}
      {activeTab === 'courses' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[#121215] border border-gray-800/80 rounded-3xl overflow-hidden p-6">
            <h3 className="font-extrabold text-sm text-gray-200 mb-4 pb-2 border-b border-gray-850">Diretório Escolar de Turmas Públicas</h3>
            
            <div className="space-y-3.5">
              {courses.map(course => {
                // total lesson items inside this class
                const totalLi = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
                return (
                  <div key={course.id} className="p-4 bg-black/30 border border-gray-850 hover:border-gray-700 transition rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img 
                        referrerPolicy="no-referrer"
                        src={course.coverImage} 
                        alt={course.title} 
                        className="w-20 h-12 object-cover rounded-xl"
                      />
                      <div>
                        <h4 className="font-semibold text-sm text-gray-200 line-clamp-1">{course.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Professor {course.instructor} • {course.duration} de carga horária • {totalLi} aulas criadas</p>
                      </div>
                    </div>

                    <div className="flex gap-2 self-end sm:self-auto select-none">
                      <button 
                        onClick={() => handleEditClick(course)}
                        className="p-2 bg-white/5 hover:bg-purple-900/20 text-gray-400 hover:text-purple-400 rounded-xl border border-gray-800 hover:border-purple-900 transition flex items-center gap-1 cursor-pointer text-xs font-bold"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Editar
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Tem certeza absoluta que deseja excluir o curso "${course.title}"?`)) {
                            deleteCourse(course.id);
                          }
                        }}
                        className="p-2 bg-white/5 hover:bg-red-950/20 text-gray-400 hover:text-red-500 rounded-xl border border-gray-800 hover:border-red-950/80 transition flex items-center gap-1 cursor-pointer text-xs font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remover
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* TAB C: Students controller database */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[#121215] border border-gray-800/80 rounded-3xl overflow-hidden p-6">
            <h3 className="font-extrabold text-sm text-gray-200 mb-4 pb-2 border-b border-gray-850">Cadastro e Progresso de Usuários</h3>
            
            <div className="space-y-3.5">
              {allUsers.map(u => {
                // calculate completed modules per user
                const progMatch = progressList.find(p => p.courseId !== ''); // mock query
                return (
                  <div key={u.id} className="p-4 bg-black/30 border border-gray-850 hover:border-gray-700 transition rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img 
                        referrerPolicy="no-referrer"
                        src={u.avatar} 
                        alt={u.name} 
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-gray-200">{u.name}</p>
                          <span className={`${u.role === UserRole.ADMIN ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'} border border-transparent text-[8px] px-1.5 py-0.2 rounded font-bold uppercase`}>
                            {u.role === UserRole.ADMIN ? 'Admin' : 'Estudante'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-none mt-1">{u.email} • Plano {u.membershipPlan} • Pontuação: {u.points} XP</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="text-right text-[11px] text-gray-400 hidden sm:block">
                        <p>Status: {u.blocked ? <strong className="text-red-500">Bloqueado</strong> : <strong className="text-emerald-500">Ativo</strong>}</p>
                      </div>

                      <button
                        onClick={() => toggleBlockUser(u.id)}
                        className={`p-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer ${
                          u.blocked
                          ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white'
                          : 'bg-red-650/10 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white'
                        }`}
                      >
                        {u.blocked ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Desbloquear</span>
                          </>
                        ) : (
                          <>
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>Bloquear</span>
                          </>
                        )}
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* CREATE / EDIT COURSE MODAL */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121215] border border-gray-800 rounded-3xl max-w-lg w-full p-6 space-y-5 text-white shadow-2xl relative animate-scaleIn">
            <button 
              onClick={() => setShowAddCourseModal(false)}
              className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {editingCourse ? 'Modificar Registro do Curso' : 'Criar Novo Curso do Zero'}
            </h3>

            <p className="text-xs text-gray-500">
              {editingCourse ? 'Modifique os metadados. O currículo de módulos existentes será inteiramente preservado.' : 'Iremos inicializar um curso equipado com o primeiro módulo estrutural pronto para edição posterior.'}
            </p>

            <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 block font-semibold">Nome da Turma / Curso</label>
                <input 
                  type="text"
                  className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Introdução ao React de Performance"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 block font-semibold">Instrutor Responsável</label>
                <input 
                  type="text"
                  className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  value={formInst}
                  onChange={(e) => setFormInst(e.target.value)}
                  placeholder="Ex: Marina Coutinho"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-semibold">Carga Horária (Estimada)</label>
                  <input 
                    type="text"
                    className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    value={formDur}
                    onChange={(e) => setFormDur(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-semibold">Categoria Principal</label>
                  <select 
                    className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    value={formCat}
                    onChange={(e) => setFormCat(e.target.value)}
                  >
                    <option value="Frontend">Frontend (React, Vue)</option>
                    <option value="Backend">Backend (Node, DB)</option>
                    <option value="Design">UI/UX Design Premium</option>
                    <option value="Data & AI">Data Science & AI</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 block font-semibold">Capa do Curso (URL da Imagem)</label>
                <input 
                  type="url"
                  className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  value={formCover}
                  onChange={(e) => setFormCover(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 block font-semibold">Sinopse da Turma / Descrição</label>
                <textarea 
                  className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none h-20"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Explique os tópicos chaves abordados no decorrer de toda a ementa de estudos"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 py-3 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                {editingCourse ? 'Confirmar Modificação' : 'Publicar Turma Oficial'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
