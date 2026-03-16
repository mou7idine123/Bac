import React, { useState } from 'react';
import { FileText, Download, CheckCircle, Eye, Search } from 'lucide-react';

const annals = [
  { id: 1, year: '2024', series: 'C', subject: 'Mathématiques', pages: 8,  hasCorrection: true },
  { id: 2, year: '2024', series: 'D', subject: 'Sciences Nat.', pages: 6,  hasCorrection: true },
  { id: 3, year: '2024', series: 'C', subject: 'Physique',      pages: 10, hasCorrection: false },
  { id: 4, year: '2023', series: 'C', subject: 'Mathématiques', pages: 9,  hasCorrection: true },
  { id: 5, year: '2023', series: 'D', subject: 'Sciences Nat.', pages: 7,  hasCorrection: true },
  { id: 6, year: '2023', series: 'C', subject: 'Physique',      pages: 8,  hasCorrection: true },
  { id: 7, year: '2022', series: 'C', subject: 'Mathématiques', pages: 9,  hasCorrection: false },
  { id: 8, year: '2022', series: 'D', subject: 'Sciences Nat.', pages: 6,  hasCorrection: true },
  { id: 9, year: '2022', series: 'C', subject: 'Physique',      pages: 11, hasCorrection: true },
];

const subjectMeta = {
  'Mathématiques': { emoji: '📘', gradient: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#667eea', bg: 'rgba(102,126,234,0.1)' },
  'Physique':      { emoji: '⚛️',  gradient: 'linear-gradient(135deg,#f093fb,#f5576c)', color: '#f5576c', bg: 'rgba(245,87,108,0.1)' },
  'Sciences Nat.': { emoji: '🌿',  gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', color: '#4facfe', bg: 'rgba(79,172,254,0.1)' },
};

export default function Exams() {
  const [filterYear, setFilterYear] = useState('Tous');
  const [filterSeries, setFilterSeries] = useState('Tous');
  const [search, setSearch] = useState('');

  const years = ['Tous', '2024', '2023', '2022'];
  const series = ['Tous', 'C', 'D'];

  const filtered = annals.filter(a => {
    if (filterYear !== 'Tous' && a.year !== filterYear) return false;
    if (filterSeries !== 'Tous' && a.series !== filterSeries) return false;
    if (search && !a.subject.toLowerCase().includes(search.toLowerCase()) && !a.year.includes(search)) return false;
    return true;
  });

  return (
    <div>
      <div className="page-hero">
        <div>
          <h1 className="page-title">Annales du Bac</h1>
          <p className="page-subtitle">Sujets officiels des examens précédents avec corrections.</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <Search size={15} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Rechercher une matière..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Year filter */}
        {years.map(y => (
          <button
            key={y}
            onClick={() => setFilterYear(y)}
            className={`btn ${filterYear === y ? 'btn-primary' : 'btn-glass'} btn-sm`}
          >
            {y}
          </button>
        ))}

        <div style={{ width: 1, height: 24, background: 'var(--border-soft)' }} />

        {/* Series filter */}
        {series.map(s => (
          <button
            key={s}
            onClick={() => setFilterSeries(s)}
            className={`btn ${filterSeries === s ? 'btn-primary' : 'btn-glass'} btn-sm`}
          >
            {s === 'Tous' ? 'Toutes séries' : `Série ${s}`}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
        {filtered.map(item => {
          const meta = subjectMeta[item.subject] || {};
          return (
            <div key={item.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Gradient top bar */}
              <div style={{ height: 4, background: meta.gradient }} />
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10,
                      background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.4rem',
                    }}>{meta.emoji}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2 }}>{item.subject}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Bac {item.year} · Série {item.series}
                      </div>
                    </div>
                  </div>
                  {item.hasCorrection && (
                    <span className="badge badge-green" style={{ flexShrink: 0, fontSize: '0.65rem' }}>
                      <CheckCircle size={10} /> Corrigé
                    </span>
                  )}
                </div>

                <div style={{
                  display: 'flex', gap: '0.75rem', marginBottom: '1rem',
                  padding: '0.6rem', borderRadius: 'var(--r-md)',
                  background: 'rgba(238,241,248,0.6)',
                }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: meta.color, fontFamily: 'var(--font-display)' }}>{item.year}</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Année</div>
                  </div>
                  <div style={{ width: 1, background: 'var(--border-soft)' }} />
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{item.pages}</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Pages</div>
                  </div>
                  <div style={{ width: 1, background: 'var(--border-soft)' }} />
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{item.series}</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Série</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button className="btn btn-glass btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    <Eye size={14} /> Voir
                  </button>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    <Download size={14} /> PDF
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state card" style={{ marginTop: '2rem' }}>
          <FileText size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
          <p style={{ fontWeight: 600 }}>Aucune annale trouvée</p>
          <p style={{ fontSize: '0.85rem' }}>Modifiez vos filtres pour voir d'autres sujets.</p>
        </div>
      )}
    </div>
  );
}
