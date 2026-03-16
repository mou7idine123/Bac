import React from 'react';
import { BarChart2, TrendingUp, CheckCircle, Clock, Award } from 'lucide-react';
import ProgressRing from '../components/ProgressRing';

const subjects = [
  { name: 'Mathématiques', emoji: '📘', progress: 80, score: 82, quizzes: 12, gradient: 'linear-gradient(90deg,#667eea,#764ba2)', color: '#667eea' },
  { name: 'Physique',      emoji: '⚛️',  progress: 65, score: 71, quizzes: 8,  gradient: 'linear-gradient(90deg,#f093fb,#f5576c)', color: '#f5576c' },
  { name: 'Sciences Nat.', emoji: '🌿',  progress: 72, score: 78, quizzes: 10, gradient: 'linear-gradient(90deg,#4facfe,#00f2fe)', color: '#4facfe' },
];

const quizHistory = [
  { subject: 'Mathématiques', title: 'Limites et Continuité',  score: 8,  total: 10, date: '15 mars' },
  { subject: 'Physique',      title: 'Cinématique',           score: 6,  total: 10, date: '13 mars' },
  { subject: 'Sciences Nat.', title: 'Génétique',             score: 9,  total: 10, date: '11 mars' },
  { subject: 'Mathématiques', title: 'Dérivées',              score: 7,  total: 10, date: '9 mars'  },
  { subject: 'Physique',      title: 'Optique',               score: 5,  total: 10, date: '7 mars'  },
];

const subjectColor = { 'Mathématiques': '#667eea', 'Physique': '#f5576c', 'Sciences Nat.': '#4facfe' };

export default function Progress() {
  const avgScore = Math.round(quizHistory.reduce((a, q) => a + (q.score / q.total) * 100, 0) / quizHistory.length);

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
          { label: 'Score moyen',       value: `${avgScore}%`, icon: Award,      bg: 'rgba(79,122,248,0.1)',  color: '#4f7af8', trend: '↑ +4% ce mois' },
          { label: 'Quiz complétés',    value: '35',           icon: CheckCircle, bg: 'rgba(46,213,115,0.1)', color: '#2ed573', trend: '↑ 5 ce mois' },
          { label: 'Heures de révision',value: '42h',          icon: Clock,      bg: 'rgba(255,165,2,0.1)',  color: '#ffa502', trend: '↑ +6h' },
          { label: 'Chapitres maîtrisés',value: '14/24',       icon: TrendingUp, bg: 'rgba(161,140,209,0.1)',color: '#a18cd1', trend: '+3 ce mois' },
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
            {subjects.map(s => (
              <div key={s.name}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{s.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.name}</span>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.quizzes} quiz</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Moy: <strong style={{ color: s.color }}>{s.score}%</strong></span>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: s.color }}>{s.progress}%</span>
                      </div>
                    </div>
                    <div className="progress-track progress-track-lg">
                      <div className="progress-fill" style={{ width: `${s.progress}%`, background: s.gradient }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Global ring */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1.5rem',
            marginTop: '1.75rem', padding: '1.25rem',
            borderRadius: 'var(--r-lg)',
            background: 'rgba(79,122,248,0.05)',
            border: '1px solid rgba(79,122,248,0.12)',
          }}>
            <ProgressRing percent={75} size={90} strokeWidth={10} color="#6366f1" label="75%" sublabel="global" />
            <div>
              <p style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.25rem' }}>Progression globale : 75%</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                À ce rythme, vous serez prêt pour le Bac. Continuez à maintenir 3h de révision par jour.
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
    </div>
  );
}
