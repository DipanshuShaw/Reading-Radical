import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';
import registerImage from '../Images/reviewers-sec2-pic.jpg';
import AuthShell from './AuthShell';

const input = 'w-full px-4 py-2.5 rounded-lg bg-amber-50 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', name: '', password: '', is_reviewer: false });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!agree) return setError('Please accept the Terms & Privacy Policy to continue.');
    setBusy(true);
    try {
      const data = await api('/api/users/register', { method: 'POST', body: form });
      login(data, true);
      navigate(location.state?.from || '/home', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell image={registerImage} title="Create account" subtitle="Join the community of readers and reviewers.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm mb-1">Username</label>
          <input id="name" required maxLength={100} autoComplete="username" className={input} value={form.name} onChange={set('name')} placeholder="Username" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm mb-1">Email</label>
          <input id="email" type="email" required autoComplete="email" className={input} value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm mb-1">Password <span className="text-gray-300">(min 6 characters)</span></label>
          <input id="password" type="password" required minLength={6} autoComplete="new-password" className={input} value={form.password} onChange={set('password')} placeholder="Password" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_reviewer} onChange={set('is_reviewer')} className="w-4 h-4" />
          Become a Reviewer
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="w-4 h-4 mt-0.5" />
          <span>
            I agree to the{' '}
            <Link to="/legal#terms" target="_blank" className="text-sky-300 hover:underline">Terms</Link> &amp;{' '}
            <Link to="/legal#privacy" target="_blank" className="text-sky-300 hover:underline">Privacy Policy</Link>.
          </span>
        </label>
        {error && <p className="text-sm text-red-300 bg-red-950/60 rounded-md px-3 py-2" role="alert">{error}</p>}
        <button type="submit" disabled={busy}
          className="w-full bg-brand text-white py-2.5 rounded-lg font-semibold hover:bg-brand-dark transition disabled:opacity-60">
          {busy ? 'Creating account…' : 'Register'}
        </button>
        <p className="text-center text-sm">
          Already have an account? <Link to="/login" state={location.state} className="text-sky-300 hover:underline">Log in</Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default Register;
