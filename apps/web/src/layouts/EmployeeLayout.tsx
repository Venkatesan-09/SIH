import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Radar, BookOpen, MoreHorizontal,
  BarChart3, ListChecks, Brain, TrendingUp, Settings, LogOut,
  ChevronRight, Sparkles, MessageSquare, Shield, User, UserCheck
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { useState } from 'react';

const DESKTOP_NAV_GROUPS = [
  {
    label: 'Profile & Twin (Steps 1–5)',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: '1. Dashboard / Home' },
      { to: '/onboarding/profile', icon: UserCheck, label: '2 & 3. Profile & Role' },
      { to: '/assessments', icon: ListChecks, label: '4. Initial Assessment' },
      { to: '/skill-twin/radar', icon: Radar, label: '5. SkillTwin Radar' },
    ]
  },
  {
    label: 'Gaps & Learning (Steps 6–9)',
    items: [
      { to: '/skill-gaps', icon: BarChart3, label: '6. Skill Gap Analysis' },
      { to: '/courses', icon: BookOpen, label: '7 & 9. Recommendations & Courses' },
      { to: '/progress', icon: TrendingUp, label: '8 & 13. Learning Paths & Trajectory' },
    ]
  },
  {
    label: 'AI Studio & Evolution (Steps 10–16)',
    items: [
      { to: '/ai-studio/tutor', icon: MessageSquare, label: '10. AI Learning Studio (Tutor)' },
      { to: '/ai-studio/generate-quiz', icon: Brain, label: '11 & 12. AI Quiz & Attempt' },
      { to: '/assessments', icon: ListChecks, label: '14. Re-Assessment' },
      { to: '/skill-twin/radar', icon: Sparkles, label: '15 & 16. Twin Updated & Growth' },
    ]
  },
  {
    label: 'Account',
    items: [
      { to: '/settings', icon: Settings, label: 'Settings & Profile' },
    ]
  }
];

const MOBILE_NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/skill-twin/radar', icon: Radar, label: 'Twin' },
  { to: '/courses', icon: BookOpen, label: 'Learning' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '#more', icon: MoreHorizontal, label: 'More' },
];

const MORE_ITEMS = [
  { to: '/assessments', icon: ListChecks, label: 'Assessments' },
  { to: '/ai-studio/generate-quiz', icon: Brain, label: 'AI Quiz' },
  { to: '/ai-studio/tutor', icon: MessageSquare, label: 'AI Tutor' },
  { to: '/skill-gaps', icon: BarChart3, label: 'Skill Gaps' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function EmployeeLayout() {
  const [showMore, setShowMore] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* ─── DESKTOP SIDEBAR (Visible lg and up) ─── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-30 bg-surface border-r border-border shadow-sm">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
              <Brain size={20} />
            </div>
            <div>
              <div className="font-bold text-text-primary text-base leading-tight tracking-tight">SkillTwin</div>
              <div className="text-[11px] font-medium text-text-secondary">Competency Intelligence</div>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-border/70 bg-background/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0 border border-primary/20">
              {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm text-text-primary truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-text-secondary truncate">
                {user?.jobRole?.title ?? 'Government Officer'}
              </div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 px-2 py-1 rounded bg-ai-bg/60 text-ai-text text-[11px] font-medium">
            <Sparkles size={12} className="flex-shrink-0" />
            <span className="truncate">{user?.department?.name ?? 'MoSPI Statistical Cadre'}</span>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {DESKTOP_NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary/80 mb-1.5">
                {group.label}
              </div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group ${
                      isActive
                        ? 'bg-primary text-white shadow-sm font-semibold'
                        : 'text-text-secondary hover:bg-background hover:text-text-primary'
                    }`
                  }
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Desktop Logout Button */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-critical-light hover:text-critical transition-colors w-full text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* Desktop Top Header Bar (lg+) */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">MoSPI Workforce</span>
            <span>/</span>
            <span className="capitalize">{location.pathname.replace('/', '').replace(/-/g, ' ') || 'Dashboard'}</span>
          </div>

          <div className="flex items-center gap-4">
            <NavLink
              to="/ai-studio/tutor"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ai-bg text-ai-text text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Sparkles size={14} />
              <span>Ask AI Tutor</span>
            </NavLink>
            <NavLink
              to="/settings"
              className="p-2 rounded-lg hover:bg-background text-text-secondary hover:text-text-primary transition-colors"
              title="Settings"
            >
              <Settings size={18} />
            </NavLink>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </div>

      {/* ─── MOBILE BOTTOM NAV (< lg) ─── */}
      <nav className="lg:hidden bottom-nav z-50 shadow-modal">
        <div className="flex items-stretch justify-around h-14">
          {MOBILE_NAV_ITEMS.map((item) =>
            item.to === '#more' ? (
              <button
                key="more"
                onClick={() => setShowMore(!showMore)}
                className={`bottom-nav-item flex-1 ${showMore ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `bottom-nav-item flex-1 ${isActive ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            )
          )}
        </div>
      </nav>

      {/* Mobile More Sheet */}
      {showMore && (
        <>
          <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setShowMore(false)} />
          <div className="fixed bottom-20 left-0 right-0 z-40 bg-surface border-t border-border rounded-t-2xl shadow-modal animate-slide-up lg:hidden">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-4" />
            <div className="grid grid-cols-4 gap-2 px-4 pb-6">
              {MORE_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setShowMore(false)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-background transition-colors text-text-secondary hover:text-primary"
                >
                  <item.icon size={22} />
                  <span className="text-xs font-medium">{item.label}</span>
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-critical-light transition-colors text-text-secondary hover:text-critical"
              >
                <LogOut size={22} />
                <span className="text-xs font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
