import React, { useState } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Filter, 
  FileText, CheckCircle, XCircle 
} from 'lucide-react';

export default function AdminCourses() {
  // Mock data for UI demonstration
  const [courses] = useState([
    { id: 1, title: 'Limites et continuité', subject: 'Mathématiques', series: 'C & D', chapter: 'Analyse 1', status: 'published', date: '2026-03-10' },
    { id: 2, title: 'Lois de Newton', subject: 'Physique', series: 'C', chapter: 'Mécanique', status: 'published', date: '2026-03-12' },
    { id: 3, title: 'La mitose', subject: 'Sciences Nat.', series: 'D', chapter: 'Reproduction Cellulaire', status: 'draft', date: '2026-03-15' },
  ]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-display)' }}>Gestion des Cours</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0 0', fontWeight: 500 }}>
            Créez, modifiez et organisez le contenu d'apprentissage.
          </p>
        </div>
        <button style={{ 
          background: 'linear-gradient(135deg, #4f7af8, #764ba2)', color: 'white', border: 'none', 
          padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, 
          display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(79,122,248,0.25)', cursor: 'pointer'
        }}>
          <Plus size={16} /> Ajouter un cours
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Rechercher un cours..." 
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
             <Filter size={16} /> Filtres
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'white' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Cours</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Classification</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Statut</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, idx) => (
                <tr key={course.id} style={{ borderBottom: idx === courses.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <FileText size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{course.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Mis à jour le {course.date}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{course.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{course.chapter} • <span style={{ fontWeight: 700, color: '#4f7af8' }}>Série {course.series}</span></div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {course.status === 'published' ? (
                       <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.25rem 0.6rem', borderRadius: '20px', background: '#d1fae5', color: '#059669', fontSize: '0.75rem', fontWeight: 700 }}>
                         <CheckCircle size={12} /> Publié
                       </span>
                    ) : (
                       <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.25rem 0.6rem', borderRadius: '20px', background: '#f1f5f9', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>
                         <XCircle size={12} /> Brouillon
                       </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                       <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} title="Modifier">
                         <Edit2 size={16} />
                       </button>
                       <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} title="Supprimer">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          <span>Affichage de 1 à 3 sur 3 éléments</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button style={{ padding: '0.4rem 0.75rem', border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Précédent</button>
            <button style={{ padding: '0.4rem 0.75rem', border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Suivant</button>
          </div>
        </div>

      </div>
    </div>
  );
}
