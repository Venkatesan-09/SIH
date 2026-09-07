import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { User, Bell, Shield, Palette, Save, Loader2, ChevronRight, Moon, Sun, Monitor, Sparkles } from 'lucide-react';
import { toast } from '../../components/ui/toaster';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState('profile');
  const qc = useQueryClient();

  const { data: prefs } = useQuery({
    queryKey: ['preferences'],
    queryFn: () => api.get('/users/me/preferences').then(r => r.data.preferences)
  });

  const [profile, setProfile] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '' });
  const [notifPrefs, setNotifPrefs] = useState({ emailNotifications: true, pushNotifications: true, weeklyDigest: true, assessmentReminders: true });

  useEffect(() => {
    if (prefs) {
      // Sync theme from server only on initial load if local theme is default
      const stored = localStorage.getItem('skilltwin-theme');
      if (!stored && prefs.theme) {
        setTheme(prefs.theme as any);
      }
      setNotifPrefs({
        emailNotifications: prefs.emailNotifications ?? true,
        pushNotifications: prefs.pushNotifications ?? true,
        weeklyDigest: prefs.weeklyDigest ?? true,
        assessmentReminders: prefs.assessmentReminders ?? true,
      });
    }
  }, [prefs]);

  const profileMutation = useMutation({
    mutationFn: () => api.patch('/users/me', profile),
    onSuccess: (res) => { updateUser(res.data.user); toast({ title: 'Profile updated', variant: 'success' }); },
    onError: () => toast({ title: 'Update failed', variant: 'destructive' }),
  });

  const prefsMutation = useMutation({
    mutationFn: (newTheme?: string) =>
      api.patch('/users/me/preferences', { ...notifPrefs, theme: newTheme ?? theme }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['preferences'] });
      toast({ title: 'Preferences saved', variant: 'success' });
    },
    onError: () => toast({ title: 'Save failed', variant: 'destructive' }),
  });

  const handleSelectTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    prefsMutation.mutate(newTheme);
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Page Header */}
      <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">Settings & Preferences</h1>
          <p className="text-sm text-text-secondary mt-1">Manage personal statistical credentials, notifications, and appearance options.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Tab bar */}
        <div className="flex border-b border-border mb-6 gap-2 sm:gap-6 overflow-x-auto scrollbar-none">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-bold border-b-2 flex-shrink-0 transition-colors ${
                activeTab === t.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <t.icon size={16} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-6">
        {/* Profile tab */}
        {activeTab === 'profile' && (
          <>
            <div className="card p-5 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-xl font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
              </div>
              <div className="text-center">
                <div className="font-bold">{user?.firstName} {user?.lastName}</div>
                <div className="text-sm text-text-secondary">{user?.email}</div>
                <div className="text-xs text-text-secondary mt-1">{user?.department?.name ?? 'MoSPI Statistical Cadre'} · {user?.jobRole?.title ?? 'Statistical Officer'}</div>
              </div>
            </div>

            {/* Launch Setup Wizard (Step 2 & 3) */}
            <div className="card p-5 border border-primary/40 bg-gradient-to-r from-primary/10 via-surface to-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-1">
                  <Sparkles size={14} /> Workflow Wizard (Step 2 & 3)
                </div>
                <div className="font-extrabold text-base text-text-primary">Complete Profile & Role Competencies</div>
                <div className="text-xs text-text-secondary mt-0.5">Configure your education, work experience, department, job role & target proficiency levels.</div>
              </div>
              <Link to="/onboarding/profile" className="btn-primary whitespace-nowrap text-xs font-bold py-2.5 px-4 flex items-center justify-center gap-1.5">
                <span>Launch Wizard →</span>
              </Link>
            </div>
            <div className="card p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">First Name</label><input className="input" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} /></div>
                <div><label className="label">Last Name</label><input className="input" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} /></div>
              </div>
              <div><label className="label">Email</label><input className="input" value={user?.email ?? ''} disabled /></div>
              <button onClick={() => profileMutation.mutate()} disabled={profileMutation.isPending} className="btn-primary w-full">
                {profileMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {profileMutation.isPending ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </>
        )}

        {/* Notifications tab */}
        {activeTab === 'notifications' && (
          <div className="card p-5 space-y-4">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push alerts' },
              { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your progress every week' },
              { key: 'assessmentReminders', label: 'Assessment Reminders', desc: 'Reminders for pending assessments' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-text-secondary">{item.desc}</div>
                </div>
                <button onClick={() => setNotifPrefs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))} className={`toggle ${notifPrefs[item.key as keyof typeof notifPrefs] ? 'active' : ''}`} />
              </div>
            ))}
            <button onClick={() => prefsMutation.mutate()} disabled={prefsMutation.isPending} className="btn-primary w-full">
              {prefsMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {prefsMutation.isPending ? 'Saving…' : 'Save Preferences'}
            </button>
          </div>
        )}

        {/* Security tab */}
        {activeTab === 'security' && (
          <div className="card p-5 space-y-3">
            {[
              { label: 'Change Password', desc: 'Update your login credentials' },
              { label: 'Two-Factor Authentication', desc: '2FA (coming soon)' },
              { label: 'Active Sessions', desc: 'Manage where you are logged in' },
            ].map(item => (
              <button key={item.label} className="flex items-center justify-between w-full py-2 hover:text-primary transition-colors">
                <div className="text-left">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-text-secondary">{item.desc}</div>
                </div>
                <ChevronRight size={16} className="text-text-secondary" />
              </button>
            ))}
          </div>
        )}

        {/* Appearance tab */}
        {activeTab === 'appearance' && (
          <div className="card p-5 space-y-4">
            <div>
              <div className="font-medium text-sm">Interface Theme</div>
              <div className="text-xs text-text-secondary mt-0.5">Customize your viewing experience</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Monitor },
              ].map(t => {
                const Icon = t.icon;
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTheme(t.id as any)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-card border-2 font-medium text-sm transition-all duration-150 ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border hover:border-primary/50 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon size={20} className={isSelected ? 'text-primary' : 'text-text-secondary'} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="pt-2">
              <button
                onClick={() => prefsMutation.mutate()}
                disabled={prefsMutation.isPending}
                className="btn-primary w-full"
              >
                {prefsMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {prefsMutation.isPending ? 'Saving…' : 'Save Appearance'}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
