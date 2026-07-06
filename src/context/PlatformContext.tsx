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
  Comment,
  Lesson
} from '../types';
import { useAuth } from './AuthContext';

interface PlatformContextProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  courses: Course[];
  progressList: CourseProgress[];
  quizAttempts: QuizAttempt[];
  certificates: Certificate[];
  badges: Badge[];
  activityLogs: ActivityLog[];
  activitiesLoading: boolean;
  activitiesError: string | null;
  achievementsLoading: boolean;
  achievementsError: string | null;
  favoriteCourseIds: string[];
  coursesLoading: boolean;
  coursesError: string | null;
  lessonsLoadingCourseId: string | null;
  lessonsError: string | null;
  activeScreen: 'home' | 'learning' | 'profile' | 'admin' | 'ranking' | 'live' | 'plans';
  activeCourseId: string | null;
  activeLessonId: string | null;
  refreshCourses: () => Promise<void>;
  loadCourseLessons: (courseId: string) => Promise<string | null>;
  refreshActivities: () => Promise<void>;
  refreshAchievements: () => Promise<void>;
  xpProgress: XpProgress | null;
  refreshXp: () => Promise<void>;
  billing: BillingData | null;
  billingLoading: boolean;
  refreshBilling: () => Promise<void>;

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
  updateLessonProgress: (courseId: string, lessonId: string, seconds: number, durationSeconds: number) => Promise<void>;
  markLessonComplete: (courseId: string, lessonId: string) => Promise<void>;
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

interface ApiCourse {
  id: number;
  title: string;
  description: string;
  photo_url: string | null;
  total_lessons: number;
  has_access?: boolean;
  plans?: { id: number; name: string }[];
  progress: {
    completed_lessons: number;
    percentage: number | string;
    last_accessed_at: string | null;
  };
}

interface CoursesResponse {
  courses?: ApiCourse[];
  message?: string;
  error?: string;
}

interface ApiLesson {
  id: number;
  title: string;
  description: string;
  video_url: string;
  video_file_url: string | null;
  has_video: boolean;
  order_number: number;
  duration_minutes: number;
  progress: {
    completed: boolean;
    watched_seconds: number;
    completed_at: string | null;
  };
}

interface LessonsResponse {
  course_id?: number;
  course_title?: string;
  lessons?: ApiLesson[];
  message?: string;
  error?: string;
}

interface UpdateProgressResponse {
  progress?: {
    lesson_id: number;
    completed: boolean;
    watched_seconds: number;
    completed_at: string | null;
  };
  message?: string;
  error?: string;
}

interface ApiActivity {
  id: number;
  type: string;
  title: string;
  description: string;
  occurred_at: string;
  metadata: Record<string, unknown>;
}

interface ActivitiesResponse {
  activities?: ApiActivity[];
  message?: string;
  error?: string;
}

export interface XpProgress {
  points: number;
  level: number;
  xp_into_level: number;
  xp_for_next_level: number;
  percent: number;
}

export interface BillingInvoice {
  id: string;
  amount: number | string;
  payment_method: string | null;
  status: string;
  plan_name: string | null;
  date: string;
}

export interface BillingData {
  subscription_status: string;
  subscription: {
    plan_name: string;
    price: number | string;
    status: string;
    started_at: string;
    expires_at: string | null;
  } | null;
  invoices: BillingInvoice[];
}

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
const COURSE_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop&q=80',
];

const mapApiCourse = (course: ApiCourse, index: number): Course => ({
  id: String(course.id),
  title: course.title,
  description: course.description,
  instructor: 'Equipe AluraDev',
  duration: 'Acesso sob demanda',
  category: 'Desenvolvimento',
  coverImage: course.photo_url
    ? `${API_BASE_URL}${course.photo_url}`
    : COURSE_FALLBACK_IMAGES[index % COURSE_FALLBACK_IMAGES.length],
  modules: [],
  rating: 4.8,
  isTrending: index === 0,
  isPopular: true,
  totalLessons: course.total_lessons,
  isLocked: course.has_access === false,
  requiredPlans: (course.plans ?? []).map((plan) => ({ id: String(plan.id), name: plan.name })),
  apiProgress: {
    completedLessons: course.progress.completed_lessons,
    percentage: Number(course.progress.percentage) || 0,
    lastAccessedAt: course.progress.last_accessed_at,
  },
});

