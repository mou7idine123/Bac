import React, { useState } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Filter, 
  Award, ListChecks
} from 'lucide-react';

export default function AdminQuizzes() {
  const [quizzes] = useState([
    { id: 1, title: 'Test QCM Probabilités', subject: 'Mathématiques', series: 'C & D', chapter: 'Probabilités', questionsCount: 10, date: '2026-03-01' },
    { id: 2, title: 'Bases de la Chimie Orga', subject: 'Chimie', series: 'D', chapter: 'Chimie Organique', questionsCount: 5, date: '2026-03-05' }
  ]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-display)' }}>Quiz & Évaluations</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0 0', fontWeight: 500 }}>
            Concevez des Questionnaires à Choix Multiples.
          </p>
        </div>
        <button style={{ 
          background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', color: 'white', border: 'none', 
          padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, 
          display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(139, 92, 246, 0.25)', cursor: 'pointer'
        }}>
          <Plus size={16} /> Nouveau QCM
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Rechercher un quiz..." style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }} />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'white' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Test QCM</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Configuration</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Questions</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz, idx) => (
                <tr key={quiz.id} style={{ borderBottom: idx === quizzes.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Award size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{quiz.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Série {quiz.series}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{quiz.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{quiz.chapter}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.8rem', fontWeight: 600 }}>
                        <ListChecks size={14} style={{ color: '#8b5cf6' }} /> {quiz.questionsCount}
                     </div>
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
      </div>
    </div>
  );
}
