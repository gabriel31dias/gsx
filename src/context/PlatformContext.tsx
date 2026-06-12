import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Course, 
  CourseProgress, 
  UserProfile, 
  UserRole, 
  QuizAttempt, 
  Certificate, 
  Badge, 
  ActivityLog, 
  Comment 
} from '../types';
import { INITIAL_COURSES } from '../data/courses';

interface PlatformContextProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  courses: Course[];
  progressList: CourseProgress[];
  quizAttempts: QuizAttempt[];
  certificates: Certificate[];
  badges: Badge[];
  activityLogs: ActivityLog[];
  favoriteCourseIds: string[];
  activeScreen: 'home' | 'learning' | 'profile' | 'admin' | 'ranking' | 'live' | 'plans';
  activeCourseId: string | null;
  activeLessonId: string | null;
  
  // Navigation & View Actions
  navigateTo: (screen: 'home' | 'learning' | 'profile' | 'admin' | 'ranking' | 'live' | 'plans', courseId?: string | null, lessonId?: string | null) => void;
  
  // User Actions
  updateProfile: (name: string, email: string, avatar: string) => void;
  changePassword: (newPass: string) => boolean;
  toggleFavorite: (courseId: string) => void;
  updateUserRole: (id: string, role: UserRole) => void;
  toggleBlockUser: (id: string) => void;
  addActivityLog: (type: ActivityLog['type'], description: string) => void;
  
  // Game Actions
  addPoints: (amount: number) => void;
  checkAndUnlockBadges: () => void;
  
  // Learn Actions
  updateLessonProgress: (courseId: string, lessonId: string, seconds: number, durationSeconds: number) => void;
  markLessonComplete: (courseId: string, lessonId: string) => void;
  submitQuizAttempt: (courseId: string, quizId: string, answers: number[], score: number, passed: boolean) => void;
  addLessonComment: (courseId: string, lessonId: string, content: string) => void;
  
  // Course Management API for Admin
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (courseId: string) => void;
  
  // Billing Actions
  subscribeToPlan: (planName: string) => void;
  cancelSubscription: () => void;
}

const PlatformContext = createContext<PlatformContextProps | undefined>(undefined);

