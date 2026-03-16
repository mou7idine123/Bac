import React, { useState } from 'react';
import { Clock, CheckSquare, Award, Play, X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const quizzes = [
  { id: 1, title: 'Limites et Continuité', subject: 'Mathématiques', emoji: '📘', difficulty: 'Moyen',    time: 20, questions: 10, gradient: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#667eea' },
  { id: 2, title: 'Cinématique',           subject: 'Physique',       emoji: '⚛️',  difficulty: 'Difficile', time: 30, questions: 15, gradient: 'linear-gradient(135deg,#f093fb,#f5576c)', color: '#f5576c' },
  { id: 3, title: 'La Mitose',             subject: 'Sciences Nat',   emoji: '🌿',  difficulty: 'Facile',    time: 10, questions: 8,  gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', color: '#4facfe' },
  { id: 4, title: 'Fonctions Logarithmes', subject: 'Mathématiques',  emoji: '📘',  difficulty: 'Difficile', time: 25, questions: 12, gradient: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#667eea' },
  { id: 5, title: 'Optique Géométrique',   subject: 'Physique',       emoji: '⚛️',  difficulty: 'Moyen',    time: 20, questions: 10, gradient: 'linear-gradient(135deg,#f093fb,#f5576c)', color: '#f5576c' },
  { id: 6, title: 'Génétique Mendélienne', subject: 'Sciences Nat',   emoji: '🌿',  difficulty: 'Facile',    time: 15, questions: 10, gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', color: '#4facfe' },
];

const difficultyConfig = {
  'Facile':    { color: '#16a34a', bg: 'rgba(46,213,115,0.12)' },
  'Moyen':     { color: '#ca8a04', bg: 'rgba(255,165,2,0.12)' },
  'Difficile': { color: '#dc2626', bg: 'rgba(255,71,87,0.12)' },
};

// Mini Quiz Session
const sampleQuestions = [
  {
    text: 'Quelle est la limite de (sin x)/x quand x → 0 ?',
    options: ['0', '∞', '1', 'Non définie'],
    correct: 2,
  },
  {
    text: 'La dérivée de ln(x) est :',
    options: ['x', '1/x', 'ln(x)', '1'],
    correct: 1,
  },
];

function QuizSession({ quiz, onClose }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = sampleQuestions[current];
  const total = sampleQuestions.length;
  const progress = ((current) / total) * 100;

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= total) { setDone(true); return; }
    setCurrent(c => c + 1);
    setSelected(null);
    setAnswered(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(15,20,50,0.5)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div className="card anim-scale-in" style={{ width: '100%', maxWidth: 560, padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {quiz.subject} · Question {current + 1}/{total}
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem', fontFamily: 'var(--font-display)' }}>{quiz.title}</h3>
          </div>
          <button className="btn btn-glass btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Progress */}
        <div className="progress-track progress-track-lg" style={{ marginBottom: '1.5rem' }}>
          <div className="progress-fill" style={{ width: `${progress}%`, background: quiz.gradient, transition: 'width 0.5s ease' }} />
        </div>

        {!done ? (
          <>
            <p style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', lineHeight: 1.5 }}>{q.text}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  className={`option-btn${selected === i ? (i === q.correct ? ' correct' : ' wrong') : ''}${answered && i === q.correct && selected !== i ? ' correct' : ''}`}
                  onClick={() => handleSelect(i)}
                >
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(100,120,200,0.08)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700,
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={!answered}
              onClick={handleNext}
            >
              {current + 1 >= total ? 'Voir mon score' : 'Question suivante'} <ChevronRight size={16} />
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{score === total ? '🏆' : score >= total / 2 ? '🎉' : '📚'}</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Score : {score}/{total}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {score === total ? 'Parfait ! Excellente maîtrise.' : score >= total / 2 ? 'Bien joué ! Continue comme ça.' : 'Révisez ce chapitre avec l\'IA.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-glass" onClick={onClose}>Fermer</button>
              <Link to="/assistant" className="btn btn-primary" onClick={onClose}>Demander à l'IA</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Quizzes() {
  const [activeSession, setActiveSession] = useState(null);

  return (
    <div>
      <div className="page-hero">
        <div>
          <h1 className="page-title">Quiz & Exercices</h1>
          <p className="page-subtitle">Testez vos connaissances. Progressez chaque jour.</p>
        </div>
      </div>

      {/* Quiz grid */}
      <div className="grid stagger anim-fade-up" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {quizzes.map(quiz => {
          const diff = difficultyConfig[quiz.difficulty];
          return (
            <div key={quiz.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
              {/* Gradient top bar */}
              <div style={{ height: 4, background: quiz.gradient }} />
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{
                    fontSize: '2rem', width: 46, height: 46, borderRadius: 12,
                    background: `${quiz.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{quiz.emoji}</div>
                  <span style={{
                    padding: '0.25rem 0.65rem', borderRadius: 'var(--r-full)',
                    fontSize: '0.7rem', fontWeight: 700,
                    background: diff.bg, color: diff.color,
                  }}>{quiz.difficulty}</span>
                </div>
                <div style={{ marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', color: quiz.color, fontWeight: 700 }}>{quiz.subject}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.85rem', lineHeight: 1.35 }}>{quiz.title}</h3>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.1rem', borderTop: '1px solid var(--border-soft)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <Clock size={13} /> {quiz.time} min
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <CheckSquare size={13} /> {quiz.questions} questions
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setActiveSession(quiz)}
                >
                  <Play size={15} /> Démarrer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exam simulation banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4f7af8 0%, #764ba2 60%, #f093fb 100%)',
        borderRadius: 'var(--r-xl)', padding: '2rem 2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem',
        boxShadow: '0 8px 32px rgba(79,122,248,0.3)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <Award size={22} color="white" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: 'white' }}>
              Simulation Examen Blanc
            </h2>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 500, fontSize: '0.9rem', lineHeight: 1.55 }}>
            Passez un examen complet en conditions réelles, généré à partir des annales du Bac mauritanien.
          </p>
        </div>
        <button className="btn" style={{
          background: 'white', color: '#4f7af8', fontWeight: 700,
          padding: '0.75rem 1.75rem', borderRadius: 'var(--r-full)',
          flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}>
          Lancer une simulation
        </button>
      </div>

      {/* Quiz session modal */}
      {activeSession && <QuizSession quiz={activeSession} onClose={() => setActiveSession(null)} />}
    </div>
  );
}
