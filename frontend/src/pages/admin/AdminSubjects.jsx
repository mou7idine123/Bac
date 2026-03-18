import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, BookOpen, AlertCircle, Eye, ArrowLeft, Filter } from 'lucide-react';
import { API_BASE_URL } from '../../apiConfig';

export default function AdminSubjects() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isAdding, setIsAdding] = useState(false);
    const [selectedSeriesFilter, setSelectedSeriesFilter] = useState('C'); // Default to C

    const [formData, setFormData] = useState({
        name: '',
        series: 'C',
        description: '',
    });

    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchSubjects();
    }, [selectedSeriesFilter]);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('bac_token');
            // L'administrateur voit les matières de la filière C (ou D si on change le filtre)
            const res = await fetch(`${API_BASE_URL}/admin/subjects?series=${selectedSeriesFilter}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setSubjects(data.subjects);
            } else {
                setError(data.error || 'Erreur inconnue');
            }
        } catch (err) {
            setError('Impossible de se connecter au serveur');
        } finally {
            setLoading(false);
        }
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
            const res = await fetch(`${API_BASE_URL}/admin/subjects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // La matière ajoutée sera associée uniquement à la filière sélectionnée.
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setIsAdding(false);
                setFormData({ name: '', series: 'C', description: '' });
                // L'admin ajoute pour n'importe quelle filière mais si c'est la filière actuellement filtrée (C par défaut), 
                // on recharge pour voir le changement. Si ajout sur D, on ne la verra pas tout de suite si le filtre est sur C, ce qui correspond à la spec.
                if (formData.series === selectedSeriesFilter) {
                    fetchSubjects();
                } else {
                    // Optionally prompt or just fetch anyway
                    alert(`La matière a été ajoutée pour la série ${formData.series}.`);
                }
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
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette matière ? (Ceci pourrait être irréversible selon la BDD)")) return;
        try {
            const token = localStorage.getItem('bac_token');
            const res = await fetch(`${API_BASE_URL}/admin/subjects?action=delete&id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSubjects(subjects.filter(s => s.id !== id));
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
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

                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.5rem 0', fontFamily: 'var(--font-display)' }}>Ajouter une Matière</h1>

                <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    {formError && (
                        <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 500 }}>
                            {formError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Nom de la matière</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ex: Mathématiques"
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    required
                                />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Filière ciblée</label>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.2rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', color: '#334155' }}>
                                        <input type="radio" name="series" value="C" checked={formData.series === 'C'} onChange={handleChange} />
                                        Série C
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', color: '#334155' }}>
                                        <input type="radio" name="series" value="D" checked={formData.series === 'D'} onChange={handleChange} />
                                        Série D
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Description (Optionnel)</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Petite description de la matière..."
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={formLoading}
                            style={{ padding: '0.85rem 1.5rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: formLoading ? 'not-allowed' : 'pointer', marginTop: '1rem' }}
                        >
                            {formLoading ? 'Enregistrement...' : 'Enregistrer la matière'}
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
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-display)' }}>Gestion des Matières</h1>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0 0', fontWeight: 500 }}>
                        Affichage des matières réservé par défaut à la série sélectionnée.
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
                    <Plus size={16} /> Ajouter une matière
                </button>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>

                {/* Toolbar */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={16} color="#94a3b8" />
                        <select
                            value={selectedSeriesFilter}
                            onChange={(e) => setSelectedSeriesFilter(e.target.value)}
                            style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}
                        >
                            <option value="C">Filtre : Série C (Défaut)</option>
                            <option value="D">Filtre : Série D</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>Chargement...</div>
                ) : error ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444', fontSize: '0.9rem' }}>{error}</div>
                ) : subjects.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                        Aucune matière trouvée pour la série {selectedSeriesFilter}.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'white' }}>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Matière</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Filière (Liaison)</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map((subject, idx) => (
                                    <tr key={subject.id} style={{ borderBottom: idx === subjects.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: 36, height: 36, borderRadius: '8px', background: `${subject.color_theme}20`, color: subject.color_theme, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <BookOpen size={18} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{subject.name}</div>
                                                    {subject.description && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{subject.description.substring(0, 40)}...</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', background: '#e0e7ff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                                Série {subject.series_name}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button onClick={() => handleDelete(subject.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} title="Supprimer">
                                                    <Trash2 size={16} />
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
