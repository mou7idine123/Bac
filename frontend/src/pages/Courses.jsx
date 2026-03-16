import React, { useState } from 'react';
import { Book, FileText, ChevronDown, ChevronRight, Play, Download, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Cours par série
const coursesBySeries = {
  C: [
    {
      id: 1, name:'Mathématiques', emoji:'📘',
      color:'#667eea', bg:'rgba(102,126,234,0.1)',
      gradient:'linear-gradient(135deg,#667eea,#764ba2)',
      chapters:[
        { id:101, title:'Limites et Continuité',      lessons:5, progress:100, sheet:true  },
        { id:102, title:'Dérivabilité et Primitives', lessons:4, progress:75,  sheet:true  },
        { id:103, title:'Intégrales',                 lessons:5, progress:40,  sheet:false },
        { id:104, title:'Fonctions Logarithmes',      lessons:6, progress:20,  sheet:false },
      ],
    },
    {
      id: 2, name:'Physique', emoji:'⚛️',
      color:'#f5576c', bg:'rgba(245,87,108,0.1)',
      gradient:'linear-gradient(135deg,#f093fb,#f5576c)',
      chapters:[
        { id:201, title:'Cinématique',  lessons:3, progress:60, sheet:true  },
        { id:202, title:'Dynamique',    lessons:4, progress:20, sheet:false },
        { id:203, title:'Optique',      lessons:3, progress:0,  sheet:false },
      ],
    },
    {
      id: 3, name:'Chimie', emoji:'🧪',
      color:'#4facfe', bg:'rgba(79,172,254,0.1)',
      gradient:'linear-gradient(135deg,#4facfe,#00f2fe)',
      chapters:[
        { id:301, title:'Acide-Base',           lessons:4, progress:50, sheet:true  },
        { id:302, title:'Réactions chimiques',  lessons:3, progress:15, sheet:false },
      ],
    },
  ],
  D: [
    {
      id: 1, name:'Mathématiques', emoji:'📘',
      color:'#667eea', bg:'rgba(102,126,234,0.1)',
      gradient:'linear-gradient(135deg,#667eea,#764ba2)',
      chapters:[
        { id:101, title:'Probabilités',    lessons:4, progress:70, sheet:true  },
        { id:102, title:'Statistiques',    lessons:3, progress:45, sheet:false },
        { id:103, title:'Géométrie',       lessons:5, progress:20, sheet:false },
      ],
    },
    {
      id: 2, name:'Sciences Naturelles', emoji:'🌿',
      color:'#43e97b', bg:'rgba(67,233,123,0.1)',
      gradient:'linear-gradient(135deg,#43e97b,#38f9d7)',
      chapters:[
        { id:201, title:'Génétique',      lessons:5, progress:85, sheet:true  },
        { id:202, title:'Immunologie',    lessons:4, progress:50, sheet:true  },
        { id:203, title:'Écologie',       lessons:3, progress:10, sheet:false },
      ],
    },
    {
      id: 3, name:'Physique', emoji:'⚛️',
      color:'#f5576c', bg:'rgba(245,87,108,0.1)',
      gradient:'linear-gradient(135deg,#f093fb,#f5576c)',
      chapters:[
        { id:301, title:'Mécanique',  lessons:4, progress:55, sheet:true  },
        { id:302, title:'Optique',    lessons:3, progress:0,  sheet:false },
      ],
    },
  ],
};

export default function Courses() {
  const { user } = useAuth();
  const series   = user?.series ?? 'C';
  const subjects = coursesBySeries[series] ?? coursesBySeries.C;

  const [activeId, setActiveId]  = useState(subjects[0].id);
  const [expanded, setExpanded]  = useState(null);

  const current = subjects.find(s => s.id === activeId) ?? subjects[0];

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

      {/* Subject tabs */}
      <div style={{ display:'flex', gap:'0.6rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {subjects.map(s => (
          <button
            key={s.id}
            onClick={() => { setActiveId(s.id); setExpanded(null); }}
            style={{
              display:'flex', alignItems:'center', gap:'0.5rem',
              padding:'0.55rem 1.1rem', borderRadius:'var(--r-full)',
              border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.85rem',
              transition:'var(--t)',
              background: activeId === s.id ? s.gradient : 'var(--bg-glass-white)',
              color: activeId === s.id ? 'white' : 'var(--text-secondary)',
              boxShadow: activeId === s.id ? `0 4px 14px ${s.color}40` : 'var(--shadow-inset)',
              backdropFilter:'blur(8px)',
              border: activeId === s.id ? 'none' : '1px solid var(--border-glass)',
            }}
          >
            <span>{s.emoji}</span>
            {s.name}
            <span style={{
              padding:'1px 6px', borderRadius:'var(--r-full)',
              fontSize:'0.65rem', fontWeight:700,
              background: activeId === s.id ? 'rgba(255,255,255,0.25)' : s.bg,
              color: activeId === s.id ? 'white' : s.color,
            }}>{s.chapters.length}</span>
          </button>
        ))}
      </div>

      {/* Chapters */}
      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {current.chapters.map((ch, idx) => (
          <div key={ch.id} className="card" style={{ padding:0, overflow:'hidden', animationDelay:`${idx*50}ms` }}>
            <div
              style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1.1rem 1.25rem', cursor:'pointer' }}
              onClick={() => setExpanded(expanded === ch.id ? null : ch.id)}
            >
              <div style={{ width:42, height:42, borderRadius:12, flexShrink:0, background:current.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Book size={20} style={{ color:current.color }} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.3rem' }}>
                  <h3 style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--text-primary)' }}>{ch.title}</h3>
                  {ch.sheet && <span className="badge badge-green"><FileText size={10}/> Fiche</span>}
                  {ch.progress === 100 && <span className="badge badge-blue">✓ Terminé</span>}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div className="progress-track" style={{ flex:1, maxWidth:200 }}>
                    <div className="progress-fill" style={{ width:`${ch.progress}%`, background:current.gradient }} />
                  </div>
                  <span style={{ fontSize:'0.75rem', fontWeight:700, color:current.color }}>{ch.progress}%</span>
                  <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{ch.lessons} leçons</span>
                </div>
              </div>
              <div style={{ color:'var(--text-muted)', flexShrink:0 }}>
                {expanded === ch.id ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
              </div>
            </div>

            {expanded === ch.id && (
              <div style={{ borderTop:'1px solid var(--border-soft)', background:'rgba(238,241,248,0.4)', padding:'1rem 1.25rem', animation:'fadeUp 0.2s ease' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1rem' }}>
                  {Array.from({ length:Math.min(ch.lessons,4) },(_,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.65rem 0.9rem', borderRadius:'var(--r-md)', background:'white', border:'1px solid var(--border-soft)', cursor:'pointer', transition:'var(--t)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                        <Play size={13} style={{ color:current.color }}/>
                        <span style={{ fontSize:'0.875rem', fontWeight:500 }}>Leçon {i+1} : Introduction & Définitions</span>
                      </div>
                      <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>15 min</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                  {ch.sheet && <button className="btn btn-glass btn-sm"><Download size={13}/> Fiche PDF</button>}
                  <button className="btn btn-glass btn-sm" style={{ color:'var(--ai-color)' }}>
                    <Sparkles size={13}/> Demander à l'IA
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
