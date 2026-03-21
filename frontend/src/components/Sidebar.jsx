import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, CheckSquare, FileText,
  BarChart2, MessageSquare, Calendar, LogOut, Sparkles, BookMarked,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/courses', label: 'Cours', icon: BookOpen },
  { path: '/summaries', label: 'Résumés', icon: BookMarked },
  { path: '/sheets', label: 'Fiches', icon: FileText },
  { path: '/exercises', label: 'Exercices', icon: CheckSquare },
  { path: '/exams', label: 'Annales', icon: FileText },
  { path: '/assistant', label: 'Assistant IA', icon: MessageSquare, badge: 'IA' },
  { path: '/planning', label: 'Planning', icon: Calendar },
];

// Badge couleur par série
const seriesBadge = {
  C: { label: 'Série C', bg: 'rgba(79,122,248,0.15)', color: '#4f7af8' },
  D: { label: 'Série D', bg: 'rgba(67,233,123,0.15)', color: '#2ed573' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : '?';

  const fullName = user ? `${user.first_name} ${user.last_name}` : 'Utilisateur';
  const series = user?.series ?? 'C';
  const badge = seriesBadge[series] ?? seriesBadge.C;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <Link to="/" className="sidebar-logo" style={{ textDecoration: 'none' }}>
        <div className="sidebar-logo-icon">
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '0.9rem' }}>S3C</span>
        </div>
        <div>
          <div className="sidebar-logo-name">PrepBac</div>
          <div className="sidebar-logo-sub">Mauritanie · 2026</div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Navigation</p>
        <ul className="nav-list">
          {navItems.map(({ path, label, icon: Icon, badge: b }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon"><Icon size={17} /></span>
                <span style={{ flex: 1 }}>{label}</span>
                {b && <span className="nav-badge">{b}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>


    </aside>
  );
}
