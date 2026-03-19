import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, CheckCircle, Download, Search, ChevronDown, BookMarked } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../apiConfig';
import PdfModal from '../components/PdfModal';

const BACKEND_URL = 'http://localhost:8000';

export default function Courses() {
  const { user } = useAuth();
  const series = user?.series ?? 'C';
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [viewerPdf, setViewerPdf] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchLibrary(); }, [series]);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('bac_token');
      const res = await fetch(`${API_BASE_URL}/courses/library?series=${series}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.subjects && data.subjects.length > 0) {
        setSubjects(data.subjects);
        setActiveId(data.subjects[0].id);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleLessonClick = async (lesson) => {
    if (lesson.pdf_url) {
      setViewerPdf({ url: lesson.pdf_url, title: lesson.title });
      try {
        const token = localStorage.getItem('bac_token');
        await fetch(`${API_BASE_URL}/courses/lesson-progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ lesson_id: lesson.id, progress_percent: 100 })
        });
        fetchLibrary();
      } catch (err) { }
    } else {
      navigate(`/courses/lesson/${lesson.id}`);
    }
  };

  if (loading) return (
    <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
      <BookOpen size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
      <div>Chargement des cours...</div>
    </div>
  );

  if (!subjects.length) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
      Aucun cours disponible pour la série {series}.
    </div>
  );

  const current = subjects.find(s => s.id === activeId) ?? subjects[0];
  const chapters = (current.chapters || []).filter(ch => ch.title.toLowerCase().includes(search.toLowerCase()));
  const lessons = (current.lessons || []).filter(l => l.title.toLowerCase().includes(search.toLowerCase()));
  const hasChapters = chapters.length > 0;
  const hasLessons = lessons.length > 0;

  return (
    <div>
      <div className="page-hero">
        <div>
          <h1 className="page-title">Bibliothèque de Cours</h1>
          <p className="page-subtitle">Programme officiel — <strong>Série {series}</strong> · Mauritanie</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Rechercher une leçon ou un cours..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', outline: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', fontSize: '0.9rem' }}
        />
      </div>

      {/* Subject tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {subjects.map(s => (
          <button key={s.id} onClick={() => setActiveId(s.id)} style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.6rem 1.25rem', borderRadius: '50px', border: 'none',
            cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.2s ease',
            background: activeId === s.id ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
            color: activeId === s.id ? 'white' : '#475569',
            boxShadow: activeId === s.id ? '0 8px 20px rgba(102,126,234,0.35)' : '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <span>📚</span>{s.name}
            <span style={{ padding: '2px 9px', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 800, background: activeId === s.id ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: activeId === s.id ? 'white' : '#64748b' }}>
              {(s.chapters?.length ?? 0) + (s.lessons?.length ?? 0)}
            </span>
          </button>
        ))}
      </div>

      {/* Two-column grid: Chapitres + Leçons */}
      <div style={{ display: 'grid', gridTemplateColumns: hasChapters && hasLessons ? '1fr 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>

        {/* ── CHAPITRES ── */}
        {hasChapters && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 6, height: 26, background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: '3px' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>📂 Chapitres</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {chapters.map(ch => (
                <div key={ch.id}
                  onClick={() => ch.pdf_url && window.open(`${BACKEND_URL}${ch.pdf_url}`, '_blank')}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem 1.25rem', background: 'white', borderRadius: '16px', border: '1px solid #e8edf5', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', cursor: ch.pdf_url ? 'pointer' : 'default', transition: 'all 0.25s' }}
                  onMouseOver={e => { if (ch.pdf_url) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.08)'; } }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}
                >
                  <div style={{ width: 46, height: 46, borderRadius: '12px', flexShrink: 0, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookMarked size={22} style={{ color: '#d97706' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{ch.title}</div>
                    {ch.description && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>{ch.description}</div>}
                    {ch.pdf_url && (
                      <div style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: 600, marginTop: '0.25rem' }}>📄 Fichier de cours disponible</div>
                    )}
                  </div>
                  <ChevronDown size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LEÇONS ── */}
        {(hasLessons || !hasChapters) && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 6, height: 26, background: current.gradient || 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '3px' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>🎓 Leçons & Cours</h2>
            </div>
            {lessons.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '16px', border: '1px solid #e8edf5' }}>
                Aucune leçon disponible pour cette matière.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {lessons.map(lesson => {
                  const progress = lesson.progress || 0;
                  return (
                    <div key={lesson.id} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e8edf5', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden', transition: 'all 0.25s', position: 'relative' }}
                      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.08)'; }}
                      onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}
                    >
                      {progress > 0 && <div style={{ position: 'absolute', top: 0, left: 0, height: '3px', width: `${progress}%`, background: current.gradient || 'linear-gradient(135deg,#667eea,#764ba2)' }} />}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem 1.25rem 0.75rem' }}>
                        <div style={{ width: 46, height: 46, borderRadius: '12px', flexShrink: 0, background: 'rgba(102,126,234,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={22} style={{ color: '#667eea' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{lesson.title}</span>
                            {progress === 100 && <CheckCircle size={14} style={{ color: '#22c55e' }} />}
                          </div>
                          {lesson.description && <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.2rem' }}>{lesson.description}</div>}
                        </div>
                        <ChevronDown size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.25rem 1rem', borderTop: '1px solid #f1f5f9' }}>
                        <button onClick={() => handleLessonClick(lesson)}
                          style={{ flex: 1, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', borderRadius: '10px', border: 'none', background: '#f1f5f9', color: '#667eea', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                          onMouseOver={e => e.currentTarget.style.background = '#e0e7ff'} onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}>
                          <BookOpen size={15} /> Lire
                        </button>
                        {lesson.pdf_url && (
                          <button onClick={e => { e.stopPropagation(); const a = document.createElement('a'); a.href = `${BACKEND_URL}${lesson.pdf_url}`; a.download = lesson.title + '.pdf'; document.body.appendChild(a); a.click(); document.body.removeChild(a); }}
                            style={{ padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                            onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                            <Download size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {viewerPdf && <PdfModal url={viewerPdf.url} title={viewerPdf.title} onClose={() => setViewerPdf(null)} />}
    </div>
  );
}
