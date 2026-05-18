import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, BookOpen } from 'lucide-react';
import { wishlistService } from '../../services/api';
import CourseCard from '../../components/common/CourseCard';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    wishlistService.get()
      .then(r => setCourses(r.data.courses))
      .catch(() => toast.error('Failed to load wishlist.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id) => {
    await wishlistService.toggle(id);
    setCourses(prev => prev.filter(c => c._id !== id));
    toast.success('Removed from wishlist.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-7 h-7" />
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{courses.length} saved course{courses.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton aspect-video" />
              <div className="p-4 space-y-2"><div className="skeleton h-4 w-full rounded" /><div className="skeleton h-3 w-2/3 rounded" /></div>
            </div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map(c => (
            <CourseCard
              key={c._id}
              course={c}
              onWishlist={handleRemove}
              wishlisted={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 mx-auto text-gray-200 dark:text-gray-800 mb-4" />
          <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 mb-6">Save courses you're interested in to review them later.</p>
          <Link to="/courses" className="btn-primary">Explore Courses</Link>
        </div>
      )}
    </div>
  );
}
