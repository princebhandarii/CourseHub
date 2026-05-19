import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star, Clock, Users, BookOpen, Award, Play, Heart,
  ChevronDown, ChevronUp, CheckCircle, Lock, Globe
} from 'lucide-react';

import {
  courseService,
  enrollmentService,
  reviewService,
  wishlistService,
  paymentService
} from '../services/api';

import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function StarRating({ rating, onChange, readonly }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(s)}
          className={`transition-transform ${
            readonly ? '' : 'hover:scale-125 cursor-pointer'
          }`}
        >
          <Star
            className={`w-5 h-5 ${
              s <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
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

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export default function CourseDetail() {

  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [expandSec, setExpandSec] = useState({});
  const [myRating, setMyRating] = useState(0);
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
          setWishlisted(
            wr.data.courses.some(c => c._id === id)
          );
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

    if (!user) {
      return navigate('/login', {
        state: { from: `/courses/${id}` }
      });
    }

    setPaying(true);

    try {

      const res = await paymentService.createOrder(id);
      const data = res.data;

      // Free course
      if (data.free) {
        setEnrolled(true);
        toast.success('Enrolled successfully! 🎉');
        navigate(`/watch/${id}`);
        return;
      }

      // Load Razorpay
      const loaded = await loadRazorpayScript();

      if (!loaded) {
        toast.error('Razorpay failed to load.');
        return;
      }

      // ✅ FIXED THUMBNAIL ISSUE
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'CourseHub',
        description: data.course.name,

        // ✅ FIX
        image: data.course.thumbnail || undefined,

        order_id: data.order.id,

        handler: async (response) => {

          try {

            await paymentService.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: id,
            });

            setEnrolled(true);

            toast.success(
              'Payment successful! You are now enrolled 🎉'
            );

            navigate(`/watch/${id}`);

          } catch {
            toast.error(
              'Payment verification failed.'
            );
          }
        },

        prefill: {
          name: user.name || '',
          email: user.email || '',
        },

        theme: {
          color: '#6366f1',
        },

        modal: {
          ondismiss: () => {
            setPaying(false);
            toast('Payment cancelled.');
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', () => {
        toast.error('Payment failed.');
        setPaying(false);
      });

      rzp.open();

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        'Something went wrong.'
      );

      setPaying(false);
    }
  };

  const handleFreePreview = () => {

    const firstVideo =
      course?.sections?.[0]?.videos?.[0];

    if (!firstVideo) {
      return toast.error('No preview available.');
    }

    navigate(`/watch/${id}/${firstVideo._id}`);
  };

  const handleWishlist = async () => {

    if (!user) {
      return toast.error('Please login first.');
    }

    const res = await wishlistService.toggle(id);

    setWishlisted(res.data.added);

    toast.success(res.data.message);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        Loading...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        Course not found.
      </div>
    );
  }

  const totalVideos =
    course.sections?.reduce(
      (a, s) => a + (s.videos?.length || 0),
      0
    ) || 0;

  return (

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* LEFT */}

        <div className="lg:col-span-2 space-y-8">

          {/* TITLE */}

          <div>

            <h1 className="text-3xl font-bold mb-3">
              {course.title}
            </h1>

            <p className="text-gray-500 dark:text-gray-400">
              {course.description}
            </p>

          </div>

          {/* MAIN THUMBNAIL */}

          {course.thumbnail && (

            <div
              className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800 cursor-pointer group"
              onClick={
                enrolled
                  ? () => navigate(`/watch/${id}`)
                  : handleFreePreview
              }
            >

              {/* ✅ FIXED */}
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">

                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">

                  <Play className="w-8 h-8 text-gray-900 ml-1" />

                </div>

              </div>

            </div>
          )}

        </div>

        {/* RIGHT */}

        <div className="lg:sticky lg:top-20 h-fit">

          <div className="card p-6 shadow-xl">

            {/* RIGHT THUMBNAIL */}

            {course.thumbnail && (

              <div className="rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800 mb-5">

                {/* ✅ FIXED */}
                <img
                  src={course.thumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                />

              </div>
            )}

            {/* BUTTON */}

            <button
              onClick={handlePayment}
              disabled={paying}
              className="btn-primary w-full justify-center py-3 text-base mb-2 flex items-center gap-2"
            >

              {paying
                ? 'Processing...'
                : 'Buy Now'
              }

            </button>

            {/* INFO */}

            <div className="space-y-2.5 text-sm">

              <div className="flex items-center justify-between">
                <span>Lectures</span>
                <span>{totalVideos}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Language</span>
                <span>{course.language}</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