const INITIAL_BADGES: Badge[] = [
  { id: 'first_step', title: 'Primeiro Passo', description: 'Assistiu à primeira aula do curso', iconName: 'Compass' },
  { id: 'quiz_master', title: 'Mestre dos Testes', description: 'Passou de primeira em um quiz de módulo', iconName: 'Award' },
  { id: 'graduated', title: 'Diplomado', description: 'Emitiu o seu primeiro certificado', iconName: 'GraduationCap' },
  { id: 'marathoner', title: 'Maratonista AluraFlix', description: 'Assistiu a 5 aulas seguidas', iconName: 'Zap' },
  { id: 'financial_backer', title: 'Assinante Premium', description: 'Assinou um plano de estudos na plataforma', iconName: 'Sparkles' }
];

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-standard',
    name: 'Gabriel Siqueira',
    email: 'gabrieshhsh@gmail.com',
    role: UserRole.STUDENT,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    membershipPlan: 'Premium',
    membershipStatus: 'active',
    joinedAt: '31/05/2026',
    points: 1250,
    blocked: false
  },
  {
    id: 'user-admin',
    name: 'Admin Instrutor',
    email: 'admin@aluraflix.com.br',
    role: UserRole.ADMIN,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    membershipPlan: 'Premium',
    membershipStatus: 'active',
    joinedAt: '01/01/2026',
    points: 9999,
    blocked: false
  },
  {
    id: 'user-st2',
    name: 'Mariana Guedes',
    email: 'mari@gmail.com',
    role: UserRole.STUDENT,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    membershipPlan: 'Standard',
    membershipStatus: 'active',
    joinedAt: '15/05/2026',
    points: 620,
    blocked: false
  },
  {
    id: 'user-st3',
    name: 'Carlos Alberto',
    email: 'carlos.alberto@outlook.com',
    role: UserRole.STUDENT,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    membershipPlan: 'Nenhum',
    membershipStatus: 'inactive',
    joinedAt: '20/05/2026',
    points: 0,
    blocked: false
  }
];

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or trigger initial state from LocalStorage
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('aluraflix_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('aluraflix_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('aluraflix_curr_user');
    if (saved) return JSON.parse(saved);
    // default to student user
    return DEFAULT_USERS[0];
  });

  const [progressList, setProgressList] = useState<CourseProgress[]>(() => {
    const saved = localStorage.getItem('aluraflix_progress');
    return saved ? JSON.parse(saved) : [];
  });

  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
    const saved = localStorage.getItem('aluraflix_attempts');
    return saved ? JSON.parse(saved) : [];
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem('aluraflix_certificates');
    return saved ? JSON.parse(saved) : [];
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('aluraflix_badges');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('aluraflix_activity_logs');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'act-init', type: 'payment_made', description: 'Assinatura Premium iniciada', date: '31/05/2026 19:30' }
    ];
  });

  const [favoriteCourseIds, setFavoriteCourseIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('aluraflix_favorites');
    return saved ? JSON.parse(saved) : ['react-masterclass'];
  });

  // UI routing helper
  const [activeScreen, setActiveScreen] = useState<'home' | 'learning' | 'profile' | 'admin' | 'ranking' | 'live' | 'plans'>('home');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Sync to LS on change
  useEffect(() => {
    localStorage.setItem('aluraflix_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('aluraflix_users', JSON.stringify(allUsers));
    // update current user in collection too
    const match = allUsers.find(u => u.id === currentUser.id);
    if (match) {
      localStorage.setItem('aluraflix_curr_user', JSON.stringify(currentUser));
    }
  }, [allUsers, currentUser]);

  useEffect(() => {
    localStorage.setItem('aluraflix_curr_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('aluraflix_progress', JSON.stringify(progressList));
  }, [progressList]);

  useEffect(() => {
    localStorage.setItem('aluraflix_attempts', JSON.stringify(quizAttempts));
  }, [quizAttempts]);

  useEffect(() => {
    localStorage.setItem('aluraflix_certificates', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('aluraflix_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('aluraflix_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('aluraflix_favorites', JSON.stringify(favoriteCourseIds));
  }, [favoriteCourseIds]);

  const navigateTo = (screen: typeof activeScreen, courseId: string | null = null, lessonId: string | null = null) => {
    setActiveScreen(screen);
    setActiveCourseId(courseId);
    setActiveLessonId(lessonId);
  };

  const addActivityLog = (type: ActivityLog['type'], description: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      type,
      description,
      date: new Date().toLocaleString('pt-BR')
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const updateProfile = (name: string, email: string, avatar: string) => {
    const updated = { ...currentUser, name, email, avatar };
    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    addActivityLog('watch_lesson', `Perfil atualizado para ${name}`);
  };

  const changePassword = (_newPass: string): boolean => {
    addActivityLog('watch_lesson', 'Senha alterada com sucesso');
    return true;
  };

  const toggleFavorite = (courseId: string) => {
    setFavoriteCourseIds(prev => {
      const exists = prev.includes(courseId);
      if (exists) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const updateUserRole = (id: string, role: UserRole) => {
    setAllUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    if (currentUser.id === id) {
      setCurrentUser(curr => ({ ...curr, role }));
    }
  };

  const toggleBlockUser = (id: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextBlocked = !u.blocked;
        addActivityLog('watch_lesson', `${nextBlocked ? 'Bloqueou' : 'Desbloqueou'} o aluno ${u.name}`);
        return { ...u, blocked: nextBlocked };
      }
      return u;
    }));
  };

  const addPoints = (amount: number) => {
    setCurrentUser(curr => {
      const nextPoints = curr.points + amount;
      setAllUsers(prev => prev.map(u => u.id === curr.id ? { ...u, points: nextPoints } : u));
      return { ...curr, points: nextPoints };
    });
  };

  // Automatically check the requirements to unlock gamification medals
  const checkAndUnlockBadges = () => {
    const newBadges = [...badges];
    let updated = false;

    // First step badged
    const firstStep = newBadges.find(b => b.id === 'first_step');
    if (firstStep && !firstStep.unlockedAt) {
      const hasWatched = progressList.some(p => p.completedLessons.length > 0);
      if (hasWatched) {
        firstStep.unlockedAt = new Date().toLocaleDateString('pt-BR');
        updated = true;
        addActivityLog('badge_unlocked', `Conquista desbloqueada: ${firstStep.title}`);
        addPoints(150);
      }
    }

    // Quiz master
    const quizMaster = newBadges.find(b => b.id === 'quiz_master');
    if (quizMaster && !quizMaster.unlockedAt) {
      const passedAtLeastOne = quizAttempts.some(a => a.passed);
      if (passedAtLeastOne) {
        quizMaster.unlockedAt = new Date().toLocaleDateString('pt-BR');
        updated = true;
        addActivityLog('badge_unlocked', `Conquista desbloqueada: ${quizMaster.title}`);
        addPoints(300);
      }
    }

    // Graduated badge
    const graduated = newBadges.find(b => b.id === 'graduated');
    if (graduated && !graduated.unlockedAt) {
      if (certificates.length > 0) {
        graduated.unlockedAt = new Date().toLocaleDateString('pt-BR');
        updated = true;
        addActivityLog('badge_unlocked', `Conquista desbloqueada: ${graduated.title}`);
        addPoints(500);
      }
    }

    // Subscriber badge
    const backer = newBadges.find(b => b.id === 'financial_backer');
    if (backer && !backer.unlockedAt && currentUser.membershipPlan !== 'Nenhum') {
      backer.unlockedAt = new Date().toLocaleDateString('pt-BR');
      updated = true;
      addActivityLog('badge_unlocked', `Conquista desbloqueada: ${backer.title}`);
      addPoints(200);
    }

    if (updated) {
      setBadges(newBadges);
    }
  };

  const updateLessonProgress = (courseId: string, lessonId: string, seconds: number, durationSeconds: number) => {
    setProgressList(prev => {
      let match = prev.find(p => p.courseId === courseId);
      if (!match) {
        match = { courseId, completedLessons: [], lessonProgress: {} };
        prev = [...prev, match];
      }

      match.lessonProgress[lessonId] = seconds;
      
      // Auto-complete at 90%
      const percentagePlayed = (seconds / durationSeconds) * 100;
      if (percentagePlayed >= 90 && !match.completedLessons.includes(lessonId)) {
        match.completedLessons.push(lessonId);
        addActivityLog('watch_lesson', `Aula concluída (90% est.): ${lessonId}`);
        addPoints(50);
        
        // Trigger certificate check if all lessons are completed
        setTimeout(() => checkCertificateEmission(courseId), 500);
      }

      return [...prev];
    });

    setTimeout(() => checkAndUnlockBadges(), 1000);
  };

  const markLessonComplete = (courseId: string, lessonId: string) => {
    setProgressList(prev => {
      let match = prev.find(p => p.courseId === courseId);
      if (!match) {
        match = { courseId, completedLessons: [], lessonProgress: {} };
        prev = [...prev, match];
      }

      if (!match.completedLessons.includes(lessonId)) {
        match.completedLessons.push(lessonId);
        addActivityLog('watch_lesson', `Aula concluída manualmente: ${lessonId}`);
        addPoints(50);
        
        // Check if all classes are done
        setTimeout(() => checkCertificateEmission(courseId), 500);
      } else {
        // toggle off complete
        match.completedLessons = match.completedLessons.filter(id => id !== lessonId);
      }

      return [...prev];
    });

    setTimeout(() => checkAndUnlockBadges(), 1000);
  };

  // Certificate Automatic Emission when course complete
  const checkCertificateEmission = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    // total lessons in course
    let totalLessons = 0;
    course.modules.forEach(m => totalLessons += m.lessons.length);

    // active user progress
    const userProg = progressList.find(p => p.courseId === courseId);
    if (userProg && userProg.completedLessons.length >= totalLessons) {
      // emit certificate if not already issued
      const alreadyHave = certificates.some(cert => cert.courseId === courseId);
      if (!alreadyHave) {
        const newCert: Certificate = {
          id: `cert-${Date.now()}`,
          studentName: currentUser.name,
          courseId: courseId,
          courseName: course.title,
          hours: course.duration,
          date: new Date().toLocaleDateString('pt-BR'),
          verificationCode: `ALFLX-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        };

        setCertificates(prev => [...prev, newCert]);
        addActivityLog('certificate_issued', `Certificado emitido para o curso: ${course.title}`);
        addPoints(400);
        setTimeout(() => checkAndUnlockBadges(), 1000);
      }
    }
  };

  const submitQuizAttempt = (courseId: string, quizId: string, answers: number[], score: number, passed: boolean) => {
    const nextAttempt: QuizAttempt = {
      id: `att-${Date.now()}`,
      quizId,
      courseId,
      date: new Date().toLocaleString('pt-BR'),
      answers,
      score,
      passed
    };
    
    setQuizAttempts(prev => [...prev, nextAttempt]);
    addActivityLog('quiz_completed', `Realizou teste de conhecimento. Status: ${passed ? 'Aprovado' : 'Reprovado'} (${score}%)`);
    
    if (passed) {
      addPoints(100);
    }
    
    setTimeout(() => checkAndUnlockBadges(), 1000);
  };

  const addLessonComment = (courseId: string, lessonId: string, content: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const nextModules = c.modules.map(mod => {
          const nextLessons = mod.lessons.map(les => {
            if (les.id === lessonId) {
              const newComment: Comment = {
                id: `cmt-${Date.now()}`,
                userName: currentUser.name,
                userAvatar: currentUser.avatar,
                content,
                date: 'Hoje'
              };
              return { ...les, comments: [newComment, ...les.comments] };
            }
            return les;
          });
          return { ...mod, lessons: nextLessons };
        });
        return { ...c, modules: nextModules };
      }
      return c;
    }));
  };

  // Admin APIs
  const addCourse = (course: Course) => {
    setCourses(prev => [course, ...prev]);
    addActivityLog('watch_lesson', `Novo curso cadastrado: ${course.title}`);
  };

  const updateCourse = (course: Course) => {
    setCourses(prev => prev.map(c => c.id === course.id ? course : c));
    addActivityLog('watch_lesson', `Curso atualizado: ${course.title}`);
  };

  const deleteCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    setCourses(prev => prev.filter(c => c.id !== courseId));
    if (course) {
      addActivityLog('watch_lesson', `Curso excluído: ${course.title}`);
    }
  };

  // Subscriptions flow
  const subscribeToPlan = (planName: string) => {
    setCurrentUser(curr => ({
      ...curr,
      membershipPlan: planName,
      membershipStatus: 'active'
    }));
    addActivityLog('payment_made', `Assinatura do Plano ${planName} ativada com sucesso!`);
    addPoints(250);
    setTimeout(() => checkAndUnlockBadges(), 1000);
  };

  const cancelSubscription = () => {
    setCurrentUser(curr => ({
      ...curr,
      membershipPlan: 'Nenhum',
      membershipStatus: 'inactive'
    }));
    addActivityLog('watch_lesson', `Assinatura de plano cancelada`);
  };

  return (
    <PlatformContext.Provider value={{
      currentUser,
      allUsers,
      courses,
      progressList,
      quizAttempts,
      certificates,
      badges,
      activityLogs,
      favoriteCourseIds,
      activeScreen,
      activeCourseId,
      activeLessonId,
      
      navigateTo,
      updateProfile,
      changePassword,
      toggleFavorite,
      updateUserRole,
      toggleBlockUser,
      addActivityLog,
      addPoints,
      checkAndUnlockBadges,
      
      updateLessonProgress,
      markLessonComplete,
      submitQuizAttempt,
      addLessonComment,
      
      addCourse,
      updateCourse,
      deleteCourse,
      
      subscribeToPlan,
      cancelSubscription
    }}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform deve ser usado no PlatformProvider');
  }
  return context;
};
