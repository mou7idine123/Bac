import React, { useState, useEffect } from 'react';
import { Clock, CheckSquare, Award, Play, X, ChevronRight, FileSearch, Search, CheckCircle, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../apiConfig';

const difficultyConfig = {
  'easy': { color: '#16a34a', bg: 'rgba(46,213,115,0.12)', label: 'Facile' },
  'medium': { color: '#ca8a04', bg: 'rgba(255,165,2,0.12)', label: 'Moyen' },
  'hard': { color: '#dc2626', bg: 'rgba(255,71,87,0.12)', label: 'Difficile' },
};

function QuizSession({ quiz, onClose }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const questions = quiz.questions || [];
  const q = questions[current];
  const total = questions.length;
  const progress = ((current) / total) * 100;

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (q.answers[idx].is_correct === 1) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= total) { setDone(true); return; }
    setCurrent(c => c + 1);
    setSelected(null);
    setAnswered(false);
  };

  if (!q) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(15,20,50,0.5)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div className="card anim-scale-in" style={{ width: '100%', maxWidth: 560, padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Question {current + 1}/{total}
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem', fontFamily: 'var(--font-display)' }}>{quiz.title}</h3>
          </div>
          <button className="btn btn-glass btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="progress-track progress-track-lg" style={{ marginBottom: '1.5rem' }}>
          <div className="progress-fill" style={{ width: `${progress}%`, background: 'var(--primary)', transition: 'width 0.5s ease' }} />
        </div>

        {!done ? (
          <>
            <p style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', lineHeight: 1.5 }}>{q.question_text}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
              {q.answers.map((opt, i) => (
                <button
                  key={i}
                  className={`option-btn${selected === i ? (opt.is_correct === 1 ? ' correct' : ' wrong') : ''}${answered && opt.is_correct === 1 && selected !== i ? ' correct' : ''}`}
                  onClick={() => handleSelect(i)}
                >
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(100,120,200,0.08)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700,
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt.answer_text}
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
  const { user } = useAuth();
  const series = user?.series ?? 'C';

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('Tous');
  const [availableSubjects, setAvailableSubjects] = useState(['Tous']);

  useEffect(() => { fetchQuizzes(); }, [series]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('bac_token');
      const res = await fetch(`${API_BASE_URL}/courses/quizzes?series=${series}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setQuizzes(data.quizzes);
        const subjectsList = ['Tous', ...new Set(data.quizzes.map(q => q.subject))].sort();
        setAvailableSubjects(subjectsList);
      }
      else setQuizzes([]);
    } catch (err) { console.error('QCM fetch error:', err); } finally { setLoading(false); }
  };

  const toggleQuizDone = async (e, quiz) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('bac_token');
      const newStatus = quiz.is_completed ? 'not_started' : 'completed';

      const res = await fetch(`${API_BASE_URL}/progress/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ quiz_id: quiz.id, status: newStatus })
      });
      if (res.ok) {
        setQuizzes(prev => prev.map(item => item.id === quiz.id ? { ...item, is_completed: newStatus === 'completed' } : item));
      }
    } catch (err) { console.error('Erreur progression quiz', err); }
  };

  const startQuiz = async (id) => {
    try {
      const token = localStorage.getItem('bac_token');
      const res = await fetch(`${API_BASE_URL}/courses/quizzes?id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setActiveSession(data.quiz);
      else alert('Erreur: ' + (data.error || 'Introuvable'));
    } catch (err) { alert('Erreur chargement quiz'); }
  };

  return (
    <div>
      <div className="page-hero">
        <div>
          <h1 className="page-title">QCM & Auto-évaluation</h1>
          <p className="page-subtitle">Testez vos connaissances en temps réel · Série {series}</p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Rechercher un QCM..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '14px', border: '1px solid var(--border-soft)', background: 'white', outline: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
          />
        </div>
        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          style={{ padding: '0.8rem 1rem', borderRadius: '14px', border: '1px solid var(--border-soft)', background: 'white', outline: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', minWidth: 200 }}
        >
          {availableSubjects.map(s => <option key={s} value={s}>{s === 'Tous' ? 'Toutes les matières' : s}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileSearch size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <div>Chargement des quiz...</div>
        </div>
      ) : (
        <div className="grid stagger anim-fade-up" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {quizzes.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px', border: '1px solid var(--border-soft)', color: 'var(--text-muted)' }}>
              Aucun QCM disponible pour le moment.
            </div>
          ) : (
            quizzes.filter(q => {
              const matchSubject = filterSubject === 'Tous' || q.subject === filterSubject;
              const matchSearch = q.title.toLowerCase().includes(search.toLowerCase());
              return matchSubject && matchSearch;
            }).map(quiz => {
              const diff = difficultyConfig[quiz.difficulty] || difficultyConfig.medium;
              const accentColor = '#8b5cf6';

              return (
                <div key={quiz.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: 4, background: `linear-gradient(90deg, ${accentColor}, #d946ef)` }} />
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{
                        fontSize: '1.5rem', width: 44, height: 44, borderRadius: 12,
                        background: `${accentColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor
                      }}>🏆</div>
                      <span style={{
                        padding: '0.25rem 0.65rem', borderRadius: 'var(--r-full)',
                        fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                        background: diff.bg, color: diff.color,
                      }}>{diff.label}</span>
                    </div>
                    <div style={{ marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.75rem', color: accentColor, fontWeight: 800 }}>{quiz.subject}</span>
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1rem', lineHeight: 1.4, color: 'var(--text-primary)' }}>{quiz.title}</h3>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderTop: '1px solid var(--border-soft)', paddingTop: '0.85rem', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        <Clock size={14} /> {quiz.time_limit_minutes} min
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        <CheckSquare size={14} /> {quiz.questions_count} questions
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1, justifyContent: 'center', background: `linear-gradient(135deg, ${accentColor}, #7c3aed)` }}
                        onClick={() => startQuiz(quiz.id)}
                      >
                        <Play size={15} /> Démarrer
                      </button>
                      <button
                        onClick={(e) => toggleQuizDone(e, quiz)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          padding: '0.65rem 1rem',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          border: 'none',
                          background: quiz.is_completed
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : 'rgba(243, 244, 246, 0.7)',
                          color: quiz.is_completed ? 'white' : '#6b7280',
                          boxShadow: quiz.is_completed
                            ? '0 4px 12px rgba(16, 185, 129, 0.25)'
                            : 'none',
                          transform: quiz.is_completed ? 'scale(1.02)' : 'scale(1)',
                        }}
                        onMouseOver={(e) => {
                          if (!quiz.is_completed) e.currentTarget.style.background = 'rgba(229, 231, 235, 0.9)';
                          e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                        }}
                        onMouseOut={(e) => {
                          if (!quiz.is_completed) e.currentTarget.style.background = 'rgba(243, 244, 246, 0.7)';
                          e.currentTarget.style.transform = quiz.is_completed ? 'scale(1.02)' : 'scale(1)';
                        }}
                      >
                        {quiz.is_completed ? (
                          <>
                            <CheckCircle size={16} fill="rgba(255,255,255,0.2)" />
                            <span>Validé</span>
                          </>
                        ) : (
                          <>
                            <Circle size={16} />
                            <span>Marquer fait</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Exam simulation banner */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
        borderRadius: '20px', padding: '2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem',
        boxShadow: '0 10px 30px rgba(139, 92, 246, 0.25)',
        color: 'white'
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Prêt pour l'Examen ?
          </h2>
          <p style={{ opacity: 0.9, maxWidth: 500, fontSize: '0.9rem', lineHeight: 1.55 }}>
            Nos QCM sont conçus pour refléter la difficulté réelle du baccalauréat mauritanien. Testez-vous régulièrement pour identifier vos points faibles.
          </p>
        </div>
        <button style={{
          background: 'white', color: '#8b5cf6', fontWeight: 800,
          padding: '0.8rem 1.8rem', borderRadius: '12px', border: 'none',
          cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          Simuler Bac complet
        </button>
      </div>

      {activeSession && <QuizSession quiz={activeSession} onClose={() => setActiveSession(null)} />}
    </div>
  );
}
