import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Award } from 'lucide-react';
import { API_BASE_URL } from '../../apiConfig';

const newEmptyQuiz = (series = 'both') => ({
  id: null,
  title: '',
  subject_id: '',
  series,
  difficulty: 'medium',
  time_limit_minutes: 20,
  questions: []
});

const newEmptyQuestion = () => ({
  question_text: '',
  explanation: '',
  answers: [
    { answer_text: '', is_correct: 1 },
    { answer_text: '', is_correct: 0 },
    { answer_text: '', is_correct: 0 },
    { answer_text: '', is_correct: 0 },
  ]
});

const DIFF_LABELS = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' };
const DIFF_COLORS = { easy: '#16a34a', medium: '#ca8a04', hard: '#dc2626' };

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSeries, setSeries] = useState('C');
  const [subjects, setSubjects] = useState([]);

  const [view, setView] = useState(null); // null | 'form'
  const [formData, setFormData] = useState(newEmptyQuiz('C'));
  const [formLoading, setFL] = useState(false);
  const [formError, setFE] = useState('');

  // ── fetch list ──────────────────────────────────────────────
  useEffect(() => {
    fetchQuizzes();
    fetchSubjects();
  }, [selectedSeries]);

  const token = () => localStorage.getItem('bac_token');

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/quizzes?series=${selectedSeries}`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      const data = await res.json();
      setQuizzes(data.success ? data.quizzes : []);
    } catch { setQuizzes([]); }
    finally { setLoading(false); }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/subjects?series=${selectedSeries}`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      const data = await res.json();
      if (data.subjects) setSubjects(data.subjects);
    } catch { }
  };

  // ── open edit form (load full quiz) ─────────────────────────
  const handleEdit = async (quiz) => {
    setFE('');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/quizzes/${quiz.id}`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      const data = await res.json();
      if (data.success) {
        // Normalise answers so each question always has 4 answers
        const q = data.quiz;
        q.questions = (q.questions || []).map(question => {
          while (question.answers.length < 4)
            question.answers.push({ answer_text: '', is_correct: 0 });
          return question;
        });
        setFormData(q);
        setView('form');
      } else {
        alert(data.error || 'Erreur chargement');
      }
    } catch { alert('Erreur réseau'); }
  };

  // ── delete ───────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce QCM définitivement ?')) return;
    try {
      await fetch(`${API_BASE_URL}/admin/quizzes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` }
      });
      fetchQuizzes();
    } catch { }
  };

  // ── question helpers ─────────────────────────────────────────
  const addQuestion = () =>
    setFormData(f => ({ ...f, questions: [...f.questions, newEmptyQuestion()] }));

  const removeQuestion = (qi) =>
    setFormData(f => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }));

  const setQText = (qi, text) =>
    setFormData(f => {
      const qs = [...f.questions];
      qs[qi] = { ...qs[qi], question_text: text };
      return { ...f, questions: qs };
    });

  const setQExplanation = (qi, text) =>
    setFormData(f => {
      const qs = [...f.questions];
      qs[qi] = { ...qs[qi], explanation: text };
      return { ...f, questions: qs };
    });

  const setAText = (qi, ai, text) =>
    setFormData(f => {
      const qs = [...f.questions];
      const as = [...qs[qi].answers];
      as[ai] = { ...as[ai], answer_text: text };
      qs[qi] = { ...qs[qi], answers: as };
      return { ...f, questions: qs };
    });

  const setCorrect = (qi, ai) =>
    setFormData(f => {
      const qs = [...f.questions];
      const as = qs[qi].answers.map((a, i) => ({ ...a, is_correct: i === ai ? 1 : 0 }));
      qs[qi] = { ...qs[qi], answers: as };
      return { ...f, questions: qs };
    });

  // ── submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFL(true); setFE('');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setView(null);
        setFormData(newEmptyQuiz(selectedSeries));
        fetchQuizzes();
      } else {
        setFE(data.error || 'Erreur inconnue');
      }
    } catch { setFE('Erreur de connexion'); }
    finally { setFL(false); }
  };

  // ── FORM view ────────────────────────────────────────────────
  if (view === 'form') {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {formData.id ? '✏️ Modifier le QCM' : '➕ Nouveau QCM'}
          </h2>
          <button onClick={() => setView(null)} style={iconBtn}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Meta */}
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={fld}>
              <label style={lbl}>Titre</label>
              <input type="text" value={formData.title}
                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                style={inp} required />
            </div>
            <div style={fld}>
              <label style={lbl}>Matière</label>
              <select value={formData.subject_id}
                onChange={e => setFormData(f => ({ ...f, subject_id: e.target.value }))}
                style={inp} required>
                <option value="">Sélectionner...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div style={fld}>
              <label style={lbl}>Série</label>
              <select value={formData.series}
                onChange={e => setFormData(f => ({ ...f, series: e.target.value }))}
                style={inp}>
                <option value="C">Série C</option>
                <option value="D">Série D</option>
                <option value="both">C & D (les deux)</option>
              </select>
            </div>
            <div style={fld}>
              <label style={lbl}>Difficulté</label>
              <select value={formData.difficulty}
                onChange={e => setFormData(f => ({ ...f, difficulty: e.target.value }))}
                style={inp}>
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
              </select>
            </div>
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem' }}>
              Questions <span style={{ color: 'var(--primary)', fontWeight: 900 }}>({formData.questions.length})</span>
            </h3>
            <button type="button" onClick={addQuestion} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              <Plus size={15} /> Ajouter
            </button>
          </div>

          {formData.questions.map((q, qi) => (
            <div key={qi} className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <span style={{ fontWeight: 800, color: '#8b5cf6' }}>Question {qi + 1}</span>
                <button type="button" onClick={() => removeQuestion(qi)} style={{ ...iconBtn, color: '#ef4444' }}>
                  <Trash2 size={16} />
                </button>
              </div>
              <textarea
                placeholder="Texte de la question..."
                value={q.question_text}
                onChange={e => setQText(qi, e.target.value)}
                style={{ ...inp, minHeight: 70, marginBottom: '0.6rem', resize: 'vertical' }}
                required
              />
              <textarea
                placeholder="Correction / Explication (s'affiche si mauvaise réponse)..."
                value={q.explanation || ''}
                onChange={e => setQExplanation(qi, e.target.value)}
                style={{ ...inp, minHeight: 60, marginBottom: '1rem', resize: 'vertical', fontSize: '0.82rem', borderColor: '#e2e8f0' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
                {q.answers.map((a, ai) => (
                  <div key={ai} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: a.is_correct ? '#f0fdf4' : '#f8fafc', padding: '0.5rem 0.7rem', borderRadius: 8, border: `1px solid ${a.is_correct ? '#bbf7d0' : '#e2e8f0'}` }}>
                    <input type="radio" name={`correct-${qi}`}
                      checked={a.is_correct === 1}
                      onChange={() => setCorrect(qi, ai)}
                      title="Bonne réponse"
                      style={{ cursor: 'pointer', accentColor: '#16a34a' }}
                    />
                    <input type="text"
                      placeholder={`Réponse ${ai + 1}`}
                      value={a.answer_text}
                      onChange={e => setAText(qi, ai, e.target.value)}
                      style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.88rem' }}
                      required
                    />
                    {a.is_correct === 1 && <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {formError && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: 8, fontWeight: 600 }}>
              {formError}
            </div>
          )}

          <button type="submit" disabled={formLoading} className="btn btn-primary"
            style={{ padding: '0.9rem', fontSize: '1rem', background: 'linear-gradient(135deg,#8b5cf6,#d946ef)' }}>
            {formLoading ? 'Enregistrement...' : (formData.id ? 'Mettre à jour le QCM' : 'Sauvegarder le QCM')}
          </button>
        </form>
      </div>
    );
  }

  // ── LIST view ────────────────────────────────────────────────
  const filtered = quizzes.filter(q =>
    q.title?.toLowerCase().includes(search.toLowerCase()) ||
    q.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>QCM</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
            {quizzes.length} quiz{quizzes.length !== 1 ? 's' : ''} · Série {selectedSeries}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <select value={selectedSeries} onChange={e => setSeries(e.target.value)}
            style={{ padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid #e2e8f0', fontWeight: 600 }}>
            <option value="C">Série C</option>
            <option value="D">Série D</option>
          </select>
          <button onClick={() => { setFormData(newEmptyQuiz(selectedSeries)); setView('form'); }}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg,#8b5cf6,#d946ef)' }}>
            <Plus size={18} /> Nouveau QCM
          </button>
        </div>
      </div>

      {/* Table card */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Search toolbar */}
        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Rechercher un QCM..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.4rem', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            {quizzes.length === 0
              ? 'Aucun QCM créé pour le moment. Cliquez sur « Nouveau QCM » pour commencer.'
              : 'Aucun résultat pour votre recherche.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                {['Titre', 'Matière', 'Séries', 'Questions', 'Niveau', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '1rem 1.2rem', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((q, i) => (
                <tr key={q.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '1rem 1.2rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{q.title}</div>
                  </td>
                  <td style={{ padding: '1rem 1.2rem', fontSize: '0.85rem', color: '#475569' }}>{q.subject}</td>
                  <td style={{ padding: '1rem 1.2rem' }}>
                    <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 20, background: '#ede9fe', color: '#7c3aed', fontSize: '0.72rem', fontWeight: 700 }}>
                      {q.series === 'both' ? 'C & D' : `Série ${q.series}`}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#8b5cf6' }}>
                      <Award size={14} /> {q.questions_count ?? 0}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.2rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: 6, background: `${DIFF_COLORS[q.difficulty] || '#64748b'}18`, color: DIFF_COLORS[q.difficulty] || '#64748b', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                      {DIFF_LABELS[q.difficulty] || q.difficulty}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.2rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(q)}
                        style={{ ...iconBtn, background: '#f0f4ff', color: '#4f7af8' }}
                        title="Modifier">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(q.id)}
                        style={{ ...iconBtn, background: '#fee2e2', color: '#ef4444' }}
                        title="Supprimer">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const fld = { display: 'flex', flexDirection: 'column', gap: '0.3rem' };
const lbl = { fontSize: '0.8rem', fontWeight: 700, color: '#64748b' };
const inp = { padding: '0.65rem 0.8rem', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', width: '100%' };
const iconBtn = { background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.4rem 0.5rem', borderRadius: 7, display: 'flex', alignItems: 'center' };
