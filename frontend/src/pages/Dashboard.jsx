import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, TrendingUp, CheckSquare, Calendar, ArrowRight,
  Sparkles, GraduationCap, FlaskConical, Ruler, Play,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProgressRing from '../components/ProgressRing';

/* ================================================================
   CONFIGURATION — aucune chaîne ni couleur codée en dur dans le JSX
   ================================================================ */

/** Textes de l'interface */
const UI = {
  seriesLabel:     (label) => label,
  globalTitle:     'Progression Globale',
  globalSub:       'du programme',
  nextLabel:       'Prochain :',
  quizzesTitle:    'Quiz Récents',
  quizzesCta:      'Voir plus',
  planningTitle:   'Planning à Venir',
  planningCta:     'Gérer Planning',
  aiTitle:         'Assistant IA',
  aiPlaceholder:   "Comment puis-je t'aider aujourd'hui ?",
  gradientId:      'gp',
  gradientLabel:   '%',
  gradientSublabel:'global',
};

/** Routes internes */
const ROUTES = {
  quizzes:   '/quizzes',
  planning:  '/planning',
  assistant: '/assistant',
};

/** Progression globale (à terme, viendra de l'API) */
const GLOBAL_PROGRESS = 75;

/** Derniers quiz passés (à terme, viendra de l'API) */
const RECENT_QUIZZES = [
  { title: 'Physique : Optique', score: 8, total: 10 },
  { title: 'Maths : Algèbre',    score: 7, total: 10 },
];

/** Données par série */
const SERIES_DATA = {
  C: {
    label:    'Série C — Mathématiques',
    color:    '#4f7af8',
    badgeBg:  'rgba(79,122,248,0.1)',
    gradient: 'linear-gradient(90deg,#4f7af8,#764ba2)',
    icon:     Ruler,
    subjects: [
      { name: 'Maths',    icon: BookOpen,     color: '#667eea', bg: 'rgba(102,126,234,0.1)', progress: 80, next: 'Intégrales',  grad: 'linear-gradient(90deg,#667eea,#764ba2)' },
      { name: 'Physique', icon: TrendingUp,   color: '#f5576c', bg: 'rgba(245,87,108,0.1)',  progress: 65, next: 'Optique',     grad: 'linear-gradient(90deg,#f093fb,#f5576c)' },
      { name: 'Chimie',   icon: FlaskConical, color: '#4facfe', bg: 'rgba(79,172,254,0.1)',  progress: 50, next: 'Acide-Base',  grad: 'linear-gradient(90deg,#4facfe,#00f2fe)' },
    ],
    planning: [
      { day: "Aujourd'hui", label: 'Révision : Intégrales',  dot: '#667eea', italic: true  },
      { day: 'Demain',      label: 'Exercice : Physique',    dot: '#f5576c', italic: false },
      { day: 'Vendredi',   label: 'Quiz : Chimie',           dot: '#4facfe', italic: false },
    ],
    ai: [
      'Dériver une fonction',
      'Loi des nœuds (Kirchhoff)',
      'Acides et bases',
    ],
  },
  D: {
    label:    'Série D — Sciences Naturelles',
    color:    '#2ed573',
    badgeBg:  'rgba(46,213,115,0.1)',
    gradient: 'linear-gradient(90deg,#43e97b,#38f9d7)',
    icon:     FlaskConical,
    subjects: [
      { name: 'Maths',         icon: BookOpen,     color: '#667eea', bg: 'rgba(102,126,234,0.1)', progress: 70, next: 'Probabilités', grad: 'linear-gradient(90deg,#667eea,#764ba2)' },
      { name: 'Sciences Nat.', icon: FlaskConical, color: '#43e97b', bg: 'rgba(67,233,123,0.1)',  progress: 75, next: 'Immunologie',  grad: 'linear-gradient(90deg,#43e97b,#38f9d7)' },
      { name: 'Physique',      icon: TrendingUp,   color: '#f5576c', bg: 'rgba(245,87,108,0.1)',  progress: 55, next: 'Mécanique',    grad: 'linear-gradient(90deg,#f093fb,#f5576c)' },
    ],
    planning: [
      { day: "Aujourd'hui", label: 'Révision : Génétique',   dot: '#43e97b', italic: true  },
      { day: 'Demain',      label: 'Quiz : Immunologie',     dot: '#667eea', italic: false },
      { day: 'Vendredi',   label: 'Exercice : Mécanique',   dot: '#f5576c', italic: false },
    ],
    ai: [
      'Expliquer la mitose',
      'Loi de Newton',
      'Probabilités combinatoires',
    ],
  },
};

/* ================================================================
   COMPOSANT
   ================================================================ */

