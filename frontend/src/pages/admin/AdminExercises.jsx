import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, Filter,
  HelpCircle, Settings, FileSearch, ArrowLeft, X
} from 'lucide-react';
import { API_BASE_URL } from '../../apiConfig';

const EMPTY_FORM = (defaultSeries = 'both') => ({ title: '', description: '', type: 'Classique', difficulty: 'medium', subject_id: '', series: defaultSeries });

export default function AdminExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('Tous');
  const [view, setView] = useState(null); // null | 'add' | 'edit'
  const [editingExercise, setEditingExercise] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState('C');

  const [formData, setFormData] = useState(EMPTY_FORM('C'));
  const [pdfFile, setPdfFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchExercises(); setFilterSubject('Tous'); }, [selectedSeries]);
  useEffect(() => { fetchSubjects(selectedSeries); }, [selectedSeries]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('bac_token');
      const res = await fetch(`${API_BASE_URL}/admin/exercises?series=${selectedSeries}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setExercises(data.exercises);
    } catch { } finally { setLoading(false); }
  };

  const fetchSubjects = async (serie) => {
    try {
      const token = localStorage.getItem('bac_token');
      const res = await fetch(`${API_BASE_URL}/admin/subjects?series=${serie}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.subjects) setSubjects(data.subjects);
    } catch { }
  };

  const handleEdit = async (ex) => {
    setEditingExercise(ex);
    setFormData({
      title: ex.title,
      description: ex.description || '',
      type: ex.type || 'Classique',
      difficulty: ex.difficulty || 'medium',
      subject_id: ex.subject_id,
      series: ex.series || selectedSeries
    });
    setView('edit');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet exercice ?')) return;
    try {
      const token = localStorage.getItem('bac_token');
      await fetch(`${API_BASE_URL}/admin/exercises/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchExercises();
    } catch { }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    const isEdit = view === 'edit';
    try {
      const token = localStorage.getItem('bac_token');
      const url = `${API_BASE_URL}/admin/exercises${isEdit ? '/' + editingExercise.id : ''}`;

      const body = new FormData();
      body.append('title', formData.title);
      body.append('description', formData.description);
      body.append('type', formData.type);
      body.append('difficulty', formData.difficulty);
      body.append('subject_id', formData.subject_id);
      body.append('series', formData.series); // Added series to form data

      if (isEdit) {
        body.append('_method', 'PUT');
        body.append('id', editingExercise.id);
      }
      if (pdfFile) body.append('pdf_file', pdfFile);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: body
      });
      const data = await res.json();
      if (data.success) {
        resetForm();
        fetchExercises();
      } else {
        setFormError(data.error || 'Erreur');
      }
    } catch {
      setFormError('Erreur de connexion');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setView(null);
    setEditingExercise(null);
    setFormData(EMPTY_FORM(selectedSeries));
    setPdfFile(null);
    setFormError('');
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy': return { bg: '#dcfce7', text: '#166534', label: 'Facile' };
      case 'medium': return { bg: '#fef3c7', text: '#92400e', label: 'Moyen' };
      case 'hard': return { bg: '#fee2e2', text: '#991b1b', label: 'Difficile' };
      default: return { bg: '#f1f5f9', text: '#475569', label: diff };
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Exercices</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Gérez la banque d'exercices</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <select
            value={selectedSeries}
            onChange={e => setSelectedSeries(e.target.value)}
            style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 600 }}
          >
            <option value="C">Série C</option>
            <option value="D">Série D</option>
          </select>
          <button
            onClick={() => setView('add')}
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={18} /> Nouveau
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', gap: '0.75rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Rechercher un exercice..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <select
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
            style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600, background: 'white', minWidth: '160px' }}
          >
            <option value="Tous">Toutes les matières</option>
            {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Chargement...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={th}>Exercice</th>
                  <th style={th}>Matière</th>
                  <th style={th}>Niveau</th>
                  <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exercises.filter(ex => {
                  const matchSearch = ex.title.toLowerCase().includes(search.toLowerCase());
                  const matchSubject = filterSubject === 'Tous' || ex.subject === filterSubject;
                  return matchSearch && matchSubject;
                }).map(ex => {
                  const diff = getDifficultyColor(ex.difficulty);
                  return (
                    <tr key={ex.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={td}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{ex.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ex.type}</div>
                      </td>
                      <td style={td}>{ex.subject}</td>
                      <td style={td}>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', background: diff.bg, color: diff.text, fontSize: '0.7rem', fontWeight: 700 }}>
                          {diff.label}
                        </span>
                      </td>
                      <td style={{ ...td, textAlign: 'right' }}>
                        <button onClick={() => handleEdit(ex)} style={btnIcon}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(ex.id)} style={{ ...btnIcon, color: '#ef4444' }}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {view && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '600px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{view === 'add' ? 'Ajouter un Exercice' : 'Modifier Exercice'}</h2>
              <button onClick={resetForm} style={{ padding: '0.4rem', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {formError && <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>{formError}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={fld}>
                  <label style={lbl}>Titre</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={input} required />
                </div>
                <div style={fld}>
                  <label style={lbl}>Matière</label>
                  <select value={formData.subject_id} onChange={e => setFormData({ ...formData, subject_id: e.target.value })} style={input} required>
                    <option value="">Sélectionner...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.series_name})</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={fld}>
                  <label style={lbl}>Série</label>
                  <select value={formData.series} onChange={e => setFormData({ ...formData, series: e.target.value })} style={input}>
                    <option value="C">Série C</option>
                    <option value="D">Série D</option>
                    <option value="both">C & D (les deux)</option>
                  </select>
                </div>
                <div style={fld}>
                  <label style={lbl}>Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ ...input, minHeight: '80px', resize: 'vertical' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={fld}>
                  <label style={lbl}>Type</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={input}>
                    <option value="Classique">Classique</option>
                    <option value="Interactif">Interactif</option>
                  </select>
                </div>
                <div style={fld}>
                  <label style={lbl}>Difficulté</label>
                  <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} style={input}>
                    <option value="easy">Facile</option>
                    <option value="medium">Moyen</option>
                    <option value="hard">Difficile</option>
                  </select>
                </div>
              </div>

              <div style={fld}>
                <label style={lbl}>Fichier PDF (énoncé)</label>
                <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files[0])} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                <button type="button" onClick={resetForm} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" disabled={formLoading} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                  {formLoading ? 'Chargement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const th = { padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' };
const td = { padding: '1rem 1.5rem', fontSize: '0.85rem' };
const lbl = { fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' };
const input = { width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' };
const fld = { display: 'flex', flexDirection: 'column' };
const btnIcon = { background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.4rem', color: '#64748b' };
