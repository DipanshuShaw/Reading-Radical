import { useContext, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';
import loginImage from '../Images/reviewers-sec1-pic.jpg';
import AuthShell from './AuthShell';

const input = 'w-full px-4 py-2.5 rounded-lg bg-amber-50 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api('/api/users/login', { method: 'POST', body: form });
      login(data, remember);
      navigate(location.state?.from || '/home', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell image={loginImage} title="Welcome back" subtitle="Log in to keep reading and reviewing.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm mb-1">Email</label>
          <input id="email" type="email" required autoComplete="email" className={input} value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm mb-1">Password</label>
          <input id="password" type="password" required autoComplete="current-password" className={input} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember me
        </label>
        {error && <p className="text-sm text-red-300 bg-red-950/60 rounded-md px-3 py-2" role="alert">{error}</p>}
        <button type="submit" disabled={busy}
          className="w-full bg-brand text-white py-2.5 rounded-lg font-semibold hover:bg-brand-dark transition disabled:opacity-60">
          {busy ? 'Logging in…' : 'Log in'}
        </button>
        <p className="text-center text-sm">
          New here? <Link to="/register" state={location.state} className="text-sky-300 hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default Login;
