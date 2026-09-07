import { Outlet, Link } from 'react-router-dom';
import { Brain, Shield, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Feature Showcase Banner (Visible on lg+) */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary p-12 flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, white 0%, transparent 60%)' }} />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm">
            <Brain size={22} />
          </div>
          <div>
            <div className="font-extrabold text-xl leading-tight tracking-tight">SkillTwin</div>
            <div className="text-white/70 text-xs font-medium">Workforce Competency Intelligence</div>
          </div>
        </div>

        {/* Center Pitch */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm">
            <Sparkles size={13} />
            <span>Ministry of Statistics & Programme Implementation</span>
          </div>

          <h2 className="text-4xl font-black leading-tight tracking-tight text-balance">
            Precision competency intelligence for government officers.
          </h2>

          <p className="text-white/80 text-sm leading-relaxed text-balance">
            Calibrate your statistical skill profile, discover mission-critical gaps, and access curated iGOT Karmayogi learning pathways.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'Deterministic 4-source competency scoring engine',
              'Living Skill Twin vector radar with role benchmarks',
              'Integrated AI assessment generation & tutoring',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-white/90 font-medium">
                <CheckCircle size={15} className="text-accent-teal flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 pt-8 border-t border-white/15 flex items-center justify-between text-xs text-white/70">
          <div className="flex items-center gap-1.5">
            <Shield size={14} />
            <span>Protected by Government Data Standards</span>
          </div>
          <span>v1.0 Operational</span>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 min-h-screen lg:min-h-0 bg-background">
        <div className="w-full max-w-md my-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
