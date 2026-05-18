import { Link } from 'react-router-dom';
import { Heart, Star, Clock, Users, BookOpen } from 'lucide-react';

export default function CourseCard({ course, onWishlist, wishlisted }) {
  // Backend URL
  const BACKEND_URL = 'https://coursehub-b7gs.onrender.com';

  // Thumbnail Fix
  const thumbnailUrl = course.thumbnail
    ? course.thumbnail.startsWith('http')
      ? course.thumbnail
      : `${BACKEND_URL}${course.thumbnail.startsWith('/') ? '' : '/'}${course.thumbnail}`
    : null;

  return (
    <div className="card group overflow-hidden hover:-translate-y-1 transition-all duration-300">
      
      {/* Thumbnail */}
      <div className="relative overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800">
        
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          </div>
        )}

        {/* Wishlist button */}
        {onWishlist && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWishlist(course._id);
            }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-4 h-4 ${
                wishlisted
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-400'
              }`}
            />
          </button>
        )}

        {/* Free badge */}
        {course.price === 0 && (
          <div className="absolute top-2 left-2">
            <span className="badge-green text-xs">Free</span>
          </div>
        )}
      </div>

      <Link to={`/courses/${course._id}`}>
        <div className="p-4">

          {/* Category + Level */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">
              {course.category}
            </span>

            <span className="badge-gray text-xs">
              {course.level}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors">
            {course.title}
          </h3>

          {/* Instructor */}
          {course.instructor && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              by {course.instructor.name}
            </p>
          )}

          {/* Rating + Students + Duration */}
          <div className="flex items-center flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">

            {course.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-amber-500 font-semibold">
                  {course.rating.toFixed(1)}
                </span>
                <span>({course.ratingCount})</span>
              </span>
            )}

            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {course.enrollmentCount} students
            </span>

            {course.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {course.duration}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">

            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold">
                {course.price === 0
                  ? 'Free'
                  : `₹${course.price.toLocaleString()}`}
              </span>

              {course.originalPrice > 0 &&
                course.price < course.originalPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    ₹{course.originalPrice.toLocaleString()}
                  </span>
                )}
            </div>

            {course.originalPrice > 0 &&
              course.price < course.originalPrice && (
                <span className="badge-green text-xs">
                  {Math.round(
                    (1 - course.price / course.originalPrice) * 100
                  )}
                  % off
                </span>
              )}
          </div>
        </div>
      </Link>
    </div>
  );
}