export default function Dashboard() {
  const { user } = useAuth();
  const seriesKey = user?.series ?? 'C';
  const data      = SERIES_DATA[seriesKey] ?? SERIES_DATA.C;
  const SeriesIcon = data.icon;

  return (
    <div>

      {/* Badge série */}
      <div style={{ marginBottom: '1rem' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.3rem 0.85rem', borderRadius: 'var(--r-full)',
          fontSize: '0.78rem', fontWeight: 700,
          background: data.badgeBg,
          color: data.color,
        }}>
          <SeriesIcon size={14} />
          {UI.seriesLabel(data.label)}
        </span>
      </div>

      {/* Ligne haute : anneau de progression + matières */}
      <div
        className="grid stagger anim-fade-up"
        style={{ gridTemplateColumns: '1fr repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}
      >
        {/* Progression globale */}
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {UI.globalTitle}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <svg width="0" height="0">
                <defs>
                  <linearGradient id={UI.gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#667eea" />
                    <stop offset="100%" stopColor="#f093fb" />
                  </linearGradient>
                </defs>
              </svg>
              <ProgressRing
                percent={GLOBAL_PROGRESS}
                size={96}
                strokeWidth={10}
                color={`url(#${UI.gradientId})`}
                label={`${GLOBAL_PROGRESS}${UI.gradientLabel}`}
                sublabel={UI.gradientSublabel}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1 }}>
                {GLOBAL_PROGRESS}{UI.gradientLabel}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {UI.globalSub}
              </div>
              <div className="progress-track" style={{ marginTop: '0.75rem' }}>
                <div className="progress-fill progress-multi" style={{ width: `${GLOBAL_PROGRESS}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Cartes matières */}
        {data.subjects.map((s) => {
          const SubjectIcon = s.icon;
          return (
            <div key={s.name} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</span>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SubjectIcon size={20} style={{ color: s.color }} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: s.color, lineHeight: 1 }}>
                {s.progress}{UI.gradientLabel}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, marginBottom: '0.5rem' }}>
                {UI.nextLabel} {s.next}
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${s.progress}%`, background: s.grad }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Ligne basse : Quiz / Planning / IA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>

        {/* Quiz récents */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="section-header">
            <h3 className="section-title">
              <CheckSquare size={16} style={{ color: 'var(--primary)' }} />
              {UI.quizzesTitle}
            </h3>
          </div>
          {RECENT_QUIZZES.map((q, i) => (
            <div key={i} className="glass-light" style={{
              display: 'flex', alignItems: 'center', gap: '0.8rem',
              padding: '0.75rem 1rem', borderRadius: 'var(--r-lg)',
              transition: 'var(--t)', cursor: 'default'
            }} onMouseOver={e=>e.currentTarget.style.background='white'} onMouseOut={e=>e.currentTarget.style.background='var(--bg-glass-light)'}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem' }}>
                <CheckSquare size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{q.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score: {q.score}/{q.total}</div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
          ))}
          <Link to={ROUTES.quizzes} className="btn btn-glass" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>
            {UI.quizzesCta} <ArrowRight size={14} />
          </Link>
        </div>

        {/* Planning */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="section-header">
            <h3 className="section-title">
              <Calendar size={16} style={{ color: 'var(--primary)' }} />
              {UI.planningTitle}
            </h3>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {data.planning.map((p, i) => (
              <div key={i} className="glass-light" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.7rem 1rem', borderRadius: 'var(--r-lg)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.dot, marginTop: 6, flexShrink: 0, boxShadow: `0 0 8px ${p.dot}` }} />
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{p.day}</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: p.italic ? 'italic' : 'normal', marginTop: 2 }}>
                    {p.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link to={ROUTES.planning} className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>
            {UI.planningCta}
          </Link>
        </div>

        {/* Assistant IA */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="section-header">
            <h3 className="section-title">
              <Sparkles size={16} style={{ color: '#a18cd1' }} />
              {UI.aiTitle}
            </h3>
          </div>
          <div className="glass-light" style={{ padding: '0.85rem 1rem', borderRadius: 'var(--r-lg)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {UI.aiPlaceholder}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {data.ai.map((suggestion, i) => (
              <Link key={i} to={ROUTES.assistant} style={{ textDecoration: 'none' }}>
                <div className="glass-light" style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.6rem 0.85rem', borderRadius: 'var(--r-md)',
                  fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'var(--t)',
                }} onMouseOver={e=>e.currentTarget.style.background='white'} onMouseOut={e=>e.currentTarget.style.background='var(--bg-glass-light)'}>
                  <Play size={12} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
                  {suggestion}
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
