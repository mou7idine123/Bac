import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Bell, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const routeLabels = {
  '/':          'Tableau de bord',
  '/courses':   'Bibliothèque de cours',
  '/quizzes':   'Quiz & Exercices',
  '/assistant': 'Assistant IA',
  '/planning':  'Planning',
  '/progress':  'Mes performances',
  '/exams':     'Annales du Bac',
};

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const label = routeLabels[location.pathname] ?? 'Page';

  const firstName = user?.first_name ?? 'Étudiant';
  const initials  = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : '?';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        {/* Top Header */}
        <div className="top-header-wrap">
          <header className="top-header">
            <div>
              <span className="header-greeting">
                Bonjour, <span>{firstName} !</span>
              </span>
            </div>
            <div className="header-actions">
              <button className="header-btn">
                <Bell size={14} />
                <span>Notifications</span>
                <ChevronDown size={12} />
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:'0.45rem' }}>
                <div className="header-avatar" title="Mon compte">{initials}</div>
                <span style={{ fontSize:'0.83rem', fontWeight:600, color:'var(--text-secondary)' }}>
                  {firstName}
                </span>
                <ChevronDown size={12} style={{ color:'var(--text-muted)' }} />
              </div>
            </div>
          </header>
        </div>

        {/* Page */}
        <main className="page-content anim-fade-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
