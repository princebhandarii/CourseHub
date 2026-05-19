import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Menu, X, CheckCircle, Circle,
  Play, ArrowLeft
} from 'lucide-react';
import { courseService, progressService, enrollmentService } from '../../services/api';
import toast from 'react-hot-toast';

export default function WatchCourse() {
  const { courseId, videoId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const progressTimer = useRef(null);

  const [course,     setCourse]     = useState(null);
  const [curVideo,   setCurVideo]   = useState(null);
  const [progress,   setProgress]   = useState({});
  const [sideOpen,   setSideOpen]   = useState(true);
  const [loading,    setLoading]    = useState(true);
  const [flatVideos, setFlatVideos] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cr, pr] = await Promise.all([
          courseService.getOne(courseId),
          progressService.getCourse(courseId),
        ]);
        const c = cr.data.course;
        setCourse(c);

        // Build flat video list
        const flat = c.sections?.flatMap(
          s => s.videos?.map(v => ({ ...v, sectionTitle: s.title })) || []
        ) || [];
        setFlatVideos(flat);

        // Build progress map
        const pMap = {};
        pr.data.progressList.forEach(p => { pMap[p.video] = p; });
        setProgress(pMap);

        // ── Enrollment check ──────────────────────────────────────────────
        const enrollRes = await enrollmentService.check(courseId);
        const isEnrolled = enrollRes.data.enrolled;

        if (!isEnrolled) {
          const firstVideo    = flat[0];
          const requestedVideo = videoId ? flat.find(v => v._id === videoId) : firstVideo;
          const isFirstVideo  = requestedVideo?._id === firstVideo?._id;

          if (!isFirstVideo) {
            toast.error('Please purchase the course to watch all videos.');
            navigate(`/courses/${courseId}`);
            return;
          }

          // Not enrolled — only show first video, lock sidebar clicks
          if (firstVideo) setCurVideo(firstVideo);
          setLoading(false);
          return;
        }
        // ─────────────────────────────────────────────────────────────────

        // Set current video
        const target = videoId ? flat.find(v => v._id === videoId) : flat[0];
        if (target) setCurVideo(target);

      } catch {
        toast.error('Failed to load course.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId, videoId]);

  // Navigate to video — check enrollment before switching
  const goToVideo = useCallback(async (video) => {
    try {
      const enrollRes  = await enrollmentService.check(courseId);
      const isEnrolled = enrollRes.data.enrolled;

      if (!isEnrolled) {
        toast.error('Purchase the course to access all videos.');
        navigate(`/courses/${courseId}`);
        return;
      }

      setCurVideo(video);
      navigate(`/watch/${courseId}/${video._id}`, { replace: true });
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    } catch {
      toast.error('Something went wrong.');
    }
  }, [courseId, navigate]);

  // Save progress periodically
  const saveProgress = useCallback(async () => {
    if (!curVideo || !videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (!duration) return;
    try {
      await progressService.update({
        courseId,
        videoId:     curVideo._id,
        watchedTime: Math.floor(currentTime),
        duration:    Math.floor(duration),
      });
      const completed = currentTime / duration >= 0.9;
      setProgress(prev => ({
        ...prev,
        [curVideo._id]: { completed, watchedTime: currentTime, duration },
      }));
    } catch {}
  }, [courseId, curVideo]);

  useEffect(() => {
    progressTimer.current = setInterval(saveProgress, 10000);
    return () => clearInterval(progressTimer.current);
  }, [saveProgress]);

  const curIdx   = flatVideos.findIndex(v => v._id === curVideo?._id);
  const prevVid  = flatVideos[curIdx - 1];
  const nextVid  = flatVideos[curIdx + 1];
  const completed = Object.values(progress).filter(p => p.completed).length;
  const pct      = flatVideos.length > 0
    ? Math.round((completed / flatVideos.length) * 100)
    : 0;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-10 h-10 border-4 border-gray-700 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!course) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      Course not found.
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 z-10">
        <div className="flex items-center gap-3">
          <Link
            to={`/courses/${courseId}`}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="font-semibold text-sm line-clamp-1 hidden sm:block">{course.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{pct}%</span>
          </div>
          <button
            onClick={() => setSideOpen(o => !o)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {sideOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Main Area ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Video + controls */}
        <div className="flex-1 flex flex-col overflow-auto">

          {/* Video player */}
          <div className="relative bg-black aspect-video w-full">
            {curVideo ? (
              <video
                ref={videoRef}
                key={curVideo._id}
                className="w-full h-full"
                controls
                autoPlay
                onEnded={() => { saveProgress(); if (nextVid) goToVideo(nextVid); }}
              >
                <source src={curVideo.url} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-16 h-16 text-gray-600" />
              </div>
            )}
          </div>

          {/* Video info & nav */}
          <div className="p-5 max-w-4xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">{curVideo?.sectionTitle}</p>
                <h2 className="text-xl font-bold">{curVideo?.title || 'Select a lesson'}</h2>
              </div>
              {curVideo && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {progress[curVideo._id]?.completed
                    ? <CheckCircle className="w-5 h-5 text-green-500" />
                    : <Circle className="w-5 h-5 text-gray-600" />
                  }
                  <span className="text-xs text-gray-400">
                    {progress[curVideo._id]?.completed ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              )}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center gap-3">
              <button
                disabled={!prevVid}
                onClick={() => goToVideo(prevVid)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                disabled={!nextVid}
                onClick={() => goToVideo(nextVid)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {curVideo?.description && (
              <p className="text-sm text-gray-400 mt-4 leading-relaxed">{curVideo.description}</p>
            )}
          </div>
        </div>

        {/* ── Sidebar: Curriculum ───────────────────────────────────────── */}
        {sideOpen && (
          <div className="w-80 border-l border-gray-800 bg-gray-900 overflow-y-auto flex-shrink-0 hidden md:block">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-semibold text-sm">Course Content</h3>
              <p className="text-xs text-gray-500 mt-0.5">{completed}/{flatVideos.length} completed</p>
            </div>

            {course.sections?.map((section, sIdx) => (
              <div key={section._id}>
                <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-800">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {section.title}
                  </p>
                </div>
                {section.videos?.map((video, vIdx) => {
                  const isActive    = curVideo?._id === video._id;
                  const isComplete  = progress[video._id]?.completed;
                  const isFirstVid  = sIdx === 0 && vIdx === 0;

                  return (
                    <button
                      key={video._id}
                      onClick={() => goToVideo({ ...video, sectionTitle: section.title })}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-800 transition-colors border-b border-gray-800/50 ${isActive ? 'bg-gray-800' : ''}`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {isComplete
                          ? <CheckCircle className="w-4 h-4 text-green-500" />
                          : isActive
                            ? <Play className="w-4 h-4 text-white" />
                            : <Circle className="w-4 h-4 text-gray-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-snug line-clamp-2 ${isActive ? 'text-white font-medium' : 'text-gray-300'}`}>
                          {video.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {video.duration > 0 && (
                            <p className="text-xs text-gray-600">
                              {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                            </p>
                          )}
                          {isFirstVid && (
                            <span className="text-xs text-green-400 font-medium">Free Preview</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
