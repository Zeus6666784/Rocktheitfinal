import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/auth.js';
import { useUser } from '../../context/UserContext.jsx';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await login(email, password);
      setUser(user);
      if (user?.role === 'admin') navigate('/admin/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-shell py-12 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full px-3 py-2 border rounded" />
        <div className="relative">
          <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full px-3 py-2 border rounded" />
          <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-2 top-2 text-sm">{showPwd ? 'Hide' : 'Show'}</button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full py-2 bg-primary text-white rounded disabled:opacity-50">{loading ? 'Signing in…' : 'Sign In'}</button>
      </form>
      <p className="mt-4 text-sm">No account? <Link to="/register" className="text-primary">Register</Link></p>
    </div>
  );
}