import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock } from 'lucide-react';
import { progressService } from '../../services/api';
import toast from 'react-hot-toast';

export default function ContinueLearning() {
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressService.getContinue()
      .then(r => setRecent(r.data.recent))
      .catch(() => toast.error('Failed to load.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2">Continue Learning</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Pick up where you left off</p>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="card p-4 flex gap-4"><div className="skeleton w-32 h-20 rounded-xl flex-shrink-0" /><div className="flex-1 space-y-2"><div className="skeleton h-4 w-3/4 rounded" /><div className="skeleton h-3 w-1/2 rounded" /></div></div>)}
        </div>
      ) : recent.length > 0 ? (
        <div className="space-y-4">
          {recent.map(item => (
            <div key={item._id} className="card p-4 flex items-center gap-4 hover:-translate-y-0.5 transition-all">
              <div className="relative w-32 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                {item.course?.thumbnail
                  ? <img src={item.course.thumbnail} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full flex items-center justify-center"><Play className="w-8 h-8 text-gray-300" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">{item.course?.title}</p>
                <h3 className="font-semibold text-sm line-clamp-1 mb-1">{item.video?.title}</h3>
                {item.watchedTime && item.duration ? (
                  <div>
                    <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (item.watchedTime / item.duration) * 100)}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.floor(item.watchedTime / 60)}:{String(item.watchedTime % 60).padStart(2, '0')} / {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
                    </p>
                  </div>
                ) : null}
              </div>
              <Link to={`/watch/${item.course?._id}/${item.video?._id}`} className="btn-primary text-xs py-2 flex-shrink-0">
                <Play className="w-3.5 h-3.5" /> Resume
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Play className="w-16 h-16 mx-auto text-gray-200 dark:text-gray-800 mb-4" />
          <h2 className="text-xl font-bold mb-2">No recent activity</h2>
          <p className="text-gray-400 mb-6">Start watching a course to see your progress here.</p>
          <Link to="/my-courses" className="btn-primary">My Courses</Link>
        </div>
      )}
    </div>
  );
}
