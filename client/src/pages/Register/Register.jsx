import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/auth.js';
import { useUser } from '../../context/UserContext.jsx';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      const { user } = await register(name, email, password);
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-shell py-12 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" required className="w-full px-3 py-2 border rounded" />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full px-3 py-2 border rounded" />
        <div className="relative">
          <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full px-3 py-2 border rounded" />
          <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-2 top-2 text-sm">{showPwd ? 'Hide' : 'Show'}</button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full py-2 bg-primary text-white rounded disabled:opacity-50">{loading ? 'Creating account…' : 'Register'}</button>
      </form>
      <p className="mt-4 text-sm">Already have an account? <Link to="/signin" className="text-primary">Sign in</Link></p>
    </div>
  );
}