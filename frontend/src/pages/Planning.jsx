import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, CheckCircle, Clock, Plus, Sparkles, AlertTriangle, 
  ArrowRight, Activity, BookOpen
} from 'lucide-react';
import ProgressRing from '../components/ProgressRing';

const SUBJECTS_BY_SERIES = {
    C: ['Maths', 'Physique', 'Chimie', 'Philosophie'],
    D: ['Sciences Nat.', 'Maths', 'Physique', 'Chimie', 'Philosophie']
};

export default function Planning() {
  const { user } = useAuth();
  
  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasPlan, setHasPlan] = useState(false);
  
  // Plan Info Data
  const [planInfo, setPlanInfo] = useState(null);
  const [timeline, setTimeline] = useState([]);
  
  // Generator Form Data
  const [formDate, setFormDate] = useState('');
  const [formHours, setFormHours] = useState(3);
  const [formSubjects, setFormSubjects] = useState([]);
  const [generating, setGenerating] = useState(false);

  // Initialize form subjects based on user series
  useEffect(() => {
     if (user?.series) {
         setFormSubjects(SUBJECTS_BY_SERIES[user.series] || []);
     }
  }, [user]);

  // Load planning on mount
  useEffect(() => {
    fetchPlanning();
  }, []);

  const fetchPlanning = async () => {
    setLoading(true);
    try {
        // Authenticated request Simulation (since we bypass JWT for this demo)
        const res = await fetch(`http://localhost:8000/api/planning/get.php?user_id=${user?.id}`, {
            headers: { 'Authorization': 'Bearer test-token' }
        });
        const data = await res.json();
        
        if (data.has_plan) {
            setHasPlan(true);
            setPlanInfo(data.plan_info);
            setTimeline(data.timeline);
        } else {
            setHasPlan(false);
        }
    } catch (err) {
        setError('Impossible de charger votre planning.');
    } finally {
        setLoading(false);
    }
  };

  const generatePlan = async (e) => {
      e.preventDefault();
      setError('');
      if (formSubjects.length === 0) {
          setError('Veuillez sélectionner au moins une matière.');
          return;
      }

      setGenerating(true);
      try {
          const res = await fetch('http://localhost:8000/api/planning/generate.php', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer test-token'
              },
              body: JSON.stringify({
                  user_id: user.id,
                  bac_date: formDate,
                  hours_per_day: formHours,
                  subjects: formSubjects
              })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Erreur API');
          
          await fetchPlanning();
          
      } catch (err) {
          setError(err.message);
      } finally {
          setGenerating(false);
      }
  };

  const toggleSession = async (sessionId, currentStatus) => {
      try {
          // Optimistic UI update
          setTimeline(prev => prev.map(day => ({
              ...day,
              items: day.items.map(item => item.id === sessionId ? {...item, is_completed: !currentStatus} : item)
          })));

          await fetch('http://localhost:8000/api/planning/complete.php', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer test-token'
              },
              body: JSON.stringify({
                  session_id: sessionId,
                  is_completed: !currentStatus
              })
          });
          
          // Re-fetch progress
          fetchPlanning();
      } catch (err) {
          // Revert on error
          fetchPlanning();
      }
  };

  const toggleSubject = (subj) => {
      setFormSubjects(prev => 
          prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]
      );
  };

  const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const getSubjectColor = (subj) => {
      const colors = {
          'Maths': '#667eea',
          'Physique': '#f5576c',
          'Chimie': '#4facfe',
          'Sciences Nat.': '#2ed573',
          'Philosophie': '#fa8231'
      };
      return colors[subj] || '#a18cd1';
  };

  if (loading) {
      return <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <span className="auth-spinner" style={{ width: 40, height: 40, borderBottomColor: 'var(--primary)' }}></span>
      </div>;
  }

  // =========================================================================
  // VIEW: NO PLAN SET YET (AI GENERATOR FORM)
  // =========================================================================
  if (!hasPlan) {
      const allSubjects = SUBJECTS_BY_SERIES[user?.series || 'C'] || [];
      return (
          <div>
             <div className="page-hero">
                <div>
                  <h1 className="page-title">Créez votre planning sur mesure</h1>
                  <p className="page-subtitle">Notre IA répartit intelligemment votre charge de travail jusqu'au Bac.</p>
                </div>
              </div>

              <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
                  <form onSubmit={generatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      
                      {error && (
                         <div className="auth-error">
                           <AlertTriangle size={15} />
                           <span>{error}</span>
                         </div>
                      )}

                      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                          <div className="auth-field">
                              <label className="auth-field-label">Date de votre Baccalauréat</label>
                              <div className="auth-input-wrap">
                                  <Calendar size={15} className="auth-input-icon" />
                                  <input 
                                      type="date" 
                                      className="auth-input" 
                                      value={formDate}
                                      onChange={(e) => setFormDate(e.target.value)}
                                      min={new Date().toISOString().split('T')[0]}
                                      required
                                  />
                              </div>
                          </div>

                          <div className="auth-field">
                              <label className="auth-field-label">
                                  Temps de révision quotidien : <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{formHours}h</span>
                              </label>
                              <div style={{ padding: '0.8rem 0' }}>
                                  <input 
                                      type="range" 
                                      min="1" max="8" step="1" 
                                      value={formHours}
                                      onChange={(e) => setFormHours(parseInt(e.target.value))}
                                      style={{ width: '100%', accentColor: 'var(--primary)' }}
                                  />
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                      <span>1h (Léger)</span>
                                      <span>4h (Intensif)</span>
                                      <span>8h (Machine)</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="auth-field">
                          <label className="auth-field-label">Matières à réviser</label>
                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                              {allSubjects.map(subj => {
                                  const isActive = formSubjects.includes(subj);
                                  const color = getSubjectColor(subj);
                                  return (
                                      <button 
                                          key={subj} 
                                          type="button" 
                                          onClick={() => toggleSubject(subj)}
                                          className={`btn ${isActive ? '' : 'btn-outline'}`}
                                          style={{ 
                                              background: isActive ? `${color}15` : 'transparent',
                                              borderColor: isActive ? color : 'var(--border-soft)',
                                              color: isActive ? color : 'var(--text-secondary)'
                                          }}
                                      >
                                          <BookOpen size={14} />
                                          {subj}
                                      </button>
                                  )
                              })}
                          </div>
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }} disabled={generating}>
                          {generating ? (
                              <span className="auth-spinner" style={{ width: 20, height: 20 }}></span>
                          ) : (
                              <><Sparkles size={18} /> Générer le planning par IA</>
                          )}
                      </button>

                  </form>
              </div>
          </div>
      );
  }

  // =========================================================================
  // VIEW: ACTIVE PLAN TIMELINE
  // =========================================================================
  return (
    <div>
      {/* Header */}
      <div className="page-hero">
        <div>
          <h1 className="page-title">Mon Planning de Révision</h1>
          <p className="page-subtitle">Généré par l'IA • {planInfo.hours_per_day}h par jour</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>{planInfo.progress}%</div>
               <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Progression</div>
           </div>
           <svg width="0" height="0">
               <defs>
                   <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="#4f7af8" />
                       <stop offset="100%" stopColor="#a18cd1" />
                   </linearGradient>
               </defs>
           </svg>
           <ProgressRing percent={planInfo.progress} size={48} strokeWidth={5} color="url(#pg)" label="" />
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '2rem', maxWidth: 900, margin: '0 auto' }}>
          
          {timeline.length === 0 ? (
              <div className="card text-center" style={{ padding: '3rem' }}>
                  <Calendar size={48} style={{ color: 'var(--border-soft)', margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Aucune session prévue</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Votre planning est vide.</p>
              </div>
          ) : (
              timeline.map((dayBlock, i) => (
                  <div key={dayBlock.date} className="anim-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                      
                      <div style={{ 
                          display: 'flex', alignItems: 'center', gap: '1rem', 
                          marginBottom: '1rem', paddingLeft: '0.5rem' 
                      }}>
                          <div style={{ 
                              background: 'var(--bg-glass-white)', backdropFilter: 'blur(10px)',
                              border: '1px solid var(--border-soft)', padding: '0.4rem 1rem', 
                              borderRadius: 'var(--r-full)', fontSize: '0.85rem', fontWeight: 700,
                              color: 'var(--text-primary)', textTransform: 'capitalize'
                          }}>
                              {formatDate(dayBlock.date)}
                          </div>
                          <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }}></div>
                      </div>

                      <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {dayBlock.items.map(session => {
                              const color = getSubjectColor(session.subject);
                              return (
                                  <div key={session.id} className="glass-light" style={{
                                      display: 'flex', alignItems: 'center', gap: '1rem',
                                      padding: '1rem 1.25rem', borderRadius: 'var(--r-lg)',
                                      border: `1px solid ${session.is_completed ? 'rgba(46,213,115,0.3)' : 'var(--border-soft)'}`,
                                      background: session.is_completed ? 'rgba(46,213,115,0.05)' : 'rgba(255,255,255,0.5)',
                                      transition: 'var(--t)'
                                  }}>
                                      
                                      <div style={{ width: 4, height: 40, borderRadius: 4, background: color }} />
                                      
                                      <div style={{ flex: 1 }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                  {session.subject}
                                              </span>
                                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                  <Clock size={12} /> {session.duration} min
                                              </span>
                                          </div>
                                          <div style={{ fontSize: '1rem', fontWeight: 700, color: session.is_completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: session.is_completed ? 'line-through' : 'none' }}>
                                              {session.topic}
                                          </div>
                                      </div>

                                      <button 
                                          onClick={() => toggleSession(session.id, session.is_completed)}
                                          className="btn"
                                          style={{ 
                                              background: session.is_completed ? 'var(--success)' : 'transparent',
                                              border: `1.5px solid ${session.is_completed ? 'var(--success)' : 'var(--border-soft)'}`,
                                              color: session.is_completed ? 'white' : 'var(--text-muted)',
                                              padding: '0.5rem', borderRadius: 'var(--r-full)',
                                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                                          }}
                                          title={session.is_completed ? "Marquer comme à faire" : "Marquer comme terminé"}
                                      >
                                          <CheckCircle size={18} />
                                      </button>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              ))
          )}
          
      </div>
    </div>
  );
}
