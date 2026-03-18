import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, CheckCircle, Clock, Award, BookOpen } from 'lucide-react';
import ProgressRing from '../components/ProgressRing';
import { API_BASE_URL } from '../apiConfig';

const quizHistory = [
  { subject: 'Mathématiques', title: 'Limites et Continuité', score: 8, total: 10, date: '15 mars' },
  { subject: 'Physique', title: 'Cinématique', score: 6, total: 10, date: '13 mars' },
  { subject: 'Sciences Nat.', title: 'Génétique', score: 9, total: 10, date: '11 mars' },
  { subject: 'Mathématiques', title: 'Dérivées', score: 7, total: 10, date: '9 mars' },
  { subject: 'Physique', title: 'Optique', score: 5, total: 10, date: '7 mars' },
];

const subjectColor = { 'Mathématiques': '#4f7af8', 'Physique': '#f5576c', 'Sciences Nat.': '#10b981', 'Informatique': '#8b5cf6', 'Option': '#f59e0b' };

export default function Progress() {
  const [stats, setStats] = useState({
    quiz_stats: { attempts: 0, avg_score: 0 },
    exercise_stats: { total: 0, completed: 0 },
    exam_stats: { total: 0, completed: 0 },
    subject_stats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

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
    } catch (err) { } finally { setLoading(false); }
  };

  const calculateGlobalProgress = () => {
    let exProg = stats.exercise_stats.total > 0 ? (stats.exercise_stats.completed / stats.exercise_stats.total) * 100 : 0;
    let examProg = stats.exam_stats.total > 0 ? (stats.exam_stats.completed / stats.exam_stats.total) * 100 : 0;
    let qProg = stats.quiz_stats.avg_score || 0;
    let items = 0; let total = 0;

    if (stats.exercise_stats.total > 0) { items++; total += exProg; }
    if (stats.exam_stats.total > 0) { items++; total += examProg; }
    if (stats.quiz_stats.attempts > 0) { items++; total += qProg; }

    return items > 0 ? Math.round(total / items) : 0;
  };

  const globalProgress = calculateGlobalProgress();

  return (
    <div>
      <div className="page-hero">
        <div>
          <h1 className="page-title">Mes Performances</h1>
          <p className="page-subtitle">Visualisez votre progression et vos résultats.</p>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid stagger anim-fade-up" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Score moyen (Quiz)', value: `${Math.round(stats.quiz_stats.avg_score || 0)}%`, icon: Award, bg: 'rgba(79,122,248,0.1)', color: '#4f7af8' },
          { label: 'Quiz complétés', value: `${stats.quiz_stats.attempts}`, icon: CheckCircle, bg: 'rgba(46,213,115,0.1)', color: '#2ed573' },
          { label: 'Exercices terminés', value: `${stats.exercise_stats.completed}/${stats.exercise_stats.total}`, icon: BookOpen, bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
          { label: 'Annales terminées', value: `${stats.exam_stats.completed}/${stats.exam_stats.total}`, icon: TrendingUp, bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>{s.label}</span>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} style={{ color: s.color }} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.73rem', color: 'var(--success)', fontWeight: 600 }}>{s.trend}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>

        {/* Subject progress */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: '1.25rem' }}>
            <BarChart2 size={16} style={{ color: 'var(--primary)' }} />
            Progression par matière
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {stats.subject_stats && stats.subject_stats.length > 0 ? (
              stats.subject_stats.map(s => {
                const color = subjectColor[s.name] || '#667eea';
                const emoji = s.name.includes('Math') ? '📘' : s.name.includes('Phy') ? '⚛️' : s.name.includes('Nat') ? '🌿' : '📄';
                const totalItems = s.quizzes + s.exercises_done + s.exams_done;
                // mock subject progress: if they start doing things, let's bump it
                const approxProg = Math.min(100, (s.quizzes * 5) + (s.exercises_done * 2) + (s.exams_done * 10));

                return (
                  <div key={s.name}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.name}</span>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.quizzes} quiz</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Moy: <strong style={{ color }}>{s.score}%</strong></span>
                            <span style={{ fontWeight: 800, fontSize: '0.9rem', color }}>{approxProg}%</span>
                          </div>
                        </div>
                        <div className="progress-track progress-track-lg">
                          <div className="progress-fill" style={{ width: `${approxProg}%`, background: `linear-gradient(90deg, ${color}, ${color}dd)` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Commencez des exercices ou des quiz pour voir votre progression ici.
              </div>
            )}
          </div>

          {/* Global ring */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1.5rem',
            marginTop: '1.75rem', padding: '1.25rem',
            borderRadius: 'var(--r-lg)',
            background: 'rgba(79,122,248,0.05)',
            border: '1px solid rgba(79,122,248,0.12)',
          }}>
            <ProgressRing percent={globalProgress} size={90} strokeWidth={10} color="#6366f1" label={`${globalProgress}%`} sublabel="global" />
            <div>
              <p style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.25rem' }}>Progression globale : {globalProgress}%</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Basé sur les quiz, exercices et annales complétés. Continuez vos efforts !
              </p>
            </div>
          </div>
        </div>

        {/* Quiz history */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: '1rem' }}>
            <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
            Historique des quiz
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {quizHistory.map((q, i) => {
              const pct = (q.score / q.total) * 100;
              const good = pct >= 70;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem', borderRadius: 'var(--r-md)',
                  background: 'rgba(238,241,248,0.5)',
                  border: '1px solid rgba(200,210,240,0.35)',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: `${subjectColor[q.subject]}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 800, color: subjectColor[q.subject],
                  }}>{q.score}/{q.total}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{q.subject} · {q.date}</div>
                  </div>
                  <div style={{
                    fontSize: '0.78rem', fontWeight: 800,
                    color: good ? 'var(--success)' : 'var(--warning)',
                    flexShrink: 0,
                  }}>
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div >
  );
}
