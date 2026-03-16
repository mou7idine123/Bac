import React, { useState } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Filter, 
  HelpCircle, Settings, FileSearch 
} from 'lucide-react';

export default function AdminExercises() {
  const [exercises] = useState([
    { id: 1, title: 'Calcul d\'Intégrales Complexes', subject: 'Mathématiques', series: 'C', chapter: 'Intégration', difficulty: 'hard', type: 'Interactif', date: '2026-03-14' },
    { id: 2, title: 'Bilan des forces', subject: 'Physique', series: 'D', chapter: 'Mécanique', difficulty: 'medium', type: 'Classique', date: '2026-03-11' }
  ]);

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'easy': return { bg: '#dcfce7', text: '#166534', label: 'Facile' };
      case 'medium': return { bg: '#fef3c7', text: '#92400e', label: 'Moyen' };
      case 'hard': return { bg: '#fee2e2', text: '#991b1b', label: 'Difficile' };
      default: return { bg: '#f1f5f9', text: '#475569', label: 'Inconnu' };
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-display)' }}>Exercices</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0 0', fontWeight: 500 }}>
            Banque d'exercices d'entraînement et travaux dirigés.
          </p>
        </div>
        <button style={{ 
          background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', 
          padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, 
          display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)', cursor: 'pointer'
        }}>
          <Plus size={16} /> Nouvel Exercice
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Rechercher par titre ou sujet..." style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }} />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
             <Filter size={16} /> Matières
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'white' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Exercice</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Configuration</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Niveau</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((ex, idx) => {
                const diff = getDifficultyColor(ex.difficulty);
                return (
                  <tr key={ex.id} style={{ borderBottom: idx === exercises.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <HelpCircle size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{ex.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}><span style={{ color: '#10b981', fontWeight: 600 }}>{ex.type}</span> • Ajouté le {ex.date}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{ex.subject}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{ex.chapter} • Série {ex.series}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ display: 'inline-flex', padding: '0.2rem 0.6rem', borderRadius: '4px', background: diff.bg, color: diff.text, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {diff.label}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                         <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} title="Aperçu rapide">
                           <FileSearch size={16} />
                         </button>
                         <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} title="Modifier">
                           <Edit2 size={16} />
                         </button>
                         <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} title="Supprimer">
                           <Trash2 size={16} />
                         </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
