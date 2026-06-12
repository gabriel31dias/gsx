/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HeroBanner } from './components/HeroBanner';
import { CourseCarousel } from './components/CourseCarousel';
import { CoursePlayer } from './components/CoursePlayer';
import { StudentProfile } from './components/StudentProfile';
import { AdminPanel } from './components/AdminPanel';
import { LiveStreamArea } from './components/LiveStreamArea';
import { GamificationRanking } from './components/GamificationRanking';
import { PlansArea } from './components/PlansArea';

function DashboardScreen() {
  const { courses, progressList, favoriteCourseIds } = usePlatform();
  const [searchQuery, setSearchQuery] = useState('');

  // Search Filter logic on title/description/instructor/category
  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Continue watching filter
  const continueWatching = courses.filter(c => {
    const prog = progressList.find(p => p.courseId === c.id);
    return prog && (prog.completedLessons.length > 0 || Object.keys(prog.lessonProgress).length > 0);
  });

  const popularCourses = courses.filter(c => c.isPopular);

  return (
    <div className="bg-[#070a13] text-white min-h-screen pb-20 space-y-6">
      
      {/* Modern Developer Tech Spotlight Banner */}
      <HeroBanner onSearchChange={(q) => setSearchQuery(q)} />

      {/* SEARCH RESULTS MODE VIEW */}
      {searchQuery.trim().length > 0 ? (
        <div className="animate-fadeIn">
          <CourseCarousel 
            title={`Resultado da busca por: "${searchQuery}"`} 
            coursesList={filteredCourses}
            emptyMessage="Desculpe, não localizamos nenhum curso para a sua pesquisa. Tente refazer o termo!"
          />
        </div>
      ) : (
        /* STANDARD DYNAMIC STREAM CAROUSELS */
        <div className="space-y-4 -mt-16 md:-mt-24 relative z-20 animate-fadeIn flex flex-col gap-6">
          
          {/* Section: CONTINUE WATCHING */}
          {continueWatching.length > 0 && (
            <div className="bg-gradient-to-b from-transparent to-[#070a13]/55">
              <CourseCarousel 
                title="Continuar Assistindo" 
                coursesList={continueWatching} 
              />
            </div>
          )}

          {/* Section: MOST POPULAR */}
          <CourseCarousel 
            title="Aulas em Alta e Populares" 
            coursesList={popularCourses} 
          />

          {/* Section: FAVORITES ROW */}
          {favoriteCourseIds.length > 0 && (
            <CourseCarousel 
              title="Sua Lista de Estudos" 
              coursesList={courses.filter(c => favoriteCourseIds.includes(c.id))} 
            />
          )}

          {/* Section: OTHER CATEGORIES SPLIT GROUPS */}
          <CourseCarousel 
            title="Novidades de Engenharia e IA" 
            coursesList={courses.filter(c => c.category === 'Data & AI' || c.category === 'Backend')} 
          />

          <CourseCarousel 
            title="Frontend & UI/UX Especializações" 
            coursesList={courses.filter(c => c.category === 'Frontend' || c.category === 'Design')} 
          />

        </div>
      )}

      {/* Footer Branding stamp */}
      <footer className="pt-20 pb-4 text-center text-[11px] text-gray-500 font-mono tracking-widest max-w-xl mx-auto border-t border-[#1b253b]/40 leading-relaxed">
        <p>© 2026 ALURADEV WORKSPACE. TODOS OS DIREITOS RESERVADOS.</p>
        <p className="text-[10px] text-gray-600 mt-1 uppercase">Plataforma Avançada de Treinamento e Carreira Técnico-Científica.</p>
      </footer>

    </div>
  );
}

function MainScreenShell() {
  const { activeScreen } = usePlatform();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-[#070a13] min-h-screen flex font-sans transition-all selection:bg-indigo-500 selection:text-white">
      {/* Persistent Left Sidebar on desktop, slide-over drawer on mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content viewport next to the sticky sidebar */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header navbar with menu trigger */}
        <Header onToggleSidebar={() => setSidebarOpen(true)} />

        {/* Screen Routing Outlet simulation */}
        <main className="flex-grow bg-[#070a13]">
          {activeScreen === 'home' && <DashboardScreen />}
          {activeScreen === 'learning' && <CoursePlayer />}
          {activeScreen === 'profile' && <StudentProfile />}
          {activeScreen === 'admin' && <AdminPanel />}
          {activeScreen === 'ranking' && <GamificationRanking />}
          {activeScreen === 'live' && <LiveStreamArea />}
          {activeScreen === 'plans' && <PlansArea />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PlatformProvider>
      <MainScreenShell />
    </PlatformProvider>
  );
}
