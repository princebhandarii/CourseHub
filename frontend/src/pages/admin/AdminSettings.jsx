import { useState } from 'react';
import { Save, Shield, Bell, Globe, Database, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);

  const TABS = [
    { id: 'profile',  label: 'Profile',   icon: Shield },
    { id: 'password', label: 'Password',  icon: Eye },
    { id: 'platform', label: 'Platform',  icon: Globe },
  ];

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', profile.name);
      const res = await userService.updateProfile(fd);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) return toast.error('Passwords do not match.');
    if (passwords.newPass.length < 6) return toast.error('Password too short.');
    setSaving(true);
    try {
      await userService.changePassword({ currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success('Password changed successfully!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Manage your admin account and platform settings</p>
      </div>

      {/* Admin profile card */}
      <div className="card p-5 flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 text-2xl font-black flex-shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-bold">{user?.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
          <span className="badge-blue mt-1">Administrator</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === id ? 'bg-white dark:bg-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="card p-6 max-w-lg">
          <h2 className="font-semibold mb-4">Admin Profile</h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="label">Display Name</label>
              <input className="input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input className="input" value={profile.email} disabled />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed from here.</p>
            </div>
            <button type="submit" disabled={saving} className="btn-primary gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Password tab */}
      {tab === 'password' && (
        <div className="card p-6 max-w-lg">
          <h2 className="font-semibold mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            {[
              { label: 'Current Password', key: 'current' },
              { label: 'New Password',     key: 'newPass' },
              { label: 'Confirm New',      key: 'confirm' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="••••••••"
                    value={passwords[key]}
                    onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                    required
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn-primary gap-2">
              <Shield className="w-4 h-4" /> {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* Platform tab */}
      {tab === 'platform' && (
        <div className="card p-6 max-w-lg">
          <h2 className="font-semibold mb-4">Platform Settings</h2>
          <div className="space-y-5">
            {[
              { icon: Bell,     label: 'Email Notifications',   desc: 'Send enrollment confirmation emails to students' },
              { icon: Globe,    label: 'Public Registration',   desc: 'Allow users to self-register on the platform' },
              { icon: Database, label: 'Course Auto-publish',   desc: 'Automatically publish new courses without review' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                  </div>
                </div>
                <ToggleSwitch />
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              ⚠️ Platform settings are stored locally for demo. Connect to backend environment variables for production use.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleSwitch() {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOn(o => !o)}
      className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white dark:bg-gray-900 transition-transform ${on ? 'translate-x-4' : ''}`} />
    </button>
  );
}
