import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

const BACKEND_URL = API_BASE_URL.replace('/api', '');

export default function PdfModal({ url, title, onClose }) {
    if (!url) return null;

    const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url}`;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease-out' }}>

            {/* Header toolbar */}
            <div style={{ padding: '0.8rem 1.5rem', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{title || 'Lecture du PDF'}</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <a href={fullUrl} target="_blank" rel="noreferrer" title="Ouvrir dans une nouvelle fenêtre"
                        style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#334155', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none' }}
                    >
                        <ExternalLink size={18} />
                    </a>
                    <button onClick={onClose} title="Fermer"
                        style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* PDF Viewer */}
            <div style={{ flex: 1, position: 'relative', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                <iframe
                    src={`${fullUrl}#toolbar=0&navpanes=0`}
                    title="PDF Viewer"
                    style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
                />
            </div>

            <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
        </div>
    );
}
