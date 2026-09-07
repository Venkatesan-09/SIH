import { Link } from 'react-router-dom';
import { Brain, BarChart3, BookOpen, Shield, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';

const HOW_IT_WORKS = [
  { step: '01', icon: Brain, title: 'Generate Your Skill Twin', desc: 'Tell us your department, role, and experience. Our AI creates your personalized competency profile in seconds.' },
  { step: '02', icon: BarChart3, title: 'Discover Your Gaps', desc: 'See exactly where you stand vs. role requirements. Priority-ranked gaps tell you what to focus on first.' },
  { step: '03', icon: BookOpen, title: 'Learn & Grow', desc: 'AI-curated learning paths, iGOT Karmayogi courses, and smart assessments close your gaps efficiently.' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-bold text-primary text-lg">SkillTwin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="badge-ai inline-flex items-center gap-1.5 mb-6">
          <Sparkles size={12} />
          AI-Powered Competency Intelligence
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 text-balance">
          Know Your Skills.<br />
          <span className="text-primary">Discover Your Gaps.</span><br />
          Master What Matters.
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8 text-balance">
          SkillTwin creates your living competency profile, identifies critical skill gaps, and delivers personalized learning paths — built for government statistical-system employees.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="btn-primary btn-lg w-full sm:w-auto">
            Generate Your Skill Twin <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary btn-lg w-full sm:w-auto">
            Access Demo Environment
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">How SkillTwin Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="card p-6 hover:shadow-card-hover transition-shadow">
              <div className="text-eyebrow text-text-secondary mb-3">{item.step}</div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <item.icon size={20} className="text-primary" />
              </div>
              <h3 className="font-bold text-text-primary mb-2">{item.title}</h3>
              <p className="text-sm text-text-secondary">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* iGOT Banner */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="gradient-primary rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-white/60 text-sm font-medium uppercase tracking-wide mb-2">Integrated with</div>
            <div className="text-2xl font-bold mb-2">iGOT Karmayogi Platform</div>
            <div className="text-white/80 text-sm max-w-md">SkillTwin syncs with India's national learning platform to bring government-approved courses directly into your personalized learning path.</div>
          </div>
          <div className="flex-shrink-0">
            <div className="demo-badge text-sm px-3 py-1.5">DEMO / MOCK INTEGRATION</div>
          </div>
        </div>
      </section>

      {/* Security footer */}
      <footer className="border-t border-border py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-text-secondary text-sm">
          <Shield size={14} />
          Protected by enterprise-grade security · Data stays within government infrastructure
        </div>
      </footer>
    </div>
  );
}
