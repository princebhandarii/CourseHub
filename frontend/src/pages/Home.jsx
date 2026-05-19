import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, BookOpen, Users, Award, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { courseService, wishlistService } from '../services/api';
import CourseCard from '../components/common/CourseCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATS = [
  { icon: BookOpen, label: 'Courses',   value: '500+' },
  { icon: Users,    label: 'Students',  value: '50K+' },
  { icon: Award,    label: 'Instructors', value: '100+' },
  { icon: Star,     label: 'Avg Rating', value: '4.8' },
];

const FEATURES = [
  { title: 'Learn at Your Pace',    desc: 'Access course content anytime, on any device.', icon: Play },
  { title: 'Expert Instructors',    desc: 'Learn from industry professionals with real experience.', icon: Award },
  { title: 'Track Your Progress',   desc: 'Visual dashboards to keep you motivated.', icon: TrendingUp },
  { title: 'Lifetime Access',       desc: 'Buy once, access forever—including updates.', icon: BookOpen },
];

const TESTIMONIALS = [
  { name: 'Aisha Khan',    role: 'Frontend Developer', text: 'CourseHub transformed my career. I landed my first dev job after completing just 3 courses.', rating: 5 },
  { name: 'Rahul Sharma',  role: 'Data Analyst',       text: 'The best learning platform I\'ve tried. Clean interface, great instructors, and real projects.', rating: 5 },
  { name: 'Priya Patel',   role: 'ML Engineer',        text: 'I love how structured the courses are. I went from zero ML knowledge to building real models.', rating: 5 },
];

export default function Home() {
  const { user } = useAuth();
  const [courses,   setCourses]   = useState([]);
  const [wishlist,  setWishlist]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      courseService.getAll({ limit: 8, sort: 'popular' }),
      user ? wishlistService.get() : Promise.resolve(null),
    ]).then(([cr, wr]) => {
      setCourses(cr.data.courses);
      if (wr) setWishlist(wr.data.courses.map(c => c._id));
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  const handleWishlist = async (id) => {
    if (!user) return toast.error('Login to add to wishlist');
    const res = await wishlistService.toggle(id);
    setWishlist(prev => res.data.added ? [...prev, id] : prev.filter(w => w !== id));
    toast.success(res.data.message);
  };

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 pt-20 pb-24">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />
          <div className="absolute -bottom-1/4 -left-1/4 w-80 h-80 rounded-full bg-gray-100 dark:bg-gray-800 opacity-40 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium mb-6 animate-fade-in">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>10,000+ students enrolled this month</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in">
            <span className="text-gradient">Learn Without</span>
            <br />
            <span>Limits.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8 animate-fade-in">
            Master in-demand skills with expert-led courses. Build real projects, earn certificates, and land your dream job.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link to="/courses" className="btn-primary px-8 py-3 text-base">
              Explore Courses <ArrowRight className="w-5 h-5" />
            </Link>
            {!user && (
              <Link to="/signup" className="btn-secondary px-8 py-3 text-base">
                Start for Free
              </Link>
            )}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 mt-14">
            {STATS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold">{value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-center mt-0.5">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Featured Courses</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Handpicked by our experts</p>
          </div>
          <Link to="/courses" className="flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton aspect-video w-full" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
          <div className="text-center py-16 text-gray-400">No courses yet. Check back soon!</div>
        )}
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">Why CourseHub?</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">Everything you need to succeed</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ title, desc, icon: Icon }) => (
              <div key={title} className="card p-6 hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">What Our Students Say</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-12">Join thousands of happy learners</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, text, rating }) => (
            <div key={name} className="card p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 italic">"{text}"</p>
              <div>
                <div className="font-semibold text-sm">{name}</div>
                <div className="text-xs text-gray-400">{role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-16 mx-4 sm:mx-8 lg:mx-16 rounded-3xl mb-16">
        <div className="text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-gray-300 dark:text-gray-600 mb-8 max-w-xl mx-auto">
            Join over 50,000 learners who are already building their futures on CourseHub.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Browse Courses <ArrowRight className="w-5 h-5" />
            </Link>
            {!user && (
              <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-white/30 dark:border-gray-700 text-white dark:text-gray-900 font-semibold hover:border-white/60 transition-colors">
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
