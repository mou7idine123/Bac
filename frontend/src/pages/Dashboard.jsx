import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, TrendingUp, CheckSquare, Calendar, ArrowRight,
  Sparkles, GraduationCap, FlaskConical, Ruler, Play,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProgressRing from '../components/ProgressRing';
import { API_BASE_URL } from '../apiConfig';

/** Textes de l'interface */
const UI = {
  seriesLabel: (label) => label,
  globalTitle: 'Progression Globale',
  globalSub: 'du programme',
  nextLabel: 'Prochain :',
  quizzesTitle: 'Quiz Récents',
  quizzesCta: 'Voir plus',
  planningTitle: 'Planning à Venir',
  planningCta: 'Gérer Planning',
  aiTitle: 'Assistant IA',
  aiPlaceholder: "Comment puis-je t'aider aujourd'hui ?",
  gradientId: 'gp',
  gradientLabel: '%',
  gradientSublabel: 'global',
};

/** Routes internes */
const ROUTES = {
  quizzes: '/quizzes',
  planning: '/planning',
  assistant: '/assistant',
};

/** Progression globale (à terme, viendra de l'API) */
const GLOBAL_PROGRESS = 75;

/** Derniers quiz passés (à terme, viendra de l'API) */
const RECENT_QUIZZES = [];

/** Données par série */
const SERIES_DATA = {
  C: {
    label: 'Série C — Mathématiques',
    color: '#4f7af8',
    badgeBg: 'rgba(79,122,248,0.1)',
    gradient: 'linear-gradient(90deg,#4f7af8,#764ba2)',
    icon: Ruler,
    subjects: [],
    planning: [],
    ai: [],
  },
  D: {
    label: 'Série D — Sciences Naturelles',
    color: '#2ed573',
    badgeBg: 'rgba(46,213,115,0.1)',
    gradient: 'linear-gradient(90deg,#43e97b,#38f9d7)',
    icon: FlaskConical,
    subjects: [],
    planning: [],
    ai: [],
  },
};

/* ================================================================
   COMPOSANT
   ================================================================ */

