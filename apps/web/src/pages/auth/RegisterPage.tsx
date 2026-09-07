import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';
import { toast } from '../../components/ui/toaster';

function PasswordCheck({ pass, label }: { pass: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${pass ? 'text-accent-teal' : 'text-text-secondary'}`}>
      {pass ? <Check size={11} /> : <X size={11} />} {label}
    </div>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const pw = form.password;
  const checks = {
    len: pw.length >= 12,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    digit: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
  const allPass = Object.values(checks).every(Boolean) && form.password === form.confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPass) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password });
      setAuth(data.user, data.accessToken);
      toast({
        title: `Welcome to SkillTwin, ${data.user.firstName || 'User'}!`,
        description: 'Account created successfully.',
        variant: 'success',
      });
      navigate('/onboarding/profile');
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err?.response?.data?.error?.message ?? 'Please try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-primary text-lg leading-tight">SkillTwin</div>
            <div className="text-xs text-text-secondary">Create Account</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-1">Create your Skill Twin</h1>
        <p className="text-text-secondary text-sm mb-6">Join thousands of government employees growing smarter</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name</label>
              <input type="text" required className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Arun" />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input type="text" required className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Kumar" />
            </div>
          </div>
          <div>
            <label className="label">Government Email</label>
            <input type="email" required className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="name@ministry.gov.in" />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required className="input pr-10" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Create a strong password" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2 grid grid-cols-2 gap-1">
                <PasswordCheck pass={checks.len} label="12+ characters" />
                <PasswordCheck pass={checks.upper} label="Uppercase letter" />
                <PasswordCheck pass={checks.lower} label="Lowercase letter" />
                <PasswordCheck pass={checks.digit} label="Number" />
                <PasswordCheck pass={checks.special} label="Special character" />
              </div>
            )}
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input type="password" required className={`input ${form.confirm && form.confirm !== form.password ? 'input-error' : ''}`} value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat password" />
            {form.confirm && form.confirm !== form.password && (
              <div className="text-critical text-xs mt-1">Passwords do not match</div>
            )}
          </div>
          <button type="submit" disabled={loading || !allPass} className="btn-primary w-full">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Creating account…' : 'Create My Skill Twin'}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
