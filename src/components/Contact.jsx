import { useState } from 'react';
import { Phone, Mail, MessageSquare } from 'lucide-react';
import { api } from '../api';
import { SITE } from '../config';
import { CONTACT_FAQ } from '../content';
import Faq from './Faq';
import StarPicker from './StarPicker';

const field = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand';

const Contact = () => {
  const [form, setForm] = useState({ username: '', email: '', stars: 0, comment: '' });
  const [status, setStatus] = useState(null); // { ok, text }
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.stars) return setStatus({ ok: false, text: 'Please choose a star rating.' });
    setBusy(true);
    setStatus(null);
    try {
      await api('/api/feedbacks', { method: 'POST', body: form });
      setStatus({ ok: true, text: 'Thank you! Your feedback was submitted.' });
      setForm({ username: '', email: '', stars: 0, comment: '' });
    } catch (err) {
      setStatus({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const cards = [
    { icon: Phone, title: 'Call us', body: 'Ring in the possibilities! Dial our number to bridge the gap between questions and answers.', lines: [SITE.landline, SITE.phone], href: `tel:${SITE.phone.replace(/[^+\d]/g, '')}` },
    { icon: Mail, title: 'Email us', body: 'Drop us an email for inquiries, collaborations, or personalised solutions.', lines: [SITE.email], href: `mailto:${SITE.email}` },
    { icon: MessageSquare, title: 'Share feedback', body: 'Your feedback is the heartbeat of our growth. Tell us how we are doing.', lines: ['Use the form below'], href: '#feedback' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl md:text-5xl mb-10">Contact <span className="text-brand">Us</span></h1>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map(({ icon: Icon, title, body, lines, href }) => (
          <a key={title} href={href} className="bg-white rounded-3xl shadow-sm hover:shadow-lg transition p-6 text-left no-underline text-ink">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-brand flex items-center justify-center mb-3"><Icon size={22} /></div>
            <h2 className="text-xl font-semibold mb-1">{title}</h2>
            <p className="text-gray-600 text-sm mb-3">{body}</p>
            {lines.map((l) => <p key={l} className="font-medium">{l}</p>)}
          </a>
        ))}
      </div>

      <div className="-mx-4"><Faq items={CONTACT_FAQ} title="Before you write" /></div>

      <section id="feedback" className="max-w-2xl mx-auto mt-14 bg-white rounded-3xl shadow-md p-8 scroll-mt-24">
        <h2 className="text-3xl font-semibold text-center mb-8">Leave a Feedback</h2>
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <input className={field} placeholder="Your name" aria-label="Your name" required value={form.username} onChange={set('username')} />
          <input className={field} type="email" placeholder="Your email" aria-label="Your email" required value={form.email} onChange={set('email')} />
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Rating:</span>
            <StarPicker value={form.stars} onChange={(n) => setForm({ ...form, stars: n })} size="text-2xl" />
          </div>
          <textarea className={`${field} h-32 resize-none`} placeholder="Write a comment" aria-label="Comment" required value={form.comment} onChange={set('comment')} />
          {status && (
            <p className={`text-center font-medium ${status.ok ? 'text-green-600' : 'text-red-600'}`} role="status">{status.text}</p>
          )}
          <div className="text-center">
            <button type="submit" disabled={busy} className="bg-brand hover:bg-brand-dark text-white px-8 py-2.5 rounded-full font-semibold transition disabled:opacity-60">
              {busy ? 'Sending…' : 'Submit'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Contact;
