import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Sparkles, BookOpen, GitBranch, Brain, Zap } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    text: "Bonjour ! Je suis votre assistant académique IA 🎓\n\nJe suis disponible 24h/24 pour vous aider à comprendre vos cours, résoudre des exercices ou générer des fiches de révision. Comment puis-je vous aider aujourd'hui ?",
    time: 'maintenant',
  },
];

const quickSuggestions = [
  { label: 'Expliquer la loi d\'Ohm', icon: Zap },
  { label: 'Quiz sur les dérivées', icon: GitBranch },
  { label: 'Fiche sur la Génétique', icon: BookOpen },
  { label: 'Plan de révision Maths', icon: Brain },
];

export default function Assistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const hasProcessedState = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (location.state?.prompt && !hasProcessedState.current) {
      hasProcessedState.current = true;
      handleSend(location.state.prompt);
    }
  }, [location.state]);

  const handleSend = async (text) => {
    const msg = text !== undefined ? text : input;
    if (!msg.trim() || loading) return;
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const userMsg = { id: Date.now(), role: 'user', text: msg, time: now };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    // Build history for the API (exclude initial greeting, only user/assistant turns)
    const history = updatedMessages
      .filter(m => m.id !== 1) // skip initial message
      .slice(-10)              // keep last 10 messages for context window
      .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));

    try {
      const token = localStorage.getItem('bac_token');
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: msg, history: history.slice(0, -1) }) // history without last user msg (already in message)
      });
      const data = await res.json();
      const replyText = data.reply || data.error || 'Je n\'ai pas pu générer de réponse.';
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        text: replyText,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        text: '❌ Erreur de connexion. Vérifiez votre connexion et réessayez.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px - 4rem)', minHeight: 500, gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--r-md)',
          background: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(161,140,209,0.4)',
        }}>
          <Sparkles size={22} color="white" />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, lineHeight: 1.2 }}>Tuteur IA</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 2 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', animation: 'pulseGlow 2s infinite' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>En ligne · Répond en quelques secondes</span>
          </div>
        </div>

        {/* Quick suggestions on header right */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {quickSuggestions.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={i}
                className="btn btn-glass btn-sm"
                onClick={() => handleSend(s.label)}
                style={{ fontSize: '0.77rem' }}
              >
                <Icon size={13} style={{ color: 'var(--ai-color)' }} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Window */}
      <div className="chat-wrap" style={{ flex: 1, minHeight: 0 }}>
        {/* Messages */}
        <div className="chat-messages">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}
            >
              <div className={`chat-avatar ${msg.role === 'user' ? 'chat-avatar-user' : 'chat-avatar-ai'}`}>
                {msg.role === 'user' ? 'A' : <Sparkles size={14} />}
              </div>
              <div>
                <div className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-ai'}`}>
                  {msg.text.split('\n').map((line, i) => (
                    <span key={i}>{line}{i < msg.text.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
                <div style={{
                  fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4,
                  textAlign: msg.role === 'user' ? 'right' : 'left', paddingInline: '0.2rem',
                }}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="chat-bubble chat-bubble-ai">
              <div className="chat-avatar chat-avatar-ai"><Sparkles size={14} /></div>
              <div className="chat-msg chat-msg-ai" style={{ padding: '0.85rem 1.25rem' }}>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="chat-input-bar">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{ position: 'relative' }}
          >
            <input
              className="chat-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Posez votre question (ex: Explique-moi le théorème de Pythagore)…"
            />
            <button type="submit" className="chat-send-btn" disabled={!input.trim() || loading}>
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
