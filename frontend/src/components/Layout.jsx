import React from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { Bell, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StreakHeader from './StreakHeader';

const routeLabels = {
  '/': 'Tableau de bord',
  '/courses': 'Bibliothèque de cours',
  '/sheets': 'Fiches de révision',
  '/exercises': 'Exercices',
  '/quizzes': 'QCM',
  '/assistant': 'Assistant IA',
  '/planning': 'Planning',
  '/progress': 'Mes performances',
  '/exams': 'Annales du Bac',
};

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const label = routeLabels[location.pathname] ?? 'Page';

  const firstName = user?.first_name ?? 'Étudiant';
  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : '?';

  return (
    <div className="app-layout">
      {/* Sidebar — visible on desktop only via CSS */}
      <Sidebar />

      <div className="app-main">
        {/* Desktop header */}
        <div className="top-header-wrap desktop-only">
          <header className="top-header">
            <span className="header-greeting">
              Bonjour, <span>{firstName} !</span>
            </span>
            <div className="header-actions">
              <StreakHeader />
              {user?.role === 'admin' && (
                <button
                  className="header-btn"
                  onClick={() => navigate('/admin')}
                  style={{ background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' }}
                >
                  <Settings size={14} />
                  <span>Espace Admin</span>
                </button>
              )}
              <button className="header-btn">
                <Bell size={14} />
                <span>Notifications</span>
              </button>
              <div className="header-avatar" title="Mon compte">{initials}</div>
            </div>
          </header>
        </div>

        {/* Mobile header */}
        <header className="mobile-header mobile-only">
          <div className="mobile-header-left">
            <div className="mobile-logo">P</div>
            <span className="mobile-page-title">{label}</span>
          </div>
          <div className="mobile-header-right">
            <StreakHeader />
            <div className="header-avatar mobile-avatar">{initials}</div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content anim-fade-up">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  );
}
