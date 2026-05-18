// MyCourses.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { enrollmentService } from '../../services/api';
import toast from 'react-hot-toast';

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    enrollmentService.getMyEnrolled()
      .then(r => setEnrollments(r.data.enrollments))
      .catch(() => toast.error('Failed to load your courses.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2">My Courses</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled</p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton aspect-video" />
              <div className="p-4 space-y-2"><div className="skeleton h-4 w-full rounded" /><div className="skeleton h-3 w-2/3 rounded" /></div>
            </div>
          ))}
        </div>
      ) : enrollments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrollments.map(en => {
            const c = en.course;
            if (!c) return null;
            const pct = en.progressPercent || 0;
            return (
              <div key={en._id} className="card overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {c.thumbnail
                    ? <img src={`https://coursehub-b7gs.onrender.com${c.thumbnail}`} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-10 h-10 text-gray-300" /></div>
                  }
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link to={`/watch/${c._id}`} className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-gray-900 ml-0.5" />
                    </Link>
                  </div>
                  {pct === 100 && (
                    <div className="absolute top-2 right-2"><span className="badge-green gap-1"><CheckCircle className="w-3 h-3" />Completed</span></div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2">{c.title}</h3>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{pct}% complete</span>
                      {c.totalLectures > 0 && <span>{c.totalLectures} lectures</span>}
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <Link to={`/watch/${c._id}`} className="btn-primary w-full justify-center py-2 text-xs">
                    {pct === 0 ? 'Start Learning' : pct === 100 ? 'Review Course' : 'Continue'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 mx-auto text-gray-200 dark:text-gray-800 mb-4" />
          <h2 className="text-xl font-bold mb-2">No courses yet</h2>
          <p className="text-gray-400 mb-6">Explore our catalog and start learning today.</p>
          <Link to="/courses" className="btn-primary">Browse Courses</Link>
        </div>
      )}
    </div>
  );
}
