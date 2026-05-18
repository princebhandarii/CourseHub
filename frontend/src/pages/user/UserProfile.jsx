import { useState } from 'react';
import { Camera, Save, Lock, User, Mail, Phone, Globe, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name:    user?.name || '',
    bio:     user?.bio || '',
    phone:   user?.phone || '',
    website: user?.website || '',
  });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(profile).forEach(([k, v]) => fd.append(k, v));
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
    if (passwords.newPass.length < 6) return toast.error('Min 6 characters.');
    setSaving(true);
    try {
      await userService.changePassword({ currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success('Password changed!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'profile',  label: 'Profile',  icon: User },
    { id: 'password', label: 'Security', icon: Lock },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      {/* Avatar section */}
      <div className="card p-6 flex items-center gap-5 mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-3xl font-bold overflow-hidden">
            {user?.avatar
              ? <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
              : user?.name?.[0]?.toUpperCase()
            }
          </div>
          <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
            <Camera className="w-3.5 h-3.5 text-white dark:text-gray-900" />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const f = e.target.files[0];
              if (!f) return;
              const fd = new FormData(); fd.append('avatar', f);
              userService.updateProfile(fd).then(r => { updateUser(r.data.user); toast.success('Avatar updated!'); }).catch(() => toast.error('Upload failed.'));
            }} />
          </label>
        </div>
        <div>
          <div className="font-bold text-lg">{user?.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
          <div className="mt-1">
            <span className={user?.role === 'admin' ? 'badge-blue' : 'badge-gray'}>{user?.role}</span>
          </div>
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
        <div className="card p-6">
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="input pl-10" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="input pl-10" value={user?.email} disabled />
              </div>
            </div>
            <div>
              <label className="label">Bio</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea className="input pl-10 min-h-[80px] resize-none" placeholder="Tell us about yourself..." value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="input pl-10" placeholder="+91 00000 00000" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="input pl-10" placeholder="https://yoursite.com" value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} />
                </div>
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Password tab */}
      {tab === 'password' && (
        <div className="card p-6">
          <form onSubmit={handlePasswordSave} className="space-y-4">
            {[
              { label: 'Current Password', key: 'current' },
              { label: 'New Password',     key: 'newPass' },
              { label: 'Confirm Password', key: 'confirm' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={passwords[key]}
                  onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                  required
                />
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn-primary gap-2">
              <Lock className="w-4 h-4" /> {saving ? 'Saving...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
