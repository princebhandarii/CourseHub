import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, BookOpen, Users } from 'lucide-react';
import { courseService } from '../../services/api';
import toast from 'react-hot-toast';

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [deleting, setDeleting] = useState(null);

  const load = async (p = 1, q = search) => {
    setLoading(true);
    try {
      const res = await courseService.getAdmin({ page: p, limit: 15, search: q });
      setCourses(res.data.courses);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course and all its content? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await courseService.delete(id);
      toast.success('Course deleted.');
      setCourses(prev => prev.filter(c => c._id !== id));
      setTotal(t => t - 1);
    } catch {
      toast.error('Delete failed.');
    } finally {
      setDeleting(null);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await courseService.togglePublish(id);
      setCourses(prev => prev.map(c => c._id === id ? { ...c, isPublished: res.data.isPublished } : c));
      toast.success(res.data.isPublished ? 'Course published.' : 'Course unpublished.');
    } catch {
      toast.error('Failed to update.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{total} total courses</p>
        </div>
        <Link to="/admin/courses/add" className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Add Course
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-10" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button type="submit" className="btn-secondary">Search</button>
      </form>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Students</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : courses.length > 0 ? (
                courses.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                          {c.thumbnail
                            ? <img src={c.thumbnail} className="w-full h-full object-cover" alt="" />
                            : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-5 h-5 text-gray-400" /></div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[200px]">{c.title}</p>
                          <p className="text-xs text-gray-400">{c.level} · {c.totalLectures || 0} lectures</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.category}</td>
                    <td className="px-4 py-3 font-semibold">
                      {c.price === 0 ? <span className="badge-green">Free</span> : `₹${c.price.toLocaleString()}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Users className="w-3.5 h-3.5" />{c.enrollmentCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleTogglePublish(c._id)} className="group flex items-center gap-1.5">
                        {c.isPublished
                          ? <><Eye className="w-4 h-4 text-green-500" /><span className="badge-green">Published</span></>
                          : <><EyeOff className="w-4 h-4 text-gray-400" /><span className="badge-gray">Draft</span></>
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/courses/edit/${c._id}`} className="btn-ghost p-1.5 rounded-lg" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(c._id)}
                          disabled={deleting === c._id}
                          className="btn-ghost p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          {deleting === c._id
                            ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin block" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    No courses found.{' '}
                    <Link to="/admin/courses/add" className="text-gray-900 dark:text-white font-semibold hover:underline">Create one</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-500">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1}     onClick={() => { setPage(p => p-1); load(page-1); }} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Prev</button>
              <button disabled={page === pages}  onClick={() => { setPage(p => p+1); load(page+1); }} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
