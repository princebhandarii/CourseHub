import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, GraduationCap, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

export default function AdminSignup() {
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name: '', email: '', password: '', adminSecret: '' });
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/admin/register', form);
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      toast.success('Admin account created!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white dark:text-gray-900" />
              </div>
              CourseHub
            </Link>
            <button onClick={toggle} className="btn-ghost p-2 rounded-lg">{dark ? '☀️' : '🌙'}</button>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Create Admin Account</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Requires admin secret key</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name',    key: 'name',        type: 'text',     ph: 'Admin Name' },
              { label: 'Email',        key: 'email',       type: 'email',    ph: 'admin@coursehub.com' },
            ].map(({ label, key, type, ph }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input type={type} className="input" placeholder={ph} value={form[key]} onChange={set(key)} required />
              </div>
            ))}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} className="input pr-10" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Admin Secret Key</label>
              <input type="password" className="input" placeholder="Secret key from .env" value={form.adminSecret} onChange={set('adminSecret')} required />
              <p className="text-xs text-gray-400 mt-1">Set ADMIN_SECRET in your backend .env file</p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 'Create Admin Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an admin account?{' '}
            <Link to="/admin/login" className="font-semibold text-gray-900 dark:text-white hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
