import React from 'react';
import { Course } from '../types';
import { Play, Heart, Star, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

interface CourseCarouselProps {
  title: string;
  coursesList: Course[];
  emptyMessage?: string;
}

export const CourseCarousel: React.FC<CourseCarouselProps> = ({ title, coursesList, emptyMessage = "Nenhum curso disponível nesta categoria." }) => {
  const { progressList, favoriteCourseIds, toggleFavorite, navigateTo } = usePlatform();

  const getCourseProgressPercentage = (courseId: string) => {
    const course = coursesList.find(c => c.id === courseId);
    if (!course) return 0;
    
    let totalLessons = 0;
    course.modules.forEach(m => totalLessons += m.lessons.length);
    if (totalLessons === 0) return 0;

    const userProg = progressList.find(p => p.courseId === courseId);
    if (!userProg) return 0;

    return Math.round((userProg.completedLessons.length / totalLessons) * 100);
  };

  const handleStartCourse = (course: Course) => {
    const firstMod = course.modules[0];
    const firstLes = firstMod?.lessons[0];
    navigateTo('learning', course.id, firstLes?.id || null);
  };

  return (
    <div className="w-full text-white py-4">
      <div className="max-w-7xl mx-auto px-4 lg:px-10">
        
        {/* Section Heading with subtle accent indicator */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
            <h2 className="text-lg md:text-xl font-bold text-gray-100 tracking-tight">
              {title}
            </h2>
          </div>
          {coursesList.length > 1 && (
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">
              {coursesList.length} trilhas
            </span>
          )}
        </div>
        
        {coursesList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0a0e19] border border-[#1b253b]/40 text-center">
            <p className="text-xs text-gray-500 italic">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {coursesList.map((course) => {
              const progressPct = getCourseProgressPercentage(course.id);
              const isFav = favoriteCourseIds.includes(course.id);
              const lessonsCount = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);

              return (
                <div 
                  key={course.id} 
                  className="bg-[#0e1424] rounded-2xl overflow-hidden border border-[#1b253b]/60 hover:border-indigo-500/40 transition-all duration-300 shadow-xl group flex flex-col justify-between hover:-translate-y-1 hover:shadow-indigo-500/5 relative"
                  id={`course-card-${course.id}`}
                >
                  {/* Banner cover */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 border-b border-[#1b253b]/30">
                    <img 
                      referrerPolicy="no-referrer"
                      src={course.coverImage} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    
                    {/* Dark gradient blur covering bottom of image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-100 transition-all duration-300" />

                    {/* Hover Vignette Overlay with Play Trigger */}
                    <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                      <button 
                        onClick={() => handleStartCourse(course)}
                        className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer border border-indigo-400/25"
                        title="Ver Curso"
                      >
                        <Play className="w-4.5 h-4.5 fill-current" />
                      </button>
                    </div>

                    {/* Category Label Overlay */}
                    <span className="absolute top-3 left-3 bg-[#0a0e19]/90 backdrop-blur-md text-indigo-300 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border border-[#1a2333]/80 z-10">
                      {course.category}
                    </span>

                    {/* Favorite Heart Trigger */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(course.id);
                      }}
                      className="absolute top-3 right-3 p-1.5 bg-[#0a0e19]/90 backdrop-blur-md text-gray-400 hover:text-rose-500 rounded-full border border-[#1a2333]/80 hover:scale-115 active:scale-90 transition-all cursor-pointer z-20"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      {/* Meta information tags */}
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium mb-1.5 font-mono">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          {lessonsCount} aulas
                        </span>
                      </div>

                      {/* Course Title */}
                      <h3 className="font-bold text-sm md:text-[14.5px] text-gray-200 leading-snug group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">
                        {course.title}
                      </h3>
                      
                      {/* Short Description */}
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
                        {course.description}
                      </p>
                    </div>

                    {/* Footer region */}
                    <div>
                      {progressPct > 0 ? (
                        <div className="space-y-1 mb-3 pt-2.5 border-t border-[#1b253b]/50">
                          <div className="flex justify-between items-center text-[9px] text-gray-400 font-mono">
                            <span>Progresso concluído</span>
                            <span className="text-indigo-400 font-bold">{progressPct}%</span>
                          </div>
                          <div className="w-full bg-[#1b243b] h-1 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mb-3.5 pt-2.5 border-t border-[#1b253b]/40">
                          <img 
                            referrerPolicy="no-referrer"
                            src={course.instructorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                            alt={course.instructor} 
                            className="w-5 h-5 rounded-full object-cover border border-[#1e2a42]"
                          />
                          <span className="text-[11px] text-gray-400">Prof. <strong className="text-gray-300 font-semibold">{course.instructor}</strong></span>
                        </div>
                      )}

                      {/* Continuous learning action button */}
                      <button 
                        onClick={() => handleStartCourse(course)}
                        className="w-full bg-[#121829] hover:bg-indigo-600 border border-[#1b253b] hover:border-indigo-400 text-gray-300 hover:text-white font-bold text-xs py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {progressPct > 0 ? 'Retomar Aula' : 'Iniciar Aula'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
