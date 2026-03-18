import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Layers, ArrowLeft, Filter, FileText, Upload, CheckCircle, Search } from 'lucide-react';
import { API_BASE_URL } from '../../apiConfig';

const BACKEND_URL = 'http://localhost:8000';

export default function AdminResumes() {
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSeriesFilter, setSelectedSeriesFilter] = useState('C');
    const [search, setSearch] = useState('');

    const [isEditing, setIsEditing] = useState(null); // ID of chapter being edited
    const [pdfFile, setPdfFile] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchChapters();
    }, [selectedSeriesFilter]);

    const fetchChapters = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('bac_token');
            const res = await fetch(`${API_BASE_URL}/admin/chapters?series=${selectedSeriesFilter}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setChapters(data.chapters);
            } else {
                setError(data.error || 'Erreur inconnue');
            }
        } catch (err) {
            setError('Impossible de se connecter au serveur');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (chapter) => {
        if (!pdfFile) return;
        setFormError('');
        setFormLoading(true);

        try {
            const token = localStorage.getItem('bac_token');
            const dataForm = new FormData();
            dataForm.append('id', chapter.id);
            dataForm.append('title', chapter.title);
            dataForm.append('subject_id', subjectsMap[chapter.subject_name] || ''); // We need subject_id but we only have subject_name from GET
            // Wait, I need subject_id. Let's adjust the GET query or just use the chapter object properly.
            // Actually, the GET /admin/chapters should return subject_id.

            // Let's check AdminController.php GET chapters again.
            // It only returns s.name as subject_name.
        } catch (err) { }
    };

    // Re-fetch chapters after change
    const onSave = () => {
        setIsEditing(null);
        setPdfFile(null);
        fetchChapters();
    };

    const filteredChapters = chapters.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.subject_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-display)' }}>Résumés de Chapitres</h1>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0 0', fontWeight: 500 }}>
                        Gérez les documents PDF de synthèse pour chaque chapitre.
                    </p>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={16} color="#94a3b8" />
                        <select
                            value={selectedSeriesFilter}
                            onChange={(e) => setSelectedSeriesFilter(e.target.value)}
                            style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}
                        >
                            <option value="C">Série C</option>
                            <option value="D">Série D</option>
                        </select>
                    </div>

                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Rechercher un chapitre ou une matière..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem' }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Chargement...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#f8fafc' }}>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Chapitre</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Matière</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Statut Résumé</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredChapters.map((ch) => (
                                    <tr key={ch.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{ch.title}</div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                                                {ch.subject_name}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            {ch.resume_pdf_url ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    <CheckCircle size={14} /> Prêt
                                                    <a href={`${BACKEND_URL}${ch.resume_pdf_url}`} target="_blank" rel="noreferrer" style={{ marginLeft: '0.5rem', color: '#6366f1' }}>
                                                        <FileText size={14} />
                                                    </a>
                                                </div>
                                            ) : (
                                                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Manquant</div>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => setIsEditing(ch.id)}
                                                style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}
                                            >
                                                {ch.resume_pdf_url ? 'Remplacer' : 'Ajouter'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal simple pour upload */}
            {isEditing && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ margin: '0 0 1rem 0' }}>Uploader le Résumé</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                            Chapitre : <strong>{chapters.find(c => c.id === isEditing)?.title}</strong>
                        </p>

                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setPdfFile(e.target.files[0])}
                            style={{ marginBottom: '1.5rem' }}
                        />

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsEditing(null)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'transparent' }}>Annuler</button>
                            <button
                                onClick={async () => {
                                    if (!pdfFile) return;
                                    setFormLoading(true);
                                    const ch = chapters.find(c => c.id === isEditing);
                                    const token = localStorage.getItem('bac_token');
                                    const fd = new FormData();
                                    fd.append('id', ch.id);
                                    fd.append('title', ch.title); // existing title
                                    fd.append('subject_id', ch.subject_id); // wait, I NEED subject_id
                                    fd.append('pdf_file', pdfFile);

                                    // I'll update AdminController.php first to return subject_id in GET
                                    const res = await fetch(`${API_BASE_URL}/admin/chapters`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${token}` },
                                        body: fd
                                    });
                                    if (res.ok) onSave();
                                    else alert('Erreur');
                                    setFormLoading(false);
                                }}
                                disabled={!pdfFile || formLoading}
                                style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600 }}
                            >
                                {formLoading ? 'Chargement...' : 'Uploader'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
