import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Save, ArrowLeft, Plus, Trash2, Upload, X, Video, BookOpen,
  ChevronDown, ChevronUp, Image, Pencil   // ← add Pencil
} from 'lucide-react';
import { courseService } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Web Development','Mobile Development','Data Science','Machine Learning','Cybersecurity','Design','Business','Marketing','Photography','Music','Other'];
const LEVELS     = ['Beginner','Intermediate','Advanced','All Levels'];

export default function AddEditCourse() {
  const { id }   = useParams();
  const isEdit   = !!id;
  const navigate = useNavigate();

  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(isEdit);
  const [thumbPrev,setThumbPrev]= useState('');
  const [sections, setSections] = useState([]);
  const [expandSec,setExpandSec]= useState({});
  const [uploadingVideo, setUploadingVideo] = useState(null); // sectionId

  const [form, setForm] = useState({
    title: '', description: '', shortDesc: '', price: '', originalPrice: '',
    category: '', level: 'Beginner', language: 'English', duration: '',
    thumbnail: null, isPublished: false, isFeatured: false,
    tags: '', requirements: '', whatYouLearn: '',
  });

  // Load existing course
  useEffect(() => {
    if (!isEdit) return;
    courseService.getOne(id)
      .then(r => {
        const c = r.data.course;
        setForm({
          title: c.title, description: c.description, shortDesc: c.shortDesc || '',
          price: c.price, originalPrice: c.originalPrice || '',
          category: c.category, level: c.level, language: c.language, duration: c.duration || '',
          thumbnail: null, isPublished: c.isPublished, isFeatured: c.isFeatured || false,
          tags: c.tags?.join(', ') || '',
          requirements: c.requirements?.join('\n') || '',
          whatYouLearn: c.whatYouLearn?.join('\n') || '',
        });
        const thumb = c.thumbnail || '';
        setThumbPrev(thumb && !thumb.startsWith('http') && !thumb.startsWith('blob')
          ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${thumb}`
          : thumb);
        setSections(c.sections || []);
      })
      .catch(() => toast.error('Failed to load course.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleThumbnail = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setForm(p => ({ ...p, thumbnail: f }));
    setThumbPrev(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'tags')         fd.append(k, JSON.stringify(v.split(',').map(t => t.trim()).filter(Boolean)));
        else if (k === 'requirements' || k === 'whatYouLearn') fd.append(k, JSON.stringify(v.split('\n').filter(Boolean)));
        else if (v !== null && v !== undefined) fd.append(k, v);
      });

      if (isEdit) {
        await courseService.update(id, fd);
        toast.success('Course updated!');
      } else {
        const res = await courseService.create(fd);
        toast.success('Course created!');
        navigate(`/admin/courses/edit/${res.data.course._id}`);
        return;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  // Section management
  const addSection = async () => {
    if (!isEdit) return toast.error('Save course first before adding sections.');
    const title = prompt('Section title:');
    if (!title?.trim()) return;
    try {
      const res = await courseService.addSection(id, { title });
      setSections(prev => [...prev, { ...res.data.section, videos: [] }]);
      toast.success('Section added!');
    } catch { toast.error('Failed to add section.'); }
  };

  // Rename section
const renameSection = async (sectionId, currentTitle) => {
  const newTitle = prompt('New section title:', currentTitle);
  if (!newTitle?.trim() || newTitle.trim() === currentTitle) return;
  try {
    const res = await courseService.updateSection(id, sectionId, { title: newTitle.trim() });
    setSections(prev => prev.map(s =>
      s._id === sectionId ? { ...s, title: res.data.section.title } : s
    ));
    toast.success('Section renamed!');
  } catch { toast.error('Failed to rename section.'); }
};

// Delete section
const deleteSection = async (sectionId) => {
  if (!confirm('Delete this section and ALL its videos? This cannot be undone.')) return;
  try {
    await courseService.deleteSection(id, sectionId);
    setSections(prev => prev.filter(s => s._id !== sectionId));
    toast.success('Section deleted.');
  } catch { toast.error('Failed to delete section.'); }
};

  // Video upload
  const addVideo = async (sectionId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const title = prompt('Video title:', file.name.replace(/\.[^/.]+$/, '')) || file.name;
      setUploadingVideo(sectionId);
      try {
        const fd = new FormData();
        fd.append('video', file);
        fd.append('title', title);
        fd.append('isFree', 'false');
        const res = await courseService.addVideo(id, sectionId, fd);
        setSections(prev => prev.map(s =>
          s._id === sectionId ? { ...s, videos: [...(s.videos || []), res.data.video] } : s
        ));
        toast.success('Video uploaded!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Upload failed.');
      } finally {
        setUploadingVideo(null);
      }
    };
    input.click();
  };

  const deleteVideo = async (sectionId, videoId) => {
    if (!confirm('Delete this video?')) return;
    try {
      await courseService.deleteVideo(id, sectionId, videoId);
      setSections(prev => prev.map(s =>
        s._id === sectionId ? { ...s, videos: s.videos.filter(v => v._id !== videoId) } : s
      ));
      toast.success('Video deleted.');
    } catch { toast.error('Delete failed.'); }
  };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/courses" className="btn-ghost gap-2 p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit Course' : 'Add New Course'}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{isEdit ? 'Update course details and content' : 'Fill in the details to create a new course'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Main form ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Basic Info */}
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold">Basic Information</h2>
              <div>
                <label className="label">Course Title *</label>
                <input className="input" placeholder="e.g. Complete React Developer Bootcamp" value={form.title} onChange={set('title')} required />
              </div>
              <div>
                <label className="label">Short Description</label>
                <input className="input" placeholder="One-liner summary shown in cards" value={form.shortDesc} onChange={set('shortDesc')} />
              </div>
              <div>
                <label className="label">Full Description *</label>
                <textarea className="input min-h-[140px] resize-none" placeholder="Detailed course description..." value={form.description} onChange={set('description')} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category *</label>
                  <select className="input" value={form.category} onChange={set('category')} required>
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Difficulty Level</label>
                  <select className="input" value={form.level} onChange={set('level')}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">Price (₹) *</label>
                  <input type="number" className="input" placeholder="0 for free" min="0" value={form.price} onChange={set('price')} required />
                </div>
                <div>
                  <label className="label">Original Price (₹)</label>
                  <input type="number" className="input" placeholder="Strike-through price" min="0" value={form.originalPrice} onChange={set('originalPrice')} />
                </div>
                <div>
                  <label className="label">Duration</label>
                  <input className="input" placeholder="e.g. 12h 30m" value={form.duration} onChange={set('duration')} />
                </div>
              </div>
              <div>
                <label className="label">Language</label>
                <input className="input" placeholder="English" value={form.language} onChange={set('language')} />
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold">Learning Outcomes</h2>
              <div>
                <label className="label">What Students Will Learn (one per line)</label>
                <textarea className="input min-h-[100px] resize-none font-mono text-sm" placeholder={"Build full-stack web apps\nUnderstand core React concepts\nDeploy to production"} value={form.whatYouLearn} onChange={set('whatYouLearn')} />
              </div>
              <div>
                <label className="label">Requirements / Prerequisites (one per line)</label>
                <textarea className="input min-h-[80px] resize-none font-mono text-sm" placeholder={"Basic HTML & CSS knowledge\nFamiliar with JavaScript"} value={form.requirements} onChange={set('requirements')} />
              </div>
              <div>
                <label className="label">Tags (comma separated)</label>
                <input className="input" placeholder="react, javascript, web development" value={form.tags} onChange={set('tags')} />
              </div>
            </div>

            {/* Course Content (Sections + Videos) — only when editing */}
            {isEdit && (
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Course Content</h2>
                  <button type="button" onClick={addSection} className="btn-secondary gap-2 text-sm">
                    <Plus className="w-4 h-4" /> Add Section
                  </button>
                </div>

                {sections.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No sections yet. Click "Add Section" to start building your curriculum.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sections.map(section => (
                      <div key={section._id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                       <div className="w-full flex items-center justify-between p-3.5">
  <button
    type="button"
    onClick={() => setExpandSec(p => ({ ...p, [section._id]: !p[section._id] }))}
    className="flex items-center gap-2 flex-1 text-left hover:opacity-80 transition-opacity"
  >
    <BookOpen className="w-4 h-4 text-gray-400" />
    <span className="font-medium text-sm">{section.title}</span>
    <span className="badge-gray text-xs">{section.videos?.length || 0} videos</span>
  </button>
  <div className="flex items-center gap-1">
    <button
      type="button"
      onClick={() => renameSection(section._id, section.title)}
      className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
      title="Rename section"
    >
      <Pencil className="w-3.5 h-3.5" />
    </button>
    <button
      type="button"
      onClick={() => deleteSection(section._id)}
      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
      title="Delete section"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
    {expandSec[section._id] ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
  </div>
</div>

                        {expandSec[section._id] && (
                          <div className="border-t border-gray-100 dark:border-gray-800 p-3 space-y-2">
                            {section.videos?.map(video => (
                              <div key={video._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <Video className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm flex-1 truncate">{video.title}</span>
                                {video.duration > 0 && (
                                  <span className="text-xs text-gray-400">{Math.floor(video.duration/60)}:{String(video.duration%60).padStart(2,'0')}</span>
                                )}
                                <button type="button" onClick={() => deleteVideo(section._id, video._id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => addVideo(section._id)}
                              disabled={uploadingVideo === section._id}
                              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                            >
                              {uploadingVideo === section._id
                                ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Uploading...</>
                                : <><Upload className="w-4 h-4" />Upload Video</>
                              }
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Thumbnail + publish settings ─────────────────────────── */}
          <div className="space-y-5">
            {/* Thumbnail */}
            <div className="card p-5">
              <h2 className="font-semibold mb-3">Course Thumbnail</h2>
              <label className="block cursor-pointer">
                <div className={`relative rounded-xl overflow-hidden aspect-video ${thumbPrev ? '' : 'border-2 border-dashed border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 hover:opacity-90 transition-opacity`}>
                  {thumbPrev
                    ? <img src={thumbPrev} className="w-full h-full object-cover" alt="thumbnail" />
                    : <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <Image className="w-8 h-8 mb-2" />
                        <span className="text-sm">Click to upload thumbnail</span>
                        <span className="text-xs mt-1">JPG, PNG, WebP · Max 5MB</span>
                      </div>
                  }
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleThumbnail} />
              </label>
              {thumbPrev && (
                <button type="button" onClick={() => { setThumbPrev(''); setForm(p => ({ ...p, thumbnail: null })); }}
                  className="btn-ghost text-xs gap-1 mt-2 text-red-500 hover:text-red-700">
                  <X className="w-3 h-3" /> Remove
                </button>
              )}
            </div>

            {/* Publish settings */}
            <div className="card p-5 space-y-3">
              <h2 className="font-semibold mb-1">Settings</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative w-10 h-6 rounded-full transition-colors ${form.isPublished ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${form.isPublished ? 'translate-x-4' : ''}`} />
                  <input type="checkbox" className="hidden" checked={form.isPublished} onChange={set('isPublished')} />
                </div>
                <span className="text-sm font-medium">Published</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative w-10 h-6 rounded-full transition-colors ${form.isFeatured ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${form.isFeatured ? 'translate-x-4' : ''}`} />
                  <input type="checkbox" className="hidden" checked={form.isFeatured} onChange={set('isFeatured')} />
                </div>
                <span className="text-sm font-medium">Featured</span>
              </label>
            </div>

            {/* Save button */}
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3">
              {saving
                ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Saving...</>
                : <><Save className="w-4 h-4" />{isEdit ? 'Save Changes' : 'Create Course'}</>
              }
            </button>

            {isEdit && !sections.length && (
              <p className="text-xs text-gray-400 text-center">Save the course first, then add sections and videos above.</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
