import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, GraduationCap, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate  = useNavigate();

  const [form,    setForm]    = useState({ password: '', confirm: '' });
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match.');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');

    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password: form.password });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-8">
            <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white dark:text-gray-900" />
            </div>
            CourseHub
          </Link>

          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Password Reset!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Your password has been updated. Redirecting to login...
              </p>
              <Link to="/login" className="btn-primary justify-center w-full">Go to Login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">Reset Password</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Enter your new password below.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={show ? 'text' : 'password'}
                      className="input pl-10 pr-10"
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      required
                    />
                    <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      className="input pl-10"
                      placeholder="Re-enter new password"
                      value={form.confirm}
                      onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    : 'Reset Password'
                  }
                </button>
              </form>

              <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mt-5">
                Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
