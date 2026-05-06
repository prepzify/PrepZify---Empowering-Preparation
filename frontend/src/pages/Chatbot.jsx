import { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiSend, FiMessageCircle, FiUser, FiCpu } from 'react-icons/fi';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Prepzify AI Assistant 🤖\n\nI can help you with placement preparation, technical concepts, interview tips, and career guidance. Ask me anything!" },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || sending) return;

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await chatAPI.send({
        message: msg,
        conversationHistory: messages.slice(-10),
      });

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      toast.error('Failed to get response');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] lg:h-[calc(100vh-3rem)] animate-fade-in">
      {/* Header */}
      <div className="glass-card p-4 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <FiMessageCircle className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-text-primary">AI Chat Assistant</h1>
          <p className="text-xs text-text-muted">Your placement preparation companion</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
              {msg.role === 'user' ? <FiUser className="w-4 h-4" /> : <FiCpu className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
              ? 'bg-primary/15 text-text-primary rounded-tr-sm'
              : 'bg-surface-lighter/50 text-text-secondary rounded-tl-sm border border-border/30'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center shrink-0">
              <FiCpu className="w-4 h-4" />
            </div>
            <div className="bg-surface-lighter/50 p-4 rounded-2xl rounded-tl-sm border border-border/30">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="glass-card p-3 mt-2 flex items-end gap-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about placements..."
          rows={1}
          className="flex-1 resize-none min-h-[40px] max-h-[120px] bg-transparent border-none focus:shadow-none"
          style={{ boxShadow: 'none' }}
        />
        <button onClick={handleSend} disabled={sending || !input.trim()} className="btn btn-primary p-3 rounded-xl shrink-0">
          <FiSend className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
