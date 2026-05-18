import { useState, useEffect } from 'react';
import { Search, UserPlus, ShieldOff, Shield, Trash2, X } from 'lucide-react';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';

function AddUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminService.createUser(form);
      toast.success('User created!');
      onCreated(res.data.user);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="card p-6 w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">Add New User</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" placeholder="John Doe" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input type="email" className="input" placeholder="user@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManageUsers() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [showModal,setShowModal]= useState(false);
  const [filter,   setFilter]   = useState('');

  const load = async (p = 1, q = search, blocked = filter) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 15, search: q };
      if (blocked !== '') params.isBlocked = blocked;
      const res = await adminService.getUsers(params);
      setUsers(res.data.users);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(1, search, filter); };

  const handleBlock = async (id) => {
    try {
      const res = await adminService.toggleBlock(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isBlocked: res.data.isBlocked } : u));
      toast.success(res.data.message);
    } catch { toast.error('Failed to update user.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this user?')) return;
    try {
      await adminService.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      setTotal(t => t - 1);
      toast.success('User deleted.');
    } catch { toast.error('Delete failed.'); }
  };

  const handleFilterChange = (val) => {
    setFilter(val);
    setPage(1);
    load(1, search, val);
  };

  return (
    <div>
      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onCreated={(u) => { setUsers(prev => [u, ...prev]); setTotal(t => t + 1); }}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{total} total users</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input pl-10" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button type="submit" className="btn-secondary">Search</button>
        </form>
        <select className="input sm:w-40" value={filter} onChange={e => handleFilterChange(e.target.value)}>
          <option value="">All Users</option>
          <option value="false">Active</option>
          <option value="true">Blocked</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden">
                          {u.avatar
                            ? <img src={u.avatar} className="w-full h-full object-cover" alt="" />
                            : u.name?.[0]?.toUpperCase()
                          }
                        </div>
                        <span className="font-medium truncate max-w-[140px]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      {u.isBlocked
                        ? <span className="badge-red">Blocked</span>
                        : <span className="badge-green">Active</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleBlock(u._id)}
                          className={`btn-ghost p-1.5 rounded-lg ${u.isBlocked ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                          title={u.isBlocked ? 'Unblock' : 'Block'}
                        >
                          {u.isBlocked ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="btn-ghost p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-500">Page {page} of {pages} · {total} users</span>
            <div className="flex gap-2">
              <button disabled={page === 1}    onClick={() => { setPage(p => p-1); load(page-1); }} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Prev</button>
              <button disabled={page === pages} onClick={() => { setPage(p => p+1); load(page+1); }} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
