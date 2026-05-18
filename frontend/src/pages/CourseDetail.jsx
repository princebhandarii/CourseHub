import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star, Clock, Users, BookOpen, Award, Play, Heart, Share2,
  ChevronDown, ChevronUp, CheckCircle, Lock, Globe, ArrowLeft
} from 'lucide-react';
import { courseService, enrollmentService, reviewService, wishlistService, paymentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function StarRating({ rating, onChange, readonly }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button" disabled={readonly} onClick={() => onChange && onChange(s)}
          className={`transition-transform ${readonly ? '' : 'hover:scale-125 cursor-pointer'}`}>
          <Star className={`w-5 h-5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
        </button>
      ))}
    </div>
  );
}

// Load Razorpay script dynamically
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course,    setCourse]    = useState(null);
  const [reviews,   setReviews]   = useState([]);
  const [enrolled,  setEnrolled]  = useState(false);
  const [wishlisted,setWishlisted]= useState(false);
  const [loading,   setLoading]   = useState(true);
  const [paying,    setPaying]    = useState(false);
  const [expandSec, setExpandSec] = useState({});
  const [myRating,  setMyRating]  = useState(0);
  const [myComment, setMyComment] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [cr, rr] = await Promise.all([
          courseService.getOne(id),
          reviewService.list(id),
        ]);
        setCourse(cr.data.course);
        setReviews(rr.data.reviews);

        if (user) {
          const [er, wr] = await Promise.all([
            enrollmentService.check(id),
            wishlistService.get(),
          ]);
          setEnrolled(er.data.enrolled);
          setWishlisted(wr.data.courses.some(c => c._id === id));
        }
      } catch {
        toast.error('Failed to load course.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  const handlePayment = async () => {
    if (!user) return navigate('/login', { state: { from: `/courses/${id}` } });

    setPaying(true);
    try {
      const res = await paymentService.createOrder(id);
      const data = res.data;

      // Free course — already enrolled on backend
      if (data.free) {
        setEnrolled(true);
        toast.success('Enrolled successfully! 🎉');
        navigate(`/watch/${id}`);
        return;
      }

      // Load Razorpay
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Razorpay failed to load. Check your internet.');
        return;
      }

      const options = {
        key:         data.key,
        amount:      data.order.amount,
        currency:    data.order.currency,
        name:        'CourseHub',
        description: data.course.name,
        image:       data.course.thumbnail
                       ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${data.course.thumbnail}`
                       : undefined,
        order_id:    data.order.id,
        handler: async (response) => {
          try {
            await paymentService.verify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              courseId: id,
            });
            setEnrolled(true);
            toast.success('Payment successful! You are now enrolled 🎉');
            navigate(`/watch/${id}`);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name:  user.name  || '',
          email: user.email || '',
        },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast('Payment cancelled.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setPaying(false);
      });
      rzp.open();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
      setPaying(false);
    }
  };

  // Play first video free (no login needed for preview)
  const handleFreePreview = () => {
    const firstVideo = course?.sections?.[0]?.videos?.[0];
    if (!firstVideo) return toast.error('No preview available.');
    navigate(`/watch/${id}/${firstVideo._id}`);
  };

  const handleWishlist = async () => {
    if (!user) return toast.error('Please login first.');
    const res = await wishlistService.toggle(id);
    setWishlisted(res.data.added);
    toast.success(res.data.message);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!myRating) return toast.error('Please select a rating.');
    setReviewing(true);
    try {
      const res = await reviewService.add(id, { rating: myRating, comment: myComment });
      setReviews(prev => [res.data.review, ...prev.filter(r => r.user._id !== user._id)]);
      toast.success('Review submitted!');
      setMyRating(0); setMyComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="skeleton h-8 w-3/4 rounded-xl" />
          <div className="skeleton h-5 w-1/2 rounded-xl" />
          <div className="skeleton h-48 w-full rounded-xl" />
        </div>
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    </div>
  );

  if (!course) return <div className="text-center py-20">Course not found.</div>;

  const totalVideos = course.sections?.reduce((a, s) => a + (s.videos?.length || 0), 0) || 0;
  const freeVideos  = course.sections?.reduce((a, s) => a + (s.videos?.filter(v => v.isFree).length || 0), 0) || 0;
  const discount    = course.originalPrice > 0 && course.price < course.originalPrice
    ? Math.round((1 - course.price / course.originalPrice) * 100) : 0;
  const isFree      = course.price === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <Link to="/courses" className="hover:underline">Courses</Link>
              <span>/</span>
              <span>{course.category}</span>
            </div>
            <h1 className="text-3xl font-bold mb-3 leading-tight">{course.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{course.shortDesc || course.description?.slice(0, 150)}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
              {course.rating > 0 && (
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star className="w-4 h-4 fill-current" />
                  {course.rating.toFixed(1)}
                  <span className="text-gray-400 font-normal">({course.ratingCount} ratings)</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-gray-500"><Users className="w-4 h-4" />{course.enrollmentCount} students</span>
              <span className="flex items-center gap-1 text-gray-500"><Globe className="w-4 h-4" />{course.language}</span>
              <span className="badge-gray">{course.level}</span>
            </div>

            {course.instructor && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Created by</span>
                <span className="font-semibold text-gray-900 dark:text-white">{course.instructor.name}</span>
              </div>
            )}
          </div>

          {/* Thumbnail */}
          {course.thumbnail && (
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800 cursor-pointer group"
              onClick={enrolled ? () => navigate(`/watch/${id}`) : handleFreePreview}>
              <img src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-gray-900 ml-1" />
                </div>
                <p className="text-white text-sm mt-3 font-medium">
                  {enrolled ? 'Continue Learning' : 'Watch Free Preview'}
                </p>
              </div>
            </div>
          )}

          {/* What you'll learn */}
          {course.whatYouLearn?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">What You'll Learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.whatYouLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {course.requirements?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3">Requirements</h2>
              <ul className="space-y-2">
                {course.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Curriculum */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Course Content</h2>
              <span className="text-sm text-gray-500">{totalVideos} lectures · {course.duration}</span>
            </div>
            <div className="space-y-2">
              {course.sections?.map((section, sIdx) => (
                <div key={section._id} className="card overflow-hidden">
                  <button
                    onClick={() => setExpandSec(prev => ({ ...prev, [section._id]: !prev[section._id] }))}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="font-semibold text-sm text-left">{section.title}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-gray-400">{section.videos?.length} lectures</span>
                      {expandSec[section._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {expandSec[section._id] && section.videos?.map((video, vIdx) => {
                    // First video of first section is always free preview
                    const isPreview = sIdx === 0 && vIdx === 0;
                    const canPlay   = enrolled || isPreview;
                    return (
                      <div
                        key={video._id}
                        onClick={() => canPlay && navigate(`/watch/${id}/${video._id}`)}
                        className={`flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 transition-colors
                          ${canPlay ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                      >
                        <div className="flex items-center gap-3">
                          {canPlay
                            ? <Play className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            : <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          }
                          <span className="text-sm">{video.title}</span>
                          {isPreview && <span className="badge-green text-xs">Free Preview</span>}
                        </div>
                        {video.duration > 0 && (
                          <span className="text-xs text-gray-400">{Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2,'0')}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-bold mb-3">About This Course</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{course.description}</p>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-bold mb-4">Student Reviews</h2>
            {course.rating > 0 && (
              <div className="card p-5 flex items-center gap-6 mb-5">
                <div className="text-center">
                  <div className="text-5xl font-black">{course.rating.toFixed(1)}</div>
                  <StarRating rating={Math.round(course.rating)} readonly />
                  <div className="text-sm text-gray-400 mt-1">{course.ratingCount} ratings</div>
                </div>
              </div>
            )}

            {enrolled && (
              <div className="card p-5 mb-5">
                <h3 className="font-semibold mb-3">Write a Review</h3>
                <form onSubmit={handleReview} className="space-y-3">
                  <StarRating rating={myRating} onChange={setMyRating} />
                  <textarea className="input min-h-[80px] resize-none" placeholder="Share your experience..."
                    value={myComment} onChange={e => setMyComment(e.target.value)} />
                  <button type="submit" disabled={reviewing} className="btn-primary text-sm">
                    {reviewing ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {reviews.length > 0 ? reviews.map(r => (
                <div key={r._id} className="card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold">
                      {r.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{r.user?.name}</div>
                      <StarRating rating={r.rating} readonly />
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>}
                </div>
              )) : (
                <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Buy card ──────────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-20 h-fit">
          <div className="card p-6 shadow-xl">
            {course.thumbnail && (
              <div className="rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800 mb-5">
                <img src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${course.thumbnail}`} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-black">
                {isFree ? 'Free' : `₹${course.price.toLocaleString()}`}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-gray-400 line-through text-lg">₹{course.originalPrice.toLocaleString()}</span>
                  <span className="badge-green">{discount}% off</span>
                </>
              )}
            </div>

            {/* CTA */}
            {enrolled ? (
              <Link to={`/watch/${id}`} className="btn-primary w-full justify-center py-3 text-base mb-3 flex items-center gap-2">
                <Play className="w-5 h-5" /> Continue Learning
              </Link>
            ) : (
              <>
                <button onClick={handlePayment} disabled={paying}
                  className="btn-primary w-full justify-center py-3 text-base mb-2 flex items-center gap-2">
                  {paying
                    ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    : isFree ? 'Enroll for Free' : `Buy Now — ₹${course.price.toLocaleString()}`
                  }
                </button>
                <button onClick={handleFreePreview}
                  className="btn-secondary w-full justify-center py-2.5 text-sm mb-3 flex items-center gap-2">
                  <Play className="w-4 h-4" /> Watch Free Preview
                </button>
              </>
            )}

            <button onClick={handleWishlist} className="btn-secondary w-full justify-center py-2.5 gap-2 mb-4 flex items-center">
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>

            {/* Course info */}
            <div className="space-y-2.5 text-sm">
              {[
                [Clock,    'Duration',     course.duration],
                [BookOpen, 'Lectures',     `${totalVideos} lectures`],
                [Award,    'Level',        course.level],
                [Globe,    'Language',     course.language],
                [Play,     'Free Preview', '1st video free'],
              ].map(([Icon, label, value]) => (
                <div key={label} className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-2"><Icon className="w-4 h-4" />{label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}