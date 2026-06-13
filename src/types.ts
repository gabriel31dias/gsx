export enum LessonStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
}

export interface Lesson {
  id: string;
  title: string;
  duration: string; // e.g., "12:35"
  videoUrl: string; // fallback / youtube / vimeo placeholder
  description: string;
  materials: { title: string; url: string; isDownloadable: boolean }[];
  comments: Comment[];
  progressSeconds?: number;
  durationSeconds?: number; // total duration
  videoFileUrl?: string | null;
  hasVideo?: boolean;
  orderNumber?: number;
}

export interface Comment {
  id: string;
  userName: string;
  userAvatar?: string;
  content: string;
  date: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  minScoreToPass: number; // e.g. 70
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  courseId: string;
  date: string;
  answers: number[]; // chosen indices
  score: number; // percentage
  passed: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  quiz?: Quiz;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar?: string;
  duration: string; // e.g. "40h"
  category: string;
  coverImage: string;
  modules: Module[];
  rating: number; // e.g. 4.8
  isTrending?: boolean;
  isPopular?: boolean;
  totalLessons?: number;
  apiProgress?: {
    completedLessons: number;
    percentage: number;
    lastAccessedAt: string | null;
  };
}

export interface CourseProgress {
  courseId: string;
  completedLessons: string[]; // lessonIds
  lessonProgress: { [lessonId: string]: number }; // seconds watched
  completedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  membershipPlan: string; // 'Standard' | 'Premium' | 'Nenhum'
  membershipStatus: 'active' | 'inactive';
  joinedAt: string;
  points: number;
  blocked: boolean;
}

export interface Certificate {
  id: string;
  studentName: string;
  courseId: string;
  courseName: string;
  hours: string;
  date: string;
  verificationCode: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt?: string;
}

export interface ActivityLog {
  id: string;
  type: 'watch_lesson' | 'quiz_completed' | 'badge_unlocked' | 'certificate_issued' | 'payment_made';
  description: string;
  date: string;
}

export interface PaymentMethod {
  name: string;
  type: 'pix' | 'credit_card' | 'stripe' | 'mercado_pago' | 'asaas';
  details: string;
}
