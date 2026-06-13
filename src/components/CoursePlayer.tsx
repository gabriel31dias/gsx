import React, { useState, useEffect, useRef } from 'react';
import { usePlatform } from '../context/PlatformContext';
import {
  Play,
  CheckCircle, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Send, 
  Award, 
  ArrowLeft, 
  ArrowRight,
  HelpCircle,
  FileCode2,
  Tv
} from 'lucide-react';
import { CertificateGenerator } from './CertificateGenerator';
import { Lesson, Module } from '../types';

export const CoursePlayer: React.FC = () => {
  const { 
    courses, 
    progressList, 
    activeCourseId, 
    activeLessonId, 
    navigateTo,
    markLessonComplete,
    updateLessonProgress,
    addLessonComment,
    certificates,
    submitQuizAttempt
  } = usePlatform();

  const [expandedModules, setExpandedModules] = useState<{ [id: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'info' | 'material' | 'comments' | 'quiz'>('info');
  const [commentText, setCommentText] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const [showVideoPlayButton, setShowVideoPlayButton] = useState(true);
  const [progressSaveState, setProgressSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [progressSaveError, setProgressSaveError] = useState('');
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [mediaDurationSeconds, setMediaDurationSeconds] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastSavedSecondRef = useRef(-1);

  // Quiz active state
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizOutputMessage, setQuizOutputMessage] = useState<string>('');

  const course = courses.find(c => c.id === activeCourseId);
  const currentProgress = progressList.find(p => p.courseId === activeCourseId);

  // find active lesson
  let activeLesson: Lesson | null = null;
  let activeModule: Module | null = null;

  if (course) {
    for (const mod of course.modules) {
      const match = mod.lessons.find(l => l.id === activeLessonId);
      if (match) {
        activeLesson = match;
        activeModule = mod;
        break;
      }
    }
  }

  // default to first lesson if not selected
  useEffect(() => {
    if (course && !activeLessonId) {
      const firstLes = course.modules[0]?.lessons[0];
      if (firstLes) {
        navigateTo('learning', course.id, firstLes.id);
      }
    }
  }, [course, activeLessonId, navigateTo]);

  // Expand module of active lesson automatically
  useEffect(() => {
    if (activeModule) {
      setExpandedModules(prev => ({ ...prev, [activeModule!.id]: true }));
    }
  }, [activeLessonId]);

  // Reset lesson-specific interactions when navigating.
  useEffect(() => {
    setShowVideoPlayButton(true);
    setProgressSaveState('idle');
    setProgressSaveError('');
    setPlaybackSeconds(
      activeLessonId
        ? currentProgress?.lessonProgress[activeLessonId] ?? activeLesson?.progressSeconds ?? 0
        : 0,
    );
    setMediaDurationSeconds(activeLesson?.durationSeconds ?? 0);
    lastSavedSecondRef.current = -1;
    setSubmittedQuiz(false);
    setSelectedAnswers({});
    setQuizScore(null);
    setQuizOutputMessage('');
  }, [activeLessonId]);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <Tv className="w-16 h-16 text-gray-600 mb-4 animate-pulse" />
        <p className="text-gray-400">Nenhum curso selecionado para reprodução.</p>
        <button 
          onClick={() => navigateTo('home')}
          className="mt-4 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-500 transition cursor-pointer"
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  // Total lessons list helper
  const allLessons: Lesson[] = [];
  course.modules.forEach(m => {
    m.lessons.forEach(l => allLessons.push(l));
  });

  const activeLessonIndex = activeLesson ? allLessons.findIndex(l => l.id === activeLesson.id) : -1;

  const handleNextLesson = () => {
    if (activeLessonIndex < allLessons.length - 1) {
      const nextL = allLessons[activeLessonIndex + 1];
      navigateTo('learning', course.id, nextL.id);
    }
  };

  const handlePrevLesson = () => {
    if (activeLessonIndex > 0) {
      const prevL = allLessons[activeLessonIndex - 1];
      navigateTo('learning', course.id, prevL.id);
    }
  };

  // Progress metrics
  const totalLessonsCount = allLessons.length;
  const completedCount = currentProgress?.completedLessons.length || 0;
  const getLessonProgressPercentage = (lesson: Lesson) => {
    if (currentProgress?.completedLessons.includes(lesson.id)) return 100;

    const watchedSeconds = lesson.id === activeLessonId
      ? playbackSeconds
      : currentProgress?.lessonProgress[lesson.id] ?? lesson.progressSeconds ?? 0;
    const durationSeconds = lesson.id === activeLessonId
      ? mediaDurationSeconds || lesson.durationSeconds || 0
      : lesson.durationSeconds || 0;

    if (durationSeconds <= 0) return watchedSeconds > 0 ? 1 : 0;
    return Math.min(99, Math.round((watchedSeconds / durationSeconds) * 100));
  };
  const progressPercentage = totalLessonsCount > 0
    ? Math.round(allLessons.reduce((total, lesson) => total + getLessonProgressPercentage(lesson), 0) / totalLessonsCount)
    : 0;
  const isCourseFullyCompleted = completedCount >= totalLessonsCount && totalLessonsCount > 0;
  const activeLessonProgress = activeLesson ? getLessonProgressPercentage(activeLesson) : 0;

  const formatPlaybackTime = (seconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeLesson) return;
    addLessonComment(course.id, activeLesson.id, commentText);
    setCommentText('');
  };

  const saveVideoProgress = async (seconds: number, totalSeconds: number) => {
    if (!activeLesson || !course || totalSeconds <= 0) return;

    setProgressSaveState('saving');
    setProgressSaveError('');

    try {
      await updateLessonProgress(course.id, activeLesson.id, seconds, totalSeconds);
      lastSavedSecondRef.current = seconds;
      setProgressSaveState('saved');
    } catch (error) {
      setProgressSaveState('error');
      setProgressSaveError(error instanceof Error ? error.message : 'Não foi possível salvar o progresso.');
    }
  };

  const handleManualCompletion = async () => {
    if (!activeLesson || !course) return;

    setProgressSaveState('saving');
    setProgressSaveError('');

    try {
      await markLessonComplete(course.id, activeLesson.id);
      setProgressSaveState('saved');
    } catch (error) {
      setProgressSaveState('error');
      setProgressSaveError(error instanceof Error ? error.message : 'Não foi possível salvar o status.');
    }
  };

  // Quiz submission validation
  const handleAnswerSelect = (qId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIndex }));
  };

  const handleQuizSubmit = (quiz: any) => {
    const totalQuestions = quiz.questions.length;
    let correct = 0;
    
    quiz.questions.forEach((q: any) => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        correct++;
      }
    });

    const scorePct = Math.round((correct / totalQuestions) * 100);
    const passed = scorePct >= quiz.minScoreToPass;

    setQuizScore(scorePct);
    setSubmittedQuiz(true);
    
    if (passed) {
      setQuizOutputMessage(`Parabéns! Você passou com ${scorePct}%! A nota mínima para liberação de selo oficial era de ${quiz.minScoreToPass}%`);
    } else {
      setQuizOutputMessage(`Infelizmente você não atingiu a nota mínima. Conseguiu ${scorePct}%, mas precisava de ${quiz.minScoreToPass}% para aprovação. tente novamente!`);
    }

    submitQuizAttempt(course.id, quiz.id, quiz.questions.map((q: any) => selectedAnswers[q.id] ?? -1), scorePct, passed);
  };

  return (
    <div className="bg-[#070a13] min-h-screen text-white flex flex-col lg:flex-row pb-12 animate-fadeIn text-left">
      {/* LEFT AREA: Player & interactive tabs */}
      <div className="flex-1 lg:max-w-[72%] p-4 lg:p-8 space-y-6">
        
        {/* Back Link Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1b253b]/50">
          <button 
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
            Voltar para o Painel
          </button>
          
          <span className="text-[10px] text-indigo-305 text-indigo-300 font-mono font-bold tracking-widest uppercase bg-indigo-500/10 px-3 py-1 rounded-md border border-indigo-500/20 shadow-sm">
            {course.category}
          </span>
        </div>

        {activeLesson ? (
          <div className="space-y-4">
            {/* Real media player inside the existing visual frame */}
            <div className="relative aspect-[16/9] w-full bg-[#090d16] rounded-2xl overflow-hidden border border-[#1b253b]/80 shadow-2xl group/player">
              {activeLesson.videoFileUrl ? (
                <>
                  <video
                    ref={videoRef}
                    key={activeLesson.id}
                    className="h-full w-full bg-black object-contain"
                    controls
                    preload="metadata"
                    poster={course.coverImage}
                    onPlay={() => setShowVideoPlayButton(false)}
                    onPause={(event) => {
                      setShowVideoPlayButton(true);
                      const seconds = Math.floor(event.currentTarget.currentTime);
                      const totalSeconds = Math.floor(event.currentTarget.duration || activeLesson!.durationSeconds || 0);
                      if (seconds > 0 && seconds !== lastSavedSecondRef.current) {
                        void saveVideoProgress(seconds, totalSeconds);
                      }
                    }}
                    onLoadedMetadata={(event) => {
                      const savedSeconds = currentProgress?.lessonProgress[activeLesson!.id] ?? activeLesson!.progressSeconds ?? 0;
                      setMediaDurationSeconds(Math.floor(event.currentTarget.duration || activeLesson!.durationSeconds || 0));
                      setPlaybackSeconds(savedSeconds);
                      if (savedSeconds > 0 && savedSeconds < event.currentTarget.duration) {
                        event.currentTarget.currentTime = savedSeconds;
                      }
                    }}
                    onTimeUpdate={(event) => {
                      const seconds = Math.floor(event.currentTarget.currentTime);
                      const totalSeconds = Math.floor(event.currentTarget.duration || activeLesson!.durationSeconds || 0);
                      setPlaybackSeconds(seconds);
                      setMediaDurationSeconds(totalSeconds);
                      if (
                        seconds > 0
                        && totalSeconds > 0
                        && seconds % 10 === 0
                        && seconds !== lastSavedSecondRef.current
                      ) {
                        lastSavedSecondRef.current = seconds;
                        void saveVideoProgress(seconds, totalSeconds);
                      }
                    }}
                    onEnded={(event) => {
                      setShowVideoPlayButton(true);
                      const totalSeconds = Math.floor(event.currentTarget.duration || activeLesson!.durationSeconds || 0);
                      setPlaybackSeconds(totalSeconds);
                      setMediaDurationSeconds(totalSeconds);
                      void saveVideoProgress(totalSeconds, totalSeconds);
                    }}
                  >
                    <source src={activeLesson.videoFileUrl} />
                    Seu navegador não suporta reprodução de vídeo.
                  </video>

                  {showVideoPlayButton && (
                    <button
                      type="button"
                      onClick={() => void videoRef.current?.play()}
                      aria-label="Reproduzir aula"
                      className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-indigo-300/30 bg-indigo-600 text-white shadow-2xl shadow-indigo-950/60 transition hover:scale-110 hover:bg-indigo-500 active:scale-95 md:h-20 md:w-20"
                    >
                      <Play className="h-7 w-7 translate-x-0.5 fill-current md:h-9 md:w-9" />
                    </button>
                  )}
                </>
              ) : activeLesson.videoUrl ? (
                <iframe
                  key={activeLesson.id}
                  src={activeLesson.videoUrl}
                  title={activeLesson.title}
                  className="h-full w-full border-0 bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090d16] overflow-hidden">
                  <img 
                    referrerPolicy="no-referrer"
                    src={course.coverImage} 
                    alt={activeLesson.title} 
                    className="absolute inset-0 w-full h-full object-cover opacity-15 filter blur-[1px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                  
                  <div className="z-10 text-center flex flex-col items-center max-w-lg p-6">
                    <Tv className="h-10 w-10 text-gray-600" />
                    <p className="mt-4 font-bold text-sm md:text-base text-gray-200">{activeLesson.title}</p>
                    <p className="mt-1 text-[11px] text-gray-500">Esta aula ainda não possui vídeo disponível.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#1b253b] bg-[#0e1424] px-4 py-3">
              <div className="mb-2 flex items-center justify-between font-mono text-[10px]">
                <span className="text-gray-400">
                  {formatPlaybackTime(playbackSeconds)} / {formatPlaybackTime(mediaDurationSeconds || activeLesson.durationSeconds || 0)}
                </span>
                <span className="font-bold text-indigo-400">{activeLessonProgress}% assistido</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#090d16]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${activeLessonProgress}%` }}
                />
              </div>
              <div className="mt-2 flex min-h-4 items-center justify-end font-mono text-[9px] uppercase tracking-wider">
                {progressSaveState === 'saving' && <span className="text-indigo-300">Salvando progresso...</span>}
                {progressSaveState === 'saved' && <span className="text-emerald-400">Progresso salvo</span>}
                {progressSaveState === 'error' && <span className="text-red-400">{progressSaveError}</span>}
              </div>
            </div>

            {/* Video Controllers (Próxima / Anterior) */}
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-3 bg-[#0e1424] p-3 rounded-2xl border border-[#1b253b]/80 shadow-md">
              <button 
                onClick={handlePrevLesson}
                disabled={activeLessonIndex <= 0}
                className="col-span-1 flex items-center justify-center gap-2 text-xs font-bold bg-[#121829] hover:bg-[#12182c]/80 text-white disabled:opacity-30 disabled:pointer-events-none px-3 sm:px-4 py-2 border border-[#1b253b] rounded-xl cursor-pointer transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="inline sm:hidden">Anterior</span>
                <span className="hidden sm:inline">Aula Anterior</span>
              </button>

              <button 
                onClick={() => void handleManualCompletion()}
                disabled={progressSaveState === 'saving'}
                className={`col-span-2 order-first sm:order-none w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold px-4 py-2 border rounded-xl transition-all cursor-pointer ${
                  currentProgress?.completedLessons.includes(activeLesson.id)
                  ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400'
                  : 'bg-white text-black border-transparent hover:bg-gray-100'
                }`}
              >
                <CheckCircle className="w-4 h-4 fill-current opacity-80 shrink-0" />
                {currentProgress?.completedLessons.includes(activeLesson.id) ? 'Concluída' : 'Marcar como Assistida'}
              </button>

              <button 
                onClick={handleNextLesson}
                disabled={activeLessonIndex >= allLessons.length - 1}
                className="col-span-1 flex items-center justify-center gap-2 text-xs font-bold bg-[#121829] hover:bg-[#12182c]/80 text-white disabled:opacity-30 disabled:pointer-events-none px-3 sm:px-4 py-2 border border-[#1b253b] rounded-xl cursor-pointer transition-all"
              >
                <span className="inline sm:hidden">Próxima</span>
                <span className="hidden sm:inline">Próxima Aula</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              </button>
            </div>

            {/* Dynamic details section tabs */}
            <div className="space-y-4">
              <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none max-w-full border-b border-[#1b253b]/60 p-1 bg-[#0e1424] rounded-xl self-start w-full sm:w-auto shadow-md">
                {[
                  { id: 'info', label: 'Ementa' },
                  { id: 'material', label: `Materiais (${activeLesson.materials.length})` },
                  { id: 'comments', label: `Dúvidas (${activeLesson.comments.length})` },
                  { id: 'quiz', label: activeModule?.quiz ? 'Teste do Módulo' : 'Sem Teste' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`shrink-0 px-3.5 md:px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === tab.id 
                      ? 'bg-indigo-600 text-white shadow shadow-indigo-650/30' 
                      : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab: Info */}
              {activeTab === 'info' && (
                <div className="bg-[#0e1424] p-6 rounded-2xl border border-[#1b253b]/80 leading-relaxed space-y-4 shadow-md">
                  <h3 className="text-md font-bold text-gray-150 text-gray-200">{activeLesson.title}</h3>
                  <p className="text-xs md:text-sm text-gray-405 text-gray-400 leading-relaxed">{activeLesson.description}</p>
                  
                  {/* Instructor brief panel */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[#1b253b]/50 mt-4">
                    <img 
                      referrerPolicy="no-referrer"
                      src={course.instructorAvatar} 
                      alt={course.instructor} 
                      className="w-10 h-10 rounded-xl object-cover border border-[#1e2a42]"
                    />
                    <div>
                      <p className="text-[10px] text-gray-500 font-mono">INSTRUTOR ACADÊMICO</p>
                      <p className="text-xs font-bold text-gray-200">{course.instructor}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Materials */}
              {activeTab === 'material' && (
                <div className="bg-[#0e1424] p-6 rounded-2xl border border-[#1b253b]/80 space-y-4 shadow-md">
                  <h3 className="text-xs font-bold text-gray-200 mb-2">Conteúdo Complementar Anexo</h3>
                  {activeLesson.materials.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">Esta aula não possui anexos complementares.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeLesson.materials.map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 bg-[#090d16] border border-[#1b253b] rounded-xl hover:border-indigo-505 hover:border-indigo-500/30 transition">
                          <div className="flex items-center gap-3 text-xs">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-450 text-indigo-300 border border-indigo-500/15">
                              <FileCode2 className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-gray-305 text-gray-300 line-clamp-1">{m.title}</span>
                          </div>
                          
                          <button 
                            type="button"
                            onClick={() => alert("Simulação: Download de repositório concluído com sucesso.")}
                            className="p-1.5 hover:bg-[#12192c] rounded-lg text-gray-400 hover:text-white transition cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Comments Fórum */}
              {activeTab === 'comments' && (
                <div className="bg-[#0e1424] p-6 rounded-2xl border border-[#1b253b]/80 space-y-6 shadow-md">
                  {/* Write Comment Form */}
                  <form onSubmit={handlePostComment} className="flex gap-3">
                    <input 
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Tire suas dúvidas ou comente com os professores sobre a aula..."
                      className="flex-1 bg-[#090d16] border border-[#1b253b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button 
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 hover:scale-102 transition text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-indigo-400/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Postar
                    </button>
                  </form>

                  {/* Comment List */}
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                    {activeLesson.comments.length === 0 ? (
                      <p className="text-xs text-gray-500 italic text-center py-4">Nenhum comentário nesta turma ainda. Publique uma dúvida!</p>
                    ) : (
                      activeLesson.comments.map(c => (
                        <div key={c.id} className="p-3.5 bg-[#090d16]/40 rounded-xl border border-[#1b253b] space-y-1 text-left">
                          <div className="flex items-center gap-2 mb-1 justify-between">
                            <div className="flex items-center gap-2">
                              <img 
                                referrerPolicy="no-referrer"
                                src={c.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                                alt={c.userName} 
                                className="w-5.5 h-5.5 rounded-lg object-cover"
                              />
                              <span className="text-xs font-bold text-gray-200">{c.userName}</span>
                            </div>
                            <span className="text-[9px] text-[#818cf8] font-mono">{c.date}</span>
                          </div>
                          <p className="text-xs text-gray-400 pl-8 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Quiz de módulo */}
              {activeTab === 'quiz' && (
                <div className="bg-[#0e1424] p-6 rounded-2xl border border-[#1b253b]/80 space-y-4 shadow-md">
                  {activeModule?.quiz ? (
                    <div className="space-y-6">
                      <div className="border-b border-[#1b253b]/50 pb-3 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-gray-200">{activeModule.quiz.title}</h4>
                          <p className="text-[10px] text-gray-500 mt-1">Este teste avalia o conhecimento consolidado no módulo.</p>
                        </div>
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded font-bold border border-yellow-500/20 font-mono">
                          Min: {activeModule.quiz.minScoreToPass}%
                        </span>
                      </div>

                      {/* Questions list */}
                      <div className="space-y-6">
                        {activeModule.quiz.questions.map((q, qIndex) => (
                          <div key={q.id} className="space-y-3">
                            <span className="text-[9px] text-indigo-400 uppercase tracking-widest font-bold font-mono">Questão {qIndex + 1} de {activeModule.quiz?.questions.length}</span>
                            <p className="text-xs md:text-sm font-bold text-gray-200">{q.question}</p>
                            
                            <div className="grid grid-cols-1 gap-2.5">
                              {q.options.map((opt, optIdx) => {
                                const isSelected = selectedAnswers[q.id] === optIdx;
                                const showCorrect = submittedQuiz && optIdx === q.correctOptionIndex;
                                const showWrong = submittedQuiz && isSelected && optIdx !== q.correctOptionIndex;
                                
                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => !submittedQuiz && handleAnswerSelect(q.id, optIdx)}
                                    disabled={submittedQuiz}
                                    className={`text-left p-3.5 rounded-xl text-xs transition border cursor-pointer ${
                                      showCorrect 
                                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                                      : showWrong
                                      ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                                      : isSelected
                                      ? 'bg-indigo-500/15 border-indigo-550 border-indigo-500 text-white font-semibold'
                                      : 'bg-[#090d16] border-[#1b253b] text-gray-400 hover:border-gray-700'
                                    }`}
                                  >
                                    <span className="mr-2 opacity-85 font-mono">[{String.fromCharCode(65 + optIdx)}]</span> {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {submittedQuiz ? (
                        <div className={`p-4 rounded-xl border ${quizScore! >= activeModule.quiz.minScoreToPass ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'} text-left`}>
                          <p className="font-bold text-xs text-gray-205 flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4 text-gray-400" />
                            Resultado: {quizScore}% {quizScore! >= activeModule.quiz.minScoreToPass ? 'Aprovado! 🎉' : 'Reprovado 😭'}
                          </p>
                          <p className="text-xs text-gray-455 text-gray-400 mt-1 leading-relaxed">{quizOutputMessage}</p>
                          <button 
                            type="button"
                            onClick={() => {
                              setSubmittedQuiz(false);
                              setSelectedAnswers({});
                              setQuizScore(null);
                            }}
                            className="mt-3 text-xs text-[#818cf8] underline font-bold cursor-pointer inline-block"
                          >
                            Refazer Questionário
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuizSubmit(activeModule?.quiz)}
                          disabled={Object.keys(selectedAnswers).length < activeModule.quiz.questions.length}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 border-none font-bold text-xs text-white py-3 rounded-xl disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                        >
                          Enviar Respostas do Teste
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic text-center py-4">Este módulo não possui questionários de múltipla escolha.</p>
                  )}
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 italic text-sm">Estrutura de aulas vazia ou buscando...</div>
        )}

      </div>

      {/* RIGHT SIDEBAR: Alura Course Syllabus Index, progress tracker */}
      <div className="w-full lg:w-[28%] bg-[#090d16] border-t lg:border-t-0 lg:border-l border-[#1b253b]/70 p-4 lg:p-6 space-y-6">
        
        {/* Course Card Summary */}
        <div className="space-y-3 text-left">
          <h3 className="font-extrabold text-[15px] text-gray-100 uppercase tracking-tight line-clamp-1">{course.title}</h3>
          <p className="text-[11px] text-gray-500">Turma preparada por {course.instructor}</p>

          {/* Module progress card */}
          <div className="bg-[#0e1424] p-4 rounded-xl border border-[#1b253b]/80 shadow shadow-indigo-500/5">
            <div className="flex border-b border-[#1b253b]/60 pb-3 mb-3 items-center justify-between text-[11px] font-mono">
              <span className="font-semibold text-gray-400">Seu Progresso de Trilha</span>
              <span className="text-indigo-400 font-bold">{progressPercentage}%</span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-[#090d16] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 flex justify-between pr-1">
                <span>{completedCount} de {totalLessonsCount} aulas completadas</span>
              </p>
            </div>
          </div>

          {/* Diploma emit option */}
          {isCourseFullyCompleted ? (
            <button
              onClick={() => setShowCertificate(true)}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-650 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20 border-none hover:-translate-y-0.5 transition-all duration-200"
            >
              <Award className="w-4 h-4 animate-spin-slow" />
              EMITIR DIPLOMA DIGITAL
            </button>
          ) : (
            <div className="p-3.5 bg-[#0e1424]/40 border border-[#1b253b] rounded-xl text-[10px] text-gray-550 text-gray-400 flex items-start gap-2 select-none leading-relaxed">
              <Award className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <span>Conclua absolutamente 100% das aulas para publicar o diploma digital verificado de especialização técnica desta turma.</span>
            </div>
          )}
        </div>

        {/* Modules Syllabus List */}
        <div className="space-y-4 text-left">
          <h4 className="font-extrabold text-[10px] text-gray-400 tracking-wider uppercase border-b border-[#1b253b]/50 pb-2.5 font-mono">Indexador de Ementas</h4>
          
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {course.modules.map((mod, index) => {
              const isExpanded = expandedModules[mod.id];
              return (
                <div key={mod.id} className="bg-[#0e1424] rounded-xl overflow-hidden border border-[#1b253b]">
                  
                  {/* Module Toggle Anchor Header */}
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full bg-[#090d16]/50 hover:bg-[#090d16] px-3.5 py-3 flex items-center justify-between text-left cursor-pointer transition-all border-none"
                  >
                    <div className="flex-1 pr-2">
                      <span className="text-[9px] text-[#818cf8] font-bold uppercase tracking-wider block font-mono">MÓDULO {index + 1}</span>
                      <h5 className="font-bold text-xs text-gray-200 line-clamp-1 mt-0.5">{mod.title}</h5>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
                  </button>

                  {/* Lessons in module */}
                  {isExpanded && (
                    <div className="p-2 space-y-1.5 border-t border-[#1b253b] bg-[#0c1221]" id={`mod-list-${mod.id}`}>
                      {mod.lessons.map(les => {
                        const isSelected = les.id === activeLessonId;
                        const isDone = currentProgress?.completedLessons.includes(les.id);
                        const lessonProgressPercentage = getLessonProgressPercentage(les);
                        
                        return (
                          <div
                            key={les.id}
                            onClick={() => navigateTo('learning', course.id, les.id)}
                            className={`w-full p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition text-left group ${
                              isSelected 
                              ? 'bg-indigo-500/10 border-l-4 border-indigo-500 text-white' 
                              : 'hover:bg-white/5 text-gray-400'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 pr-2">
                              {isDone ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/10 shrink-0 select-none" />
                              ) : isSelected ? (
                                <Circle className="w-4 h-4 text-indigo-400 shrink-0 select-none" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-600 group-hover:text-gray-400 shrink-0 select-none" />
                              )}
                              
                              <div className="text-xs">
                                <p className={`font-medium line-clamp-2 ${isSelected ? 'text-indigo-305 text-indigo-300 font-bold' : 'text-gray-300'}`}>{les.title}</p>
                                <div className="mt-1 flex items-center justify-between gap-3 font-mono text-[9px] text-gray-500">
                                  <span>{les.duration}</span>
                                  <span className={lessonProgressPercentage > 0 ? 'text-indigo-400' : ''}>
                                    {lessonProgressPercentage}%
                                  </span>
                                </div>
                                <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#090d16]">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      isDone ? 'bg-emerald-500' : 'bg-indigo-500'
                                    }`}
                                    style={{ width: `${lessonProgressPercentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Certificate popup modal element */}
      {showCertificate && isCourseFullyCompleted && (
        <CertificateGenerator 
          courseId={course.id}
          onClose={() => setShowCertificate(false)} 
        />
      )}

    </div>
  );
};
