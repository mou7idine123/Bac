import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, FileText, CheckCircle, BookOpen, Download, ExternalLink, Link as LinkIcon, Sparkles, Search } from 'lucide-react';
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
  const [expanded, setExpanded] = useState(null);
  const [viewerPdf, setViewerPdf] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLibrary();
  }, [series]);

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const current = subjects.find(s => s.id === activeId) ?? subjects[0];

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
        fetchLibrary(); // Corrected from fetchSubjects
      } catch (err) { }
    } else {
      navigate(`/courses/lesson/${lesson.id}`);
    }
  };


  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
        <BookOpen size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
        <div>Chargement des cours...</div>
      </div>
    );
  }

  if (!subjects.length || !current) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Aucun cours disponible pour la série {series}.</div>;
  }

  return (
    <div>
      <div className="page-hero">
        <div>
          <h1 className="page-title">Bibliothèque de Cours</h1>
          <p className="page-subtitle">
            Programme officiel — <strong>Série {series}</strong> · Mauritanie
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Rechercher une leçon ou un cours..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '14px', border: '1px solid var(--border-soft)', background: 'white', outline: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
          />
        </div>
      </div>

      {/* Subject tabs */}
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', flexWrap: 'wrap', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {subjects.map(s => (
          <button
            key={s.id}
            onClick={() => { setActiveId(s.id); setExpanded(null); }}
            className="anim-fade-in"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.65rem 1.25rem', borderRadius: '14px',
              border: '1px solid transparent', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
              transition: 'var(--t)',
              background: activeId === s.id ? s.gradient : 'white',
              color: activeId === s.id ? 'white' : 'var(--text-secondary)',
              boxShadow: activeId === s.id ? `0 8px 20px ${s.color}40` : '0 4px 12px rgba(0,0,0,0.03)',
              border: activeId === s.id ? 'none' : '1px solid #e2e8f0',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{s.emoji || '📚'}</span>
            {s.name}
            <span style={{
              padding: '2px 8px', borderRadius: 'var(--r-full)',
              fontSize: '0.7rem', fontWeight: 800,
              background: activeId === s.id ? 'rgba(255,255,255,0.25)' : s.bg || 'rgba(0,0,0,0.05)',
              color: activeId === s.id ? 'white' : s.color || 'var(--text-muted)',
            }}>{s.lessons?.length ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Lessons and Sheets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Lessons Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ width: 8, height: 28, background: current.gradient, borderRadius: '4px' }}></div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>📚 Leçons & Cours</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {current.lessons.filter(l => l.title.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1/-1' }}>
                Aucune leçon trouvée pour "{search}".
              </div>
            ) : (
              current.lessons.filter(l => l.title.toLowerCase().includes(search.toLowerCase())).map((lesson, idx) => {
                const lessonProgress = (lesson.progress || 0);
                return (
                  <div key={lesson.id}
                    style={{
                      display: 'flex', flexDirection: 'column', padding: '1.25rem',
                      background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.06)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)'; }}
                  >
                    {/* Inner Progress Bar */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', width: `${lessonProgress}%`, background: current.gradient, opacity: 0.6 }}></div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: current.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={22} style={{ color: current.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {lesson.title}
                          </h3>
                          {lessonProgress === 100 && <CheckCircle size={14} style={{ color: '#22c55e' }} />}
                        </div>
                        {lesson.description && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {lesson.description}
                          </div>
                        )}
                        {lessonProgress > 0 && (
                          <div style={{ marginTop: '0.4rem' }}>
                            <span className="badge" style={{ background: lessonProgress === 100 ? '#d1fae5' : '#e0e7ff', color: lessonProgress === 100 ? '#059669' : '#4f46e5', fontSize: '0.7rem' }}>{lessonProgress}% complété</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                      <button onClick={(e) => { e.stopPropagation(); handleLessonClick(lesson); }} style={{ flex: 1, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', borderRadius: '8px', border: 'none', background: current.bg, color: current.color, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--t)' }} onMouseOver={e => e.currentTarget.style.filter = 'brightness(0.95)'} onMouseOut={e => e.currentTarget.style.filter = 'none'}>
                        <BookOpen size={16} /> Lire
                      </button>
                      {lesson.pdf_url && (
                        <button onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement('a');
                          link.href = `${BACKEND_URL}${lesson.pdf_url}`;
                          link.target = '_blank';
                          link.download = lesson.title + '.pdf';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }} style={{ flex: 1, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--t)' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                          <Download size={16} /> Télécharger
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Revision Sheets Section */}
        {current.sheets && current.sheets.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: 8, height: 28, background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '4px' }}></div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>📋 Fiches de révision</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {current.sheets.map((sheet) => (
                <div key={sheet.id} className="card" onClick={() => sheet.pdf_url && window.open(`${BACKEND_URL}${sheet.pdf_url}`, '_blank')}
                  style={{
                    padding: '1.25rem', cursor: 'pointer', transition: 'var(--t)',
                    border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: '1rem'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={22} style={{ color: '#d97706' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>{sheet.title}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Résumé & Essentiel</p>
                  </div>
                  <ExternalLink size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {viewerPdf && (
        <PdfModal
          url={viewerPdf.url}
          title={viewerPdf.title}
          onClose={() => setViewerPdf(null)}
        />
      )}
    </div>
  );
}