export default function Dashboard() {
  const { user } = useAuth();
  const seriesKey = user?.series ?? 'C';
  const data = SERIES_DATA[seriesKey] ?? SERIES_DATA.C;
  const SeriesIcon = data.icon;

  const [dbSubjects, setDbSubjects] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [stats, setStats] = useState({
    quiz_stats: { attempts: 0, avg_score: 0 },
    exercise_stats: { total: 0, completed: 0 },
    exam_stats: { total: 0, completed: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLibrary();
    fetchResumes();
    fetchStats();
  }, [seriesKey]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('bac_token');
      const res = await fetch(`${API_BASE_URL}/progress/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.exercise_stats) {
        setStats(result);
      }
    } catch (err) { }
  };

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('bac_token');
      const res = await fetch(`${API_BASE_URL}/admin/chapters?series=${seriesKey}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.chapters) {
        setResumes(data.chapters.filter(c => c.resume_pdf_url));
      }
    } catch (err) { }
  };

  const fetchLibrary = async () => {
    try {
      const token = localStorage.getItem('bac_token');
      const res = await fetch(`${API_BASE_URL}/courses/library?series=${seriesKey}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.subjects) {
        // Map database subjects to UI format
        const mapped = result.subjects.map((s, idx) => {
          let totalLessons = 0;
          if (s.chapters && Array.isArray(s.chapters)) {
            totalLessons = s.chapters.reduce((sum, ch) => sum + (ch.lessons || 0), 0);
          }
          let baseColor = s.color_theme || '#667eea';
          let grad = `linear-gradient(90deg, ${baseColor}, #764ba2)`;

          return {
            name: s.name,
            icon: BookOpen,
            color: baseColor,
            bg: `${baseColor}20`,
            progress: 0,
            next: 'Introduction',
            grad: grad,
            totalLessons: totalLessons
          };
        });
        setDbSubjects(mapped);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getGlobalProgress = () => {
    let exProg = stats.exercise_stats.total > 0 ? (stats.exercise_stats.completed / stats.exercise_stats.total) * 100 : 0;
    let examProg = stats.exam_stats.total > 0 ? (stats.exam_stats.completed / stats.exam_stats.total) * 100 : 0;
    let quizProg = stats.quiz_stats.total > 0 ? (stats.quiz_stats.completed / stats.quiz_stats.total) * 100 : 0;
    let items = 0; let total = 0;

    if (stats.exercise_stats.total > 0) { items++; total += exProg; }
    if (stats.exam_stats.total > 0) { items++; total += examProg; }
    if (stats.quiz_stats.total > 0) { items++; total += quizProg; }
    return items > 0 ? Math.round(total / items) : 0;
  };

  const globalProgress = getGlobalProgress();

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

      {/* Ligne haute : anneau de progression + cartes progression */}
      <div
        className="grid stagger anim-fade-up"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}
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
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#f093fb" />
                  </linearGradient>
                </defs>
              </svg>
              <ProgressRing
                percent={globalProgress}
                size={96}
                strokeWidth={10}
                color={`url(#${UI.gradientId})`}
                label={`${globalProgress}${UI.gradientLabel}`}
                sublabel={UI.gradientSublabel}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1 }}>
                {globalProgress}{UI.gradientLabel}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {UI.globalSub}
              </div>
              <div className="progress-track" style={{ marginTop: '0.75rem' }}>
                <div className="progress-fill progress-multi" style={{ width: `${globalProgress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Exercices */}
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Exercices</h4>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981' }}>{stats.exercise_stats.completed}/{stats.exercise_stats.total}</span>
          </div>
          <div className="progress-track" style={{ height: 12 }}>
            <div className="progress-fill" style={{
              width: `${stats.exercise_stats.total > 0 ? (stats.exercise_stats.completed / stats.exercise_stats.total) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #10b981, #34d399)'
            }} />
          </div>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Exercices terminés.</p>
        </div>

        {/* Annales */}
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Annales</h4>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f59e0b' }}>{stats.exam_stats.completed}/{stats.exam_stats.total}</span>
          </div>
          <div className="progress-track" style={{ height: 12 }}>
            <div className="progress-fill" style={{
              width: `${stats.exam_stats.total > 0 ? (stats.exam_stats.completed / stats.exam_stats.total) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #f59e0b, #fbbf24)'
            }} />
          </div>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sujets d'examens terminés.</p>
        </div>

        {/* QCM */}
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>QCM</h4>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#8b5cf6' }}>{stats.quiz_stats.completed}/{stats.quiz_stats.total}</span>
          </div>
          <div className="progress-track" style={{ height: 12 }}>
            <div className="progress-fill" style={{
              width: `${stats.quiz_stats.total > 0 ? (stats.quiz_stats.completed / stats.quiz_stats.total) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)'
            }} />
          </div>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quiz marqués comme faits.</p>
        </div>
      </div>

      {/* Ligne basse : Quiz / Planning / IA / Résumés */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>


        {/* Résumés Chapitres */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="section-header">
            <h3 className="section-title">
              <BookOpen size={16} style={{ color: 'var(--primary)' }} />
              Résumés de Chapitre
            </h3>
          </div>
          {resumes.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun résumé disponible.</div>
          ) : (
            resumes.slice(0, 3).map((r, i) => (
              <div key={i} className="glass-light" style={{
                display: 'flex', alignItems: 'center', gap: '0.8rem',
                padding: '0.75rem 1rem', borderRadius: 'var(--r-lg)',
                transition: 'var(--t)', cursor: 'pointer'
              }}
                onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}${r.resume_pdf_url}`, '_blank')}
                onMouseOver={e => e.currentTarget.style.background = 'white'} onMouseOut={e => e.currentTarget.style.background = 'var(--bg-glass-light)'}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'linear-gradient(135deg,#f093fb,#f5576c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem' }}>
                  <BookOpen size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.subject_name}</div>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
            ))
          )}
          <Link to="/courses" className="btn btn-glass" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>
            Tous les cours <ArrowRight size={14} />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                }} onMouseOver={e => e.currentTarget.style.background = 'white'} onMouseOut={e => e.currentTarget.style.background = 'var(--bg-glass-light)'}>
                  <Play size={12} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
                  {suggestion}
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div >
  );
}
