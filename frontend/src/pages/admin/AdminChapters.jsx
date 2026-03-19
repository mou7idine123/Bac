import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Layers, ArrowLeft, Filter } from 'lucide-react';
import { API_BASE_URL } from '../../apiConfig';

export default function AdminChapters() {
    const [chapters, setChapters] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isAdding, setIsAdding] = useState(false);
    const [selectedSeriesFilter, setSelectedSeriesFilter] = useState('C'); // Default to C

    const [formData, setFormData] = useState({
        title: '',
        subject_id: '',
        order_index: '0',
        series: 'C'
    });

    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [pdfFile, setPdfFile] = useState(null);

    useEffect(() => {
        fetchChapters();
        fetchSubjects();
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

    const fetchSubjects = async () => {
        try {
            const token = localStorage.getItem('bac_token');
            const res = await fetch(`${API_BASE_URL}/admin/subjects?series=${selectedSeriesFilter}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSubjects(data.subjects);
            }
        } catch (err) { }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);

        try {
            const token = localStorage.getItem('bac_token');
            const dataForm = new FormData();
            dataForm.append('title', formData.title);
            dataForm.append('subject_id', formData.subject_id);
            dataForm.append('order_index', formData.order_index);
            dataForm.append('series', selectedSeriesFilter);
            if (pdfFile) {
                dataForm.append('pdf_file', pdfFile);
            }

            const res = await fetch(`${API_BASE_URL}/admin/chapters`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: dataForm
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setIsAdding(false);
                setFormData({ title: '', subject_id: '', order_index: '0', series: selectedSeriesFilter });
                setPdfFile(null);
                fetchChapters();
            } else {
                setFormError(data.error || 'Erreur lors de l\'ajout.');
            }
        } catch (err) {
            setFormError('Erreur de connexion : ' + err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce chapitre ?")) return;
        try {
            const token = localStorage.getItem('bac_token');
            const res = await fetch(`${API_BASE_URL}/admin/chapters?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setChapters(chapters.filter(c => c.id !== id));
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert("Erreur lors de la suppression.");
        }
    };

    if (isAdding) {
        return (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <button
                    onClick={() => setIsAdding(false)}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 600 }}
                >
                    <ArrowLeft size={16} /> Retour à la liste
                </button>

                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.5rem 0', fontFamily: 'var(--font-display)' }}>Ajouter un Chapitre</h1>

                <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    {formError && (
                        <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 500 }}>
                            {formError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Matière</label>
                            <select
                                name="subject_id"
                                value={formData.subject_id}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
                                required
                            >
                                <option value="">Sélectionner une matière...</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Titre du chapitre</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Ex: Nombres complexes"
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    required
                                />
                            </div>
                            <div style={{ width: '150px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Ordre (optionnel)</label>
                                <input
                                    type="number"
                                    name="order_index"
                                    value={formData.order_index}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Fichier du cours (PDF Optionnel)</label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={e => setPdfFile(e.target.files[0])}
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={formLoading}
                            style={{ padding: '0.85rem 1.5rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: formLoading ? 'not-allowed' : 'pointer', marginTop: '1rem' }}
                        >
                            {formLoading ? 'Enregistrement...' : 'Enregistrer le chapitre'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-display)' }}>Gestion des Chapitres</h1>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0 0', fontWeight: 500 }}>
                        Ajoutez, organisez et supprimez vos chapitres.
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    style={{
                        background: 'linear-gradient(135deg, #4f7af8, #764ba2)', color: 'white', border: 'none',
                        padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(79,122,248,0.25)', cursor: 'pointer'
                    }}
                >
                    <Plus size={16} /> Ajouter un chapitre
                </button>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>

                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={16} color="#94a3b8" />
                        <select
                            value={selectedSeriesFilter}
                            onChange={(e) => setSelectedSeriesFilter(e.target.value)}
                            style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}
                        >
                            <option value="C">Série C</option>
                            <option value="D">Série D</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>Chargement...</div>
                ) : error ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444', fontSize: '0.9rem' }}>{error}</div>
                ) : chapters.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                        Aucun chapitre trouvé pour la série {selectedSeriesFilter}.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'white' }}>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Ordre</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Titre du chapitre</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Matière</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chapters.map((ch, idx) => (
                                    <tr key={ch.id} style={{ borderBottom: idx === chapters.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 500 }}>
                                            {ch.order_index}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(102,126,234,0.1)', color: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Layers size={16} />
                                                </div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{ch.title}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>{ch.subject_name}</div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            <button onClick={() => handleDelete(ch.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} title="Supprimer">
                                                <Trash2 size={16} />
                                            </button>
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
