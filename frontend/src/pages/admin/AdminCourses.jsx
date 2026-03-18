import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Edit2, Trash2, Filter,
  FileText, CheckCircle, ArrowLeft,
  BookOpen, BarChart2, Sparkles
} from 'lucide-react';
import { API_BASE_URL } from '../../apiConfig';

const BACKEND_URL = 'http://localhost:8000';
const EMPTY_FORM = { title: '', description: '', subject_id: '', series: 'both', order_index: '0' };

export default function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // View states: null | 'add' | 'edit'
  const [view, setView] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null); // the lesson being edited

  const [subjects, setSubjects] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState('both');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [filterSeries, setFilterSeries] = useState('both');
  const [filterSubject, setFilterSubject] = useState('');

  const [formData, setFormData] = useState(EMPTY_FORM);
  // Files
  const [pdfFile, setPdfFile] = useState(null);
  const [existingPdf, setExistingPdf] = useState(null);

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // ── Fetch all ──────────────────────────────────────────────────
  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    fetchSubjects(view === 'add' || view === 'edit' ? selectedSeries : filterSeries);
  }, [selectedSeries, filterSeries, view]);



  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('bac_token');
      const res = await fetch(`${API_BASE_URL}/admin/courses`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setCourses(data.courses);
      else setError(data.error || 'Erreur inconnue');
    } catch { setError('Impossible de se connecter'); } finally { setLoading(false); }
  };

  const fetchSubjects = async (serie) => {
    try {
      const token = localStorage.getItem('bac_token');
      const res = await fetch(`${API_BASE_URL}/courses/subjects?series=${serie}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.subjects) setSubjects(data.subjects);
    } catch { }
  };



  // ── Open edit form ─────────────────────────────────────────────
  const handleEdit = async (course) => {
    try {
      const token = localStorage.getItem('bac_token');
      const res = await fetch(`${API_BASE_URL}/admin/courses/${course.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.lesson) {
        const l = data.lesson;
        setEditingCourse(l);
        setSelectedSeries(l.series === 'both' ? 'C' : l.series);
        setSelectedSubject(l.subject_id);
        setFormData({ title: l.title, description: l.description || '', subject_id: l.subject_id, series: l.series || 'both', order_index: l.order_index || '0' });
        setExistingPdf(l.pdf_url || null);
        setView('edit');
      }
    } catch (e) { alert('Erreur lors du chargement'); }
  };

  // ── Delete ─────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette leçon ?')) return;
    try {
      const token = localStorage.getItem('bac_token');
      await fetch(`${API_BASE_URL}/admin/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCourses();
    } catch { alert('Erreur lors de la suppression'); }
  };

  // ── Submit (add or edit) ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    const isEdit = view === 'edit';

    // --- Client-side validation ---
    if (!isEdit && !selectedSubject) {
      setFormError('Veuillez sélectionner une matière');
      setFormLoading(false);
      return;
    }
    if (!formData.title.trim()) {
      setFormError('Le titre du cours est obligatoire');
      setFormLoading(false);
      return;
    }
    // PDF is optional on edit (can keep existing), but required on add if none selected
    // (We allow no PDF — the course can still be text-only)

    try {
      const token = localStorage.getItem('bac_token');
      const url = isEdit
        ? `${API_BASE_URL}/admin/courses/${editingCourse.id}`
        : `${API_BASE_URL}/admin/courses`;

      const body = new FormData();
      body.append('title', formData.title);
      body.append('description', formData.description);
      body.append('subject_id', isEdit ? editingCourse.subject_id : selectedSubject);
      body.append('series', isEdit ? formData.series : selectedSeries);
      body.append('order_index', Number(formData.order_index) || 0);

      if (isEdit) {
        body.append('_method', 'PUT');
        if (existingPdf) body.append('existing_pdf_url', existingPdf);
      }
      if (pdfFile) body.append('pdf_file', pdfFile);

      const res = await fetch(url, {
        method: 'POST', // always POST when using FormData, _method takes care of PUT
        headers: { 'Authorization': `Bearer ${token}` },
        body: body,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        resetForm();
        fetchCourses();
      } else {
        setFormError(data.error || "Une erreur s'est produite");
      }
    } catch (err) {
      setFormError('Erreur de connexion : ' + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setView(null);
    setEditingCourse(null);
    setFormData(EMPTY_FORM);
    setPdfFile(null);
    setExistingPdf(null);
    setFormError('');
    setSelectedSubject('');
  };

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const filteredCourses = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subject?.toLowerCase().includes(search.toLowerCase());
    const matchSeries = filterSeries === 'both' || c.series === filterSeries || c.series === 'both';
    const matchSubject = filterSubject === '' || c.subject_id == filterSubject;
    return matchSearch && matchSeries && matchSubject;
  });

  // ── FORM PANEL ─────────────────────────────────────────────────
  if (view === 'add' || view === 'edit') {
    const isEdit = view === 'edit';
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <button onClick={resetForm} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Retour à la liste
        </button>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.5rem 0', fontFamily: 'var(--font-display)' }}>
          {isEdit ? `Modifier : ${editingCourse?.title}` : 'Ajouter un Cours (Leçon)'}
        </h1>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          {formError && (
            <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 500 }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Series + Subject — only for Add */}
            {!isEdit ? (
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={lbl}>Série</label>
                  <select value={selectedSeries} onChange={e => { setSelectedSeries(e.target.value); setSelectedSubject(''); }} style={sel} required>
                    <option value="C">Série C</option>
                    <option value="D">Série D</option>
                  </select>
                </div>

                <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={lbl}>Matière</label>
                  <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} style={{ ...sel, background: selectedSeries ? 'white' : '#e2e8f0' }} disabled={!selectedSeries} required>
                    <option value="">Sélectionner une matière...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={lbl}>Série de destination</label>
                  <select name="series" value={formData.series} onChange={handleChange} style={sel} required>
                    <option value="C">Série C</option>
                    <option value="D">Série D</option>
                    <option value="both">Les deux (C & D)</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={lbl}>Matière</label>
                  <input type="text" value={editingCourse?.subject || ''} style={{ ...inputStyle, background: '#f1f5f9' }} disabled />
                </div>
              </div>
            )}

            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={lbl}>Titre du cours</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Ex: Théorème de Pythagore" style={inputStyle} required />
            </div>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={lbl}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Ex: Ce cours couvre les bases de..." style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Fichier du cours (PDF)</label>

                {isEdit && existingPdf && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: '#f0fdf4', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                    <FileText size={14} /> Fichier Actuel
                    <button type="button" onClick={() => setExistingPdf(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Retirer</button>
                  </div>
                )}

                <input
                  type="file"
                  accept=".pdf"
                  onChange={e => setPdfFile(e.target.files[0])}
                  style={inputStyle}
                />
              </div>

              {/* Ordre */}
              <div style={{ width: '150px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={lbl}>Ordre</label>
                <div style={{ position: 'relative' }}>
                  <BarChart2 size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="number" name="order_index" value={formData.order_index} onChange={handleChange} min="0" style={{ ...inputStyle, paddingLeft: '2.5rem' }} />
                </div>
              </div>
            </div>
            <button type="submit" disabled={formLoading}
              style={{ padding: '0.9rem 1.5rem', background: 'linear-gradient(135deg,#4f7af8,#764ba2)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: formLoading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', fontSize: '0.92rem' }}>
              {formLoading ? 'Enregistrement...' : (isEdit ? '💾 Mettre à jour la leçon' : '✓ Enregistrer le cours')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-display)' }}>Gestion des Cours</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0 0', fontWeight: 500 }}>Créez, modifiez et organisez le contenu d'apprentissage.</p>
        </div>
        <button onClick={() => { resetForm(); setView('add'); }}
          style={{ background: 'linear-gradient(135deg, #4f7af8, #764ba2)', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(79,122,248,0.25)', cursor: 'pointer' }}>
          <Plus size={16} /> Ajouter un cours
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        {/* Search toolbar */}
        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Rechercher un cours..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }} />
          </div>

          <select value={filterSeries} onChange={e => { setFilterSeries(e.target.value); setFilterSubject(''); }}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, background: 'white' }}>
            <option value="both">Toutes les Séries</option>
            <option value="C">Série C</option>
            <option value="D">Série D</option>
          </select>

          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, background: 'white', maxWidth: '180px' }}>
            <option value="">Toutes les matières</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Chargement des cours...</div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>
        ) : filteredCourses.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Aucun cours trouvé.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  {['Cours', 'Classification', 'Statut', 'Actions'].map((h, i) => (
                    <th key={h} style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course, idx) => (
                  <tr key={course.id} style={{ borderBottom: idx === filteredCourses.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{course.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{course.date}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{course.subject}</div>
                      <span style={{ display: 'inline-block', padding: '0.15rem 0.4rem', borderRadius: '4px', background: '#e0e7ff', color: '#4f46e5', fontSize: '0.65rem', fontWeight: 800, marginTop: '4px' }}>
                        SÉRIE {course.series}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.25rem 0.6rem', borderRadius: '20px', background: '#d1fae5', color: '#059669', fontSize: '0.75rem', fontWeight: 700 }}>
                        <CheckCircle size={12} /> {course.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button onClick={() => handleEdit(course)}
                          style={{ background: '#eff6ff', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '0.4rem 0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}>
                          <Edit2 size={14} /> Modifier
                        </button>
                        <button onClick={() => handleDelete(course.id)}
                          style={{ background: '#fef2f2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem 0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}>
                          <Trash2 size={14} /> Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Shared styles
const lbl = { fontSize: '0.85rem', fontWeight: 600, color: '#334155' };
const sel = { width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' };
const inputStyle = { width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' };
const btnSm = { padding: '0.75rem 1rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', flexShrink: 0 };
