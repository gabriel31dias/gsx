/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
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
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/LoginScreen';

function DashboardScreen() {
  const {
    courses,
    coursesLoading,
    coursesError,
    refreshCourses,
  } = usePlatform();
  const [searchQuery, setSearchQuery] = useState('');

  // Search Filter logic on title/description/instructor/category
  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (coursesLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#070a13] px-4 py-12 text-white lg:px-10">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-10 h-52 rounded-3xl border border-[#1b253b] bg-[#0e1424]" />
          <div className="mb-5 h-6 w-52 rounded-lg bg-[#12192c]" />
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-96 rounded-2xl border border-[#1b253b] bg-[#0e1424]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#070a13] px-5 text-white">
        <div className="max-w-md rounded-3xl border border-red-500/20 bg-[#0e1424] p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-9 w-9 text-red-400" />
          <h2 className="text-lg font-extrabold">Não foi possível carregar os cursos</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400">{coursesError}</p>
          <button
            type="button"
            onClick={() => void refreshCourses()}
            className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold transition hover:bg-indigo-500"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

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
        <div className="relative z-20 -mt-16 animate-fadeIn md:-mt-24">
          <CourseCarousel
            title="Cursos disponíveis"
            coursesList={courses}
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

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070a13] text-white">
        <div className="flex flex-col items-center gap-4">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400/25 border-t-indigo-400" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
            Validando sessão
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <PlatformProvider>
      <MainScreenShell />
    </PlatformProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
