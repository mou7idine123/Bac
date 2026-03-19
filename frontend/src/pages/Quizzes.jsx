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
  const progress = ((current + (answered ? 1 : 0)) / total) * 100;

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (q.answers[idx].is_correct === 1) setScore(s => s + 1);
  };

  const handleNext = async () => {
    if (current + 1 >= total) {
      // Auto-validation: if score is 100%, mark as completed
      const finalScore = score; // The score has already been updated in handleSelect
      if (finalScore === total) {
        try {
          const token = localStorage.getItem('bac_token');
          await fetch(`${API_BASE_URL}/progress/quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ quiz_id: quiz.id, status: 'completed' })
          });
        } catch (err) { console.error('Auto-validation error:', err); }
      }
      setDone(true);
      return;
    }
    setCurrent(c => c + 1);
    setSelected(null);
    setAnswered(false);
  };

  if (!q && !done) return null;

  const optionColors = ['#4f7af8', '#764ba2', '#f59e0b', '#ef4444'];
  const optionLetters = ['A', 'B', 'C', 'D'];

  const getOptionStyle = (opt, i) => {
    const base = {
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '1.1rem 1.25rem', borderRadius: '16px',
      border: '2px solid', cursor: answered ? 'default' : 'pointer',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      fontWeight: 600, fontSize: '0.97rem', lineHeight: 1.4,
      textAlign: 'left', width: '100%', fontFamily: 'var(--font-sans)',
      background: 'white',
    };

    if (!answered) {
      return { ...base, borderColor: '#e2e8f0', color: '#1e293b' };
    }
    if (opt.is_correct === 1) {
      return { ...base, borderColor: '#10b981', background: '#ecfdf5', color: '#065f46' };
    }
    if (selected === i) {
      return { ...base, borderColor: '#ef4444', background: '#fef2f2', color: '#7f1d1d' };
    }
    return { ...base, borderColor: '#e2e8f0', color: '#94a3b8', opacity: 0.6 };
  };

  const getLetterStyle = (opt, i) => {
    const base = {
      width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.85rem', fontWeight: 800, transition: 'all 0.25s',
    };
    if (!answered) {
      return { ...base, background: `${optionColors[i]}15`, color: optionColors[i] };
    }
    if (opt.is_correct === 1) {
      return { ...base, background: '#10b981', color: 'white' };
    }
    if (selected === i) {
      return { ...base, background: '#ef4444', color: 'white' };
    }
    return { ...base, background: '#f1f5f9', color: '#94a3b8' };
  };

  const pct = Math.round((score / total) * 100);
  const emoji = pct === 100 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '📖' : '💪';
  const msg = pct === 100 ? 'Score parfait ! Bravo !' : pct >= 70 ? 'Très bien joué !' : pct >= 50 ? 'Bien, continue à réviser.' : 'Courage, l\'IA peut t\'aider !';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      /* Match the app's background with a semi-transparent overlay */
      background: 'linear-gradient(135deg, rgba(79,122,248,0.08) 0%, rgba(118,75,162,0.06) 50%, rgba(161,140,209,0.08) 100%)',
      backdropFilter: 'blur(32px)',
      WebkitBackdropFilter: 'blur(32px)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Decorative blobs matching app style */}
      <div style={{
        position: 'fixed', top: '-15%', right: '-10%',
        width: '50vw', height: '50vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,122,248,0.15) 0%, transparent 60%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-15%', left: '-10%',
        width: '60vw', height: '60vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(161,140,209,0.12) 0%, transparent 60%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Top bar */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1.25rem 1.5rem',
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.7)',
        boxShadow: '0 2px 12px rgba(100,120,200,0.08)',
        flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{
            width: 40, height: 40, borderRadius: '12px',
            background: 'rgba(100,120,200,0.08)',
            border: '1px solid rgba(200,210,240,0.5)',
            color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s ease',
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,71,87,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(100,120,200,0.08)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <X size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 6 }}>
            {quiz.title}
          </div>
          <div style={{ height: 6, background: 'rgba(100,120,200,0.12)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
              width: `${done ? 100 : progress}%`,
              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 0 8px rgba(79,122,248,0.4)',
            }} />
          </div>
        </div>
        {!done && (
          <div style={{
            fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)',
            background: 'var(--primary-soft)', padding: '0.3rem 0.85rem',
            borderRadius: 99, border: '1px solid rgba(79,122,248,0.15)',
            flexShrink: 0,
          }}>
            {current + 1}/{total}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '2rem 1.5rem', maxWidth: 680, margin: '0 auto', width: '100%',
        position: 'relative', zIndex: 1,
      }}>
        {!done ? (
          <div key={current} style={{ animation: 'fadeUp 0.35s ease both' }}>
            {/* Question */}
            <div style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.9)',
              borderRadius: '20px',
              padding: '1.75rem 2rem',
              marginBottom: '1.25rem',
              boxShadow: '0 8px 32px rgba(100,120,200,0.1), inset 0 1px 0 rgba(255,255,255,1)',
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.25rem 0.85rem', borderRadius: 99,
                background: 'var(--primary-soft)', color: 'var(--primary)',
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em',
                textTransform: 'uppercase', marginBottom: '1rem',
              }}>
                Question {current + 1}
              </div>
              <h2 style={{
                fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)', fontWeight: 800,
                color: 'var(--text-primary)', lineHeight: 1.55,
                fontFamily: 'var(--font-display)', margin: 0,
              }}>
                {q.question_text}
              </h2>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
              {q.answers.map((opt, i) => (
                <button
                  key={i}
                  style={{
                    ...getOptionStyle(opt, i),
                    animation: `fadeUp 0.35s ease ${i * 60}ms both`,
                  }}
                  onClick={() => handleSelect(i)}
                  onMouseOver={e => {
                    if (!answered) {
                      e.currentTarget.style.transform = 'translateY(-2px) translateX(4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,122,248,0.15)';
                      e.currentTarget.style.borderColor = 'rgba(79,122,248,0.4)';
                    }
                  }}
                  onMouseOut={e => {
                    if (!answered) {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(100,120,200,0.06)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }
                  }}
                >
                  <span style={getLetterStyle(opt, i)}>
                    {answered && opt.is_correct === 1 ? <CheckCircle size={16} /> : optionLetters[i]}
                  </span>
                  <span style={{ flex: 1 }}>{opt.answer_text}</span>
                </button>
              ))}
            </div>

            {/* Feedback & Explanation */}
            {answered && (
              <div style={{ animation: 'fadeUp 0.25s ease both' }}>
                <div style={{
                  padding: '0.9rem 1.2rem', borderRadius: '14px', marginBottom: '0.75rem',
                  background: q.answers[selected]?.is_correct === 1
                    ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1.5px solid ${q.answers[selected]?.is_correct === 1
                    ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
                  color: q.answers[selected]?.is_correct === 1 ? '#059669' : '#dc2626',
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  fontSize: '0.9rem', fontWeight: 700,
                }}>
                  <span style={{ fontSize: '1.2rem' }}>
                    {q.answers[selected]?.is_correct === 1 ? '✅' : '❌'}
                  </span>
                  {q.answers[selected]?.is_correct === 1 ? 'Bonne réponse ! Excellent travail.' : 'Mauvaise réponse. La bonne réponse est surlignée en vert.'}
                </div>

                {/* Explanation displayed automatically on wrong answer (or always if provided) */}
                {(q.answers[selected]?.is_correct !== 1 && q.explanation) && (
                  <div style={{
                    padding: '1.25rem', borderRadius: '16px', marginBottom: '1rem',
                    background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(100,120,200,0.15)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Explication / Correction
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                      {q.explanation}
                    </div>
                    <Link
                      to="/assistant"
                      state={{ prompt: `Explique-moi plus en détail cette question de QCM :\n\nQuestion : ${q.question_text}\nMa réponse : ${q.answers[selected]?.answer_text}\nLa bonne réponse est : ${q.answers.find(a => a.is_correct === 1)?.answer_text}\nExplication fournie : ${q.explanation}\n\nAide-moi à comprendre mon erreur.` }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', borderRadius: '10px',
                        background: 'var(--primary-soft)', color: 'var(--primary)',
                        fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none',
                        transition: 'all 0.2s', border: '1px solid rgba(79,122,248,0.2)'
                      }}
                      onMouseOver={e => { e.currentTarget.style.background = 'rgba(79,122,248,0.15)'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'var(--primary-soft)'; }}
                    >
                      ✨ Demander à l'IA une explication
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Next button */}
            {answered && (
              <button
                onClick={handleNext}
                style={{
                  padding: '1rem 1.5rem', borderRadius: '16px',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: 'white', border: 'none', cursor: 'pointer',
                  fontSize: '1rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '0 8px 28px rgba(79,122,248,0.4)',
                  transition: 'all 0.25s ease',
                  width: '100%',
                  animation: 'fadeUp 0.3s ease both',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(79,122,248,0.5)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(79,122,248,0.4)'; }}
              >
                {current + 1 >= total ? '🏁 Voir mon score' : 'Question suivante'}
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        ) : (
          /* Score screen */
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', gap: '1.75rem',
            animation: 'scaleIn 0.4s ease both',
          }}>
            <div style={{ fontSize: '5rem', lineHeight: 1 }}>{emoji}</div>

            <div style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.9)',
              borderRadius: '24px',
              padding: '2.5rem 3rem',
              boxShadow: '0 12px 40px rgba(100,120,200,0.12)',
              width: '100%', maxWidth: 420,
            }}>
              <div style={{
                fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: 900,
                fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1,
              }}>
                {score}<span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', fontWeight: 400 }}>/{total}</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>
                {msg}
              </div>

              {/* Score donut */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
                <div style={{
                  width: 90, height: 90, borderRadius: '50%',
                  background: `conic-gradient(var(--primary) ${pct * 3.6}deg, rgba(100,120,200,0.1) 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 70, height: 70, borderRadius: '50%', background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)',
                  }}>
                    {pct}%
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  style={{
                    flex: 1, padding: '0.85rem', borderRadius: '12px',
                    border: '1.5px solid var(--border-soft)', background: 'white',
                    color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.2s ease', fontSize: '0.9rem',
                  }}
                  onClick={onClose}
                  onMouseOver={e => { e.currentTarget.style.background = 'var(--primary-soft)'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'rgba(79,122,248,0.3)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-soft)'; }}
                >
                  Fermer
                </button>
                <Link
                  to="/assistant"
                  state={{ prompt: `Je viens de terminer le quiz "${quiz.title}". Mon score est de ${score}/${total} (${pct}%). Peux-tu m'aider à comprendre les sujets abordés dans ce quiz et me donner des conseils pour m'améliorer ?` }}
                  onClick={onClose}
                  style={{
                    flex: 1, padding: '0.85rem', borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    color: 'white', fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.2s ease', fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-btn)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  Demander à l'IA ✨
                </Link>
              </div>
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
                      
                      {quiz.is_completed && (
                        <div style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          padding: '0.65rem 1rem',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                        }}>
                          <CheckCircle size={16} fill="rgba(255,255,255,0.2)" />
                          <span>Validé</span>
                        </div>
                      )}
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
