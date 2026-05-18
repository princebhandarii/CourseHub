import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form,    setForm]    = useState({ name: '', email: '', subject: '', message: '' });
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', form);
      setSent(true);
      toast.success("Message sent! We'll get back to you soon.");
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const info = [
    { icon: Mail,   label: 'Email',   value: 'princebhandari22@gmail.com' },
    { icon: Phone,  label: 'Phone',   value: '+91 98765 43210' },
    { icon: MapPin, label: 'Address', value: 'Surat, Gujarat, India' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">Get in Touch</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Have a question or feedback? Send us a message and we will respond within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Contact Info */}
        <div className="space-y-4">
          {info.map(({ icon: Icon, label, value }) => (
            <div key={label} className="card p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm">{label}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{value}</div>
              </div>
            </div>
          ))}

          <div className="card p-5">
            <h3 className="font-semibold mb-2">Response Time</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <div className="flex justify-between"><span>Mon to Fri</span><span>Within 24h</span></div>
              <div className="flex justify-between"><span>Saturday</span><span>Within 48h</span></div>
              <div className="flex justify-between"><span>Sunday</span><span>Next business day</span></div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 card p-6">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Message Sent!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                We will get back to you within 24 hours.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                A confirmation has been sent to <strong>{form.email}</strong>
              </p>
              <button
                onClick={() => { setSent(false); setForm({ name:'', email:'', subject:'', message:'' }); }}
                className="btn-secondary"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Your Name</label>
                  <input className="input" placeholder="John Doe" value={form.name} onChange={set('name')} required />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                </div>
              </div>

              <div>
                <label className="label">Subject</label>
                <input className="input" placeholder="How can we help?" value={form.subject} onChange={set('subject')} required />
              </div>

              <div>
                <label className="label">Message</label>
                <textarea
                  className="input min-h-[140px] resize-none"
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={set('message')}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary gap-2">
                {loading
                  ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : <Send className="w-4 h-4" />
                }
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}