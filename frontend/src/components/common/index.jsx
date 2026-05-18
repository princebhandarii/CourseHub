// ─── Footer.jsx ───────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';
import { GraduationCap, Twitter, Github, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-3">
              <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white dark:text-gray-900" />
              </div>
              CourseHub
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Empowering learners worldwide with world-class online education.
            </p>
            <div className="flex gap-3 mt-4">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Platform', links: [['Courses', '/courses'], ['About', '/about'], ['Contact', '/contact']] },
            { title: 'Account',  links: [['Login', '/login'], ['Sign Up', '/signup'], ['My Courses', '/my-courses']] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(([label, to]) => (
                  <li key={to}><Link to={to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} CourseHub. All rights reserved.</p>
          <p className="text-xs text-gray-400">Built with Prince</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

// ─── CourseCard.jsx ───────────────────────────────────────────────────────────
export function CourseCard({ course, onWishlist, wishlisted }) {
  const { Link } = require('react-router-dom');
  const { Heart, Star, Clock, Users, BookOpen } = require('lucide-react');

  return (
    <div className="card group overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300">
      <div className="relative overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600" /></div>
        }
        {/* Wishlist button */}
        {onWishlist && (
          <button
            onClick={(e) => { e.preventDefault(); onWishlist(course._id); }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        )}
        {/* Level badge */}
        <div className="absolute bottom-2 left-2">
          <span className="badge-gray text-xs">{course.level}</span>
        </div>
      </div>

      <Link to={`/courses/${course._id}`}>
        <div className="p-4">
          <div className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium uppercase tracking-wide">{course.category}</div>
          <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            {course.title}
          </h3>
          {course.instructor && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{course.instructor.name}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
            {course.rating > 0 && (
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="w-3 h-3 fill-current" /> {course.rating.toFixed(1)}
                <span className="text-gray-400 font-normal">({course.ratingCount})</span>
              </span>
            )}
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.enrollmentCount}</span>
            {course.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold">
                {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString()}`}
              </span>
              {course.originalPrice > 0 && course.price < course.originalPrice && (
                <span className="text-xs text-gray-400 line-through ml-1.5">₹{course.originalPrice.toLocaleString()}</span>
              )}
            </div>
            {course.price === 0 && <span className="badge-green">Free</span>}
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─── LoadingSkeleton.jsx ──────────────────────────────────────────────────────
export function CourseCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-video w-full" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-20 rounded mt-3" />
      </div>
    </div>
  );
}

// ─── StarRating.jsx ───────────────────────────────────────────────────────────
export function StarRating({ rating, onChange, readonly = false }) {
  const { Star } = require('lucide-react');
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          className={`transition-transform ${readonly ? '' : 'hover:scale-125 cursor-pointer'}`}
        >
          <Star
            className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
          />
        </button>
      ))}
    </div>
  );
}
