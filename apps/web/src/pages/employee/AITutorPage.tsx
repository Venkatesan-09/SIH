import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Brain, Send, Loader2, Sparkles } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string };

const STARTERS = [
  'What is stratified sampling?',
  'Explain p-value in simple terms',
  'How do I improve my SQL skills?',
  'What courses should I take for Statistical Inference?',
];

function FormattedMessage({ content }: { content: string }) {
  // Parse lines for bullet points, bold tags, code blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  const renderInline = (text: string) => {
    // Replace **bold** with <strong>
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-text-primary">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${index}`} className="p-3 my-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (!trimmed) {
      elements.push(<div key={`br-${index}`} className="h-1.5" />);
      return;
    }

    // Bullet points (lines starting with * or - or •)
    if (/^[\*\-•]\s+/.test(trimmed)) {
      const cleanBullet = trimmed.replace(/^[\*\-•]\s+/, '');
      elements.push(
        <div key={`bullet-${index}`} className="flex items-start gap-2.5 my-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
          <span className="flex-1 text-sm leading-relaxed">{renderInline(cleanBullet)}</span>
        </div>
      );
      return;
    }

    // Numbered list items (e.g. 1. 2. 3.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        elements.push(
          <div key={`num-${index}`} className="flex items-start gap-2.5 my-1.5">
            <span className="font-bold text-primary text-xs w-4 flex-shrink-0 mt-0.5">{numMatch[1]}.</span>
            <span className="flex-1 text-sm leading-relaxed">{renderInline(numMatch[2]!)}</span>
          </div>
        );
        return;
      }
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${index}`} className="my-1 text-sm leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
  });

  return <div className="space-y-0.5">{elements}</div>;
}

export function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: (question: string) =>
      api.post('/ai/chat', { message: question, history: messages }).then((r) => r.data),
    onSuccess: (data) =>
      setMessages((m) => [...m, { role: 'assistant', content: data.response || data.reply }]),
  });

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: 'user', content: text }]);
    setInput('');
    chatMutation.mutate(text);
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-border bg-surface flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ai-bg flex items-center justify-center">
            <Brain size={20} className="text-ai-text" />
          </div>
          <div>
            <div className="font-bold text-sm sm:text-base text-text-primary">SkillTwin AI Statistical Tutor</div>
            <div className="text-xs text-text-secondary flex items-center gap-1.5">
              <Sparkles size={11} className="text-ai-text" />
              <span>Context-aware assistance for Government Statistical Frameworks</span>
            </div>
          </div>
        </div>
        <span className="badge bg-primary/10 text-primary text-xs font-bold px-2.5 py-1">
          Interactive Tutor
        </span>
      </div>

      {/* Main chat body: responsive desktop container */}
      <div className="flex-1 overflow-hidden flex max-w-5xl w-full mx-auto">
        {/* Messages scroll area */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="max-w-md mx-auto text-center py-10">
                <div className="w-16 h-16 rounded-2xl bg-ai-bg text-ai-text flex items-center justify-center mx-auto mb-4">
                  <Brain size={30} />
                </div>
                <div className="font-bold text-lg text-text-primary mb-1">What can I help you master today?</div>
                <div className="text-text-secondary text-xs sm:text-sm mb-6 leading-relaxed">
                  Clarify mathematical formulas, national statistical standards, NSSO survey methodology, or role-required competencies.
                </div>
                <div className="space-y-2 text-left">
                  <div className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 text-center">Suggested queries</div>
                  {STARTERS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="block w-full text-left px-4 py-2.5 rounded-xl border border-border bg-surface hover:border-primary/50 text-xs sm:text-sm text-text-secondary hover:text-text-primary transition-all shadow-sm"
                    >
                      💡 {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-ai-bg flex items-center justify-center mr-2.5 flex-shrink-0 mt-0.5">
                    <Brain size={15} className="text-ai-text" />
                  </div>
                )}
                <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'bg-primary text-white rounded-tr-sm whitespace-pre-wrap'
                    : 'bg-surface border border-border text-text-primary rounded-tl-sm'
                }`}>
                  {m.role === 'user' ? m.content : <FormattedMessage content={m.content} />}
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-xl bg-ai-bg flex items-center justify-center mr-2.5 flex-shrink-0">
                  <Brain size={15} className="text-ai-text" />
                </div>
                <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 bg-text-secondary/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input Footer */}
          <div className="p-4 border-t border-border bg-surface">
            <div className="flex items-center gap-3">
              <input
                type="text"
                className="input flex-1 py-2.5 text-sm"
                placeholder="Ask about sampling, survey design, indices, or your competency scores…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || chatMutation.isPending}
                className="btn-primary h-10 px-4 rounded-xl flex items-center justify-center gap-1.5 font-bold flex-shrink-0"
              >
                {chatMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