const normalizeBackendUrl = (url: string | null) => {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname === '127.0.0.1' || parsedUrl.hostname === 'localhost') {
      return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    }
  } catch {
    return url;
  }

  return url;
};

const formatLessonDuration = (minutes: number) => {
  if (minutes <= 0) return 'Duração não informada';
  return `${minutes} min`;
};

const ACHIEVEMENT_KEY_ALIASES: Record<string, string> = {
  graduate: 'graduated',
};

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
  const { session } = useAuth();
  const authenticatedUser = session?.user;

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [lessonsLoadingCourseId, setLessonsLoadingCourseId] = useState<string | null>(null);
  const [lessonsError, setLessonsError] = useState<string | null>(null);

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('aluraflix_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('aluraflix_curr_user');
    const storedProfile = saved ? JSON.parse(saved) as UserProfile : DEFAULT_USERS[0];

    if (!authenticatedUser) {
      return storedProfile;
    }

    return {
      ...storedProfile,
      id: String(authenticatedUser.id),
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      role: authenticatedUser.role.toLowerCase() === 'admin' ? UserRole.ADMIN : UserRole.STUDENT,
    };
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

  const [xpProgress, setXpProgress] = useState<XpProgress | null>(null);
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [achievementsError, setAchievementsError] = useState<string | null>(null);

  const [favoriteCourseIds, setFavoriteCourseIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('aluraflix_favorites');
    return saved ? JSON.parse(saved) : ['react-masterclass'];
  });

  // UI routing helper
  const [activeScreen, setActiveScreen] = useState<'home' | 'learning' | 'profile' | 'admin' | 'ranking' | 'live' | 'plans'>('home');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  const refreshCourses = async () => {
    if (!session?.token) {
      setCourses([]);
      setCoursesLoading(false);
      return;
    }

    setCoursesLoading(true);
    setCoursesError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      const data = (await response.json().catch(() => ({}))) as CoursesResponse;

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Não foi possível carregar os cursos.');
      }

      if (!Array.isArray(data.courses)) {
        throw new Error('A API retornou uma listagem de cursos inválida.');
      }

      setCourses(data.courses.map(mapApiCourse));
    } catch (error) {
      setCourses([]);
      setCoursesError(error instanceof Error ? error.message : 'Não foi possível carregar os cursos.');
    } finally {
      setCoursesLoading(false);
    }
  };

  const refreshActivities = async () => {
    if (!session?.token) {
      setActivityLogs([]);
      return;
    }

    setActivitiesLoading(true);
    setActivitiesError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/activities?limit=10`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      const data = (await response.json().catch(() => ({}))) as ActivitiesResponse;

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Não foi possível carregar as atividades.');
      }

      if (!Array.isArray(data.activities)) {
        throw new Error('A API retornou um histórico de atividades inválido.');
      }

      setActivityLogs(data.activities.map((activity) => ({
        id: String(activity.id),
        type: activity.type,
        title: activity.title,
        description: activity.description,
        date: activity.occurred_at,
        metadata: activity.metadata,
      })));
    } catch (error) {
      setActivitiesError(error instanceof Error ? error.message : 'Não foi possível carregar as atividades.');
    } finally {
      setActivitiesLoading(false);
    }
  };

  const refreshAchievements = async () => {
    if (!session?.token) {
      setBadges(INITIAL_BADGES);
      return;
    }

    setAchievementsLoading(true);
    setAchievementsError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/activities?limit=100`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      const data = (await response.json().catch(() => ({}))) as ActivitiesResponse;

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Não foi possível carregar as conquistas.');
      }

      if (!Array.isArray(data.activities)) {
        throw new Error('A API retornou uma listagem de conquistas inválida.');
      }

      const achievementActivities = data.activities.filter(
        (activity) => activity.type === 'achievement_unlocked',
      );
      const unlockedByKey = new Map<string, ApiActivity>();

      achievementActivities.forEach((activity) => {
        const key = activity.metadata?.achievement_key;
        if (typeof key === 'string') {
          const normalizedKey = ACHIEVEMENT_KEY_ALIASES[key] ?? key;
          if (!unlockedByKey.has(normalizedKey)) {
            unlockedByKey.set(normalizedKey, activity);
          }
        }
      });

      const syncedBadges = INITIAL_BADGES.map((badge) => {
        const activity = unlockedByKey.get(badge.id);
        if (!activity) return { ...badge, unlockedAt: undefined, icon: undefined };

        const name = activity.metadata?.name;
        const icon = activity.metadata?.icon;
        unlockedByKey.delete(badge.id);

        return {
          ...badge,
          title: typeof name === 'string' ? name : badge.title,
          icon: typeof icon === 'string' ? icon : undefined,
          unlockedAt: activity.occurred_at,
        };
      });

      unlockedByKey.forEach((activity, key) => {
        const name = activity.metadata?.name;
        const icon = activity.metadata?.icon;
        syncedBadges.push({
          id: key,
          title: typeof name === 'string' ? name : activity.title,
          description: activity.description,
          iconName: 'Award',
          icon: typeof icon === 'string' ? icon : undefined,
          unlockedAt: activity.occurred_at,
        });
      });

      setBadges(syncedBadges);
    } catch (error) {
      setAchievementsError(error instanceof Error ? error.message : 'Não foi possível carregar as conquistas.');
    } finally {
      setAchievementsLoading(false);
    }
  };

  const loadCourseLessons = async (courseId: string) => {
    if (!session?.token) {
      throw new Error('Nenhuma sessão ativa.');
    }

    const existingCourse = courses.find((course) => course.id === courseId);
    const existingFirstLesson = existingCourse?.modules[0]?.lessons[0];
    if (existingFirstLesson) {
      return existingFirstLesson.id;
    }

    setLessonsLoadingCourseId(courseId);
    setLessonsError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/lessons`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      const data = (await response.json().catch(() => ({}))) as LessonsResponse;

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Não foi possível carregar as aulas.');
      }

      if (!Array.isArray(data.lessons)) {
        throw new Error('A API retornou uma listagem de aulas inválida.');
      }

      const orderedLessons = [...data.lessons].sort((a, b) => a.order_number - b.order_number);
      const lessons: Lesson[] = orderedLessons.map((lesson) => ({
        id: String(lesson.id),
        title: lesson.title,
        description: lesson.description,
        duration: formatLessonDuration(lesson.duration_minutes),
        durationSeconds: lesson.duration_minutes > 0 ? lesson.duration_minutes * 60 : undefined,
        progressSeconds: lesson.progress.watched_seconds,
        videoUrl: normalizeBackendUrl(lesson.video_url) ?? '',
        videoFileUrl: normalizeBackendUrl(lesson.video_file_url),
        hasVideo: lesson.has_video,
        orderNumber: lesson.order_number,
        materials: [],
        comments: [],
      }));

      setCourses((currentCourses) => currentCourses.map((course) => (
        course.id === courseId
          ? {
              ...course,
              title: data.course_title || course.title,
              modules: [{
                id: `course-${courseId}-lessons`,
                title: 'Aulas do curso',
                lessons,
              }],
            }
          : course
      )));

      setProgressList((currentProgress) => {
        const courseProgress = currentProgress.find((progress) => progress.courseId === courseId);
        const completedLessons = lessons
          .filter((_, index) => orderedLessons[index].progress.completed)
          .map((lesson) => lesson.id);
        const lessonProgress = Object.fromEntries(
          lessons.map((lesson) => [lesson.id, lesson.progressSeconds ?? 0]),
        );

        if (!courseProgress) {
          return [...currentProgress, { courseId, completedLessons, lessonProgress }];
        }

        return currentProgress.map((progress) => (
          progress.courseId === courseId
            ? { ...progress, completedLessons, lessonProgress }
            : progress
        ));
      });

      return lessons[0]?.id ?? null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível carregar as aulas.';
      setLessonsError(message);
      throw new Error(message);
    } finally {
      setLessonsLoadingCourseId(null);
    }
  };

  // XP/nível reais do backend -> alimenta o menu, o perfil e currentUser.points.
  const refreshXp = async () => {
    if (!session?.token) {
      setXpProgress(null);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/profile`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.profile) {
        setXpProgress(data.profile as XpProgress);
        setCurrentUser((current) => ({ ...current, points: data.profile.points }));
      }
    } catch {
      // mantém o valor atual quando o endpoint estiver indisponível
    }
  };

  const refreshBilling = async () => {
    if (!session?.token) {
      setBilling(null);
      return;
    }

    setBillingLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/billing`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setBilling(data as BillingData);
      }
    } catch {
      // mantém o valor atual quando o endpoint estiver indisponível
    } finally {
      setBillingLoading(false);
    }
  };

  useEffect(() => {
    void refreshCourses();
    void refreshXp();
  }, [session?.token]);

  useEffect(() => {
    if (!authenticatedUser) return;

    setCurrentUser((current) => ({
      ...current,
      id: String(authenticatedUser.id),
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      role: authenticatedUser.role.toLowerCase() === 'admin' ? UserRole.ADMIN : UserRole.STUDENT,
    }));
  }, [authenticatedUser]);

  // Sync to LS on change
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

  const saveLessonProgress = async (
    courseId: string,
    lessonId: string,
    watchedSeconds: number,
    completed: boolean,
  ) => {
    if (!session?.token) {
      throw new Error('Nenhuma sessão ativa.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/lessons/${lessonId}/update_progress`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        watched_seconds: Math.max(0, Math.floor(watchedSeconds)),
        completed,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as UpdateProgressResponse;

    if (!response.ok || !data.progress) {
      throw new Error(data.message || data.error || 'Não foi possível salvar o progresso da aula.');
    }

    const savedProgress = data.progress;
    setProgressList((currentProgress) => {
      const existing = currentProgress.find((progress) => progress.courseId === courseId);
      const completedLessons = new Set<string>(existing?.completedLessons ?? []);

      if (savedProgress.completed) {
        completedLessons.add(lessonId);
      } else {
        completedLessons.delete(lessonId);
      }

      const updated: CourseProgress = {
        courseId,
        completedLessons: [...completedLessons],
        lessonProgress: {
          ...(existing?.lessonProgress ?? {}),
          [lessonId]: savedProgress.watched_seconds,
        },
      };

      return existing
        ? currentProgress.map((progress) => progress.courseId === courseId ? updated : progress)
        : [...currentProgress, updated];
    });

    setCourses((currentCourses) => currentCourses.map((course) => {
      if (course.id !== courseId) return course;

      const modules = course.modules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) => (
          lesson.id === lessonId
            ? { ...lesson, progressSeconds: savedProgress.watched_seconds }
            : lesson
        )),
      }));
      const completedCount = modules
        .flatMap((module) => module.lessons)
        .filter((lesson) => (
          lesson.id === lessonId
            ? savedProgress.completed
            : currentProgressForLesson(courseId, lesson.id)
        )).length;
      const totalLessons = course.totalLessons || modules.flatMap((module) => module.lessons).length;

      return {
        ...course,
        modules,
        apiProgress: {
          completedLessons: completedCount,
          percentage: totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0,
          lastAccessedAt: new Date().toISOString(),
        },
      };
    }));

    return savedProgress;
  };

  const currentProgressForLesson = (courseId: string, lessonId: string) => (
    progressList
      .find((progress) => progress.courseId === courseId)
      ?.completedLessons.includes(lessonId) ?? false
  );

  const updateLessonProgress = async (
    courseId: string,
    lessonId: string,
    seconds: number,
    durationSeconds: number,
  ) => {
    const completed = durationSeconds > 0 && (seconds / durationSeconds) >= 0.9;
    const wasCompleted = currentProgressForLesson(courseId, lessonId);

    await saveLessonProgress(courseId, lessonId, seconds, completed || wasCompleted);

    if (completed && !wasCompleted) {
      addActivityLog('watch_lesson', `Aula concluída: ${lessonId}`);
      addPoints(50);
      setTimeout(() => checkCertificateEmission(courseId), 500);
      setTimeout(() => checkAndUnlockBadges(), 1000);
    }
  };

  const markLessonComplete = async (courseId: string, lessonId: string) => {
    const wasCompleted = currentProgressForLesson(courseId, lessonId);
    const watchedSeconds = progressList
      .find((progress) => progress.courseId === courseId)
      ?.lessonProgress[lessonId] ?? 0;

    await saveLessonProgress(courseId, lessonId, watchedSeconds, !wasCompleted);

    if (!wasCompleted) {
      addActivityLog('watch_lesson', `Aula concluída manualmente: ${lessonId}`);
      addPoints(50);
      setTimeout(() => checkCertificateEmission(courseId), 500);
      setTimeout(() => checkAndUnlockBadges(), 1000);
    }
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
      activitiesLoading,
      activitiesError,
      achievementsLoading,
      achievementsError,
      favoriteCourseIds,
      coursesLoading,
      coursesError,
      lessonsLoadingCourseId,
      lessonsError,
      activeScreen,
      activeCourseId,
      activeLessonId,
      
      refreshCourses,
      loadCourseLessons,
      refreshActivities,
      refreshAchievements,
      xpProgress,
      refreshXp,
      billing,
      billingLoading,
      refreshBilling,
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
