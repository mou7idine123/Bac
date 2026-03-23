import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, CheckSquare, Calendar, Sparkles,
  MoreHorizontal, FileText, ClipboardList, GraduationCap, BarChart2
} from 'lucide-react';

const navItems = [
  { to: '/app/dashboard', icon: Home, label: 'Accueil' },
  { to: '/app/courses', icon: BookOpen, label: 'Cours' },
  { to: '/app/planning', icon: Calendar, label: 'Planning' },
  { to: '/app/assistant', icon: Sparkles, label: 'IA' },
];

const secondaryNavItems = [
  { to: '/app/exercises', icon: CheckSquare, label: 'Exercices' },
  { to: '/app/sheets', icon: FileText, label: 'Fiches' },
  { to: '/app/summaries', icon: ClipboardList, label: 'Résumés' },
  { to: '/app/exams', icon: GraduationCap, label: 'Annales' },
  { to: '/app/progress', icon: BarChart2, label: 'Stats' },
];

export default function BottomNav() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();

  const isSecondaryActive = secondaryNavItems.some(item => location.pathname === item.to);

  return (
    <>
      {isMoreOpen && (
        <div className="bottom-nav-overlay" onClick={() => setIsMoreOpen(false)} />
      )}

      {isMoreOpen && (
        <div className="bottom-nav-more-menu">
          {secondaryNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `more-menu-item${isActive ? ' active' : ''}`}
              onClick={() => setIsMoreOpen(false)}
            >
              <div className="more-menu-icon">
                <Icon size={20} />
              </div>
              <span className="more-menu-label">{label}</span>
            </NavLink>
          ))}
        </div>
      )}

      <nav className="bottom-nav mobile-only">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/app/dashboard'}>
            {({ isActive }) => (
              <div className={`bottom-nav-item${isActive ? ' bottom-nav-item--active' : ''}`}>
                <div className="bottom-nav-icon-wrap">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  {isActive && <span className="bottom-nav-dot" />}
                </div>
                <span className="bottom-nav-label">{label}</span>
              </div>
            )}
          </NavLink>
        ))}

        {/* More Button wrapped in a flex container to match NavLink size */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            className={`bottom-nav-item${isMoreOpen || isSecondaryActive ? ' bottom-nav-item--active' : ''}`}
            onClick={() => setIsMoreOpen(!isMoreOpen)}
          >
            <div className="bottom-nav-icon-wrap">
              <MoreHorizontal size={22} strokeWidth={isMoreOpen || isSecondaryActive ? 2.5 : 1.8} />
              {(isMoreOpen || isSecondaryActive) && <span className="bottom-nav-dot" />}
            </div>
            <span className="bottom-nav-label">Plus</span>
          </div>
        </div>
      </nav>
    </>
  );
}
