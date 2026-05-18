import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { courseService, wishlistService } from '../services/api';
import CourseCard from '../components/common/CourseCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LEVELS    = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const SORT_OPTS = [
  { value: 'newest',   label: 'Newest' },
  { value: 'popular',  label: 'Most Popular' },
  { value: 'rating',   label: 'Highest Rated' },
  { value: 'priceAsc', label: 'Price: Low to High' },
  { value: 'priceDsc', label: 'Price: High to Low' },
];

export default function Courses() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses,    setCourses]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlist,   setWishlist]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [total,      setTotal]      = useState(0);
  const [pages,      setPages]      = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    search:   searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level:    searchParams.get('level') || '',
    sort:     searchParams.get('sort') || 'newest',
    page:     Number(searchParams.get('page')) || 1,
  });

  // Debounced fetch
  const fetchCourses = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = { limit: 12, ...f };
      if (!params.category) delete params.category;
      if (!params.level)    delete params.level;
      if (!params.search)   delete params.search;

      const res = await courseService.getAll(params);
      setCourses(res.data.courses);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(filters); }, [filters]);

  useEffect(() => {
    courseService.getCategories().then(r => setCategories(r.data.categories));
    if (user) wishlistService.get().then(r => setWishlist(r.data.courses.map(c => c._id)));
  }, [user]);

  const updateFilter = (key, val) => {
    const next = { ...filters, [key]: val, page: key === 'page' ? val : 1 };
    setFilters(next);
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => v && params.set(k, v));
    setSearchParams(params);
  };

  const clearFilters = () => {
    const reset = { search: '', category: '', level: '', sort: 'newest', page: 1 };
    setFilters(reset);
    setSearchParams({});
  };

  const handleWishlist = async (id) => {
    if (!user) return toast.error('Login to save courses.');
    const res = await wishlistService.toggle(id);
    setWishlist(prev => res.data.added ? [...prev, id] : prev.filter(w => w !== id));
    toast.success(res.data.message);
  };

  const hasActiveFilters = filters.category || filters.level || filters.search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">All Courses</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {loading ? 'Loading...' : `${total} course${total !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-10"
            placeholder="Search courses..."
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
          />
        </div>
        <select
          className="input sm:w-48"
          value={filters.sort}
          onChange={e => updateFilter('sort', e.target.value)}
        >
          {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button onClick={() => setShowFilter(o => !o)} className="btn-secondary gap-2">
          <SlidersHorizontal className="w-4 h-4" /> Filters
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-gray-900 dark:bg-white" />}
        </button>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="card p-5 mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in">
          {/* Category */}
          <div className="col-span-2 sm:col-span-1">
            <label className="label">Category</label>
            <select className="input" value={filters.category} onChange={e => updateFilter('category', e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {/* Level */}
          <div>
            <label className="label">Level</label>
            <select className="input" value={filters.level} onChange={e => updateFilter('level', e.target.value)}>
              <option value="">All Levels</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          {/* Clear */}
          {hasActiveFilters && (
            <div className="flex items-end">
              <button onClick={clearFilters} className="btn-ghost gap-1 text-red-500 hover:text-red-600">
                <X className="w-4 h-4" /> Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.category && (
            <span className="badge-gray gap-1">
              {filters.category}
              <button onClick={() => updateFilter('category', '')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.level && (
            <span className="badge-gray gap-1">
              {filters.level}
              <button onClick={() => updateFilter('level', '')}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton aspect-video" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-3 w-16 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-2/3 rounded" />
                <div className="skeleton h-5 w-20 rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map(course => (
            <CourseCard
              key={course._id}
              course={course}
              onWishlist={handleWishlist}
              wishlisted={wishlist.includes(course._id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <Search className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <h3 className="font-semibold text-lg mb-1">No courses found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your filters or search term</p>
          <button onClick={clearFilters} className="btn-primary mt-4">Clear Filters</button>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            disabled={filters.page === 1}
            onClick={() => updateFilter('page', filters.page - 1)}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          {[...Array(pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => updateFilter('page', i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                filters.page === i + 1
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={filters.page === pages}
            onClick={() => updateFilter('page', filters.page + 1)}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
