import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Eye, EyeOff, Shield, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';
import { toast } from '../../components/ui/toaster';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.accessToken);
      toast({
        title: `Welcome back, ${data.user.firstName || 'User'}!`,
        description: 'Successfully signed into your SkillTwin profile.',
        variant: 'success',
      });

      if (data.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        const status = data.user.onboardingStatus;
        if (data.user.skillTwinGenerated || status === 'COMPLETED') {
          navigate('/dashboard');
        } else if (data.user.assessmentCompleted || status === 'SKILLTWIN_REQUIRED') {
          navigate('/onboarding/profile?step=5');
        } else if (data.user.roleCompleted || status === 'ASSESSMENT_REQUIRED') {
          navigate('/onboarding/profile?step=4');
        } else if (data.user.profileCompleted || status === 'ROLE_REQUIRED') {
          navigate('/onboarding/profile?step=3');
        } else {
          navigate('/onboarding/profile?step=2');
        }
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        (err?.response?.status === 401 ? 'Invalid email or password.' : 'Failed to connect to the server. Please try again.');
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: 'employee' | 'admin') => {
    setEmail(role === 'admin' ? 'admin@skilltwin.gov.in' : 'demo@skilltwin.gov.in');
    setPassword(role === 'admin' ? 'Admin@12345' : 'Demo@12345');
  };

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-primary text-lg leading-tight">SkillTwin</div>
            <div className="text-xs text-text-secondary">Secure Authentication</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-text-secondary text-sm mb-6">Sign in to your competency profile</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">Government ID / Email</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="your.name@gov.in" />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <div className="relative">
              <input id="password" type={showPw ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="input pr-10" placeholder="••••••••••••" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                className="rounded"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              /> Remember this device
            </label>
            <button type="button" className="text-primary hover:underline">Forgot credentials?</button>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2">
          <div className="text-xs text-text-secondary text-center">— Quick Fill Credentials —</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('emp1@mospi.gov.in');
                setPassword('Employee@123');
              }}
              className="btn-secondary text-xs py-2 text-center"
            >
              MoSPI Employee
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@mospi.gov.in');
                setPassword('Admin@123');
              }}
              className="btn-secondary text-xs py-2 text-center"
            >
              MoSPI Admin
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
        </p>
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-text-secondary">
        <Shield size={12} /> Protected by AI Security · Govt. Infrastructure
      </div>
    </div>
  );
}
